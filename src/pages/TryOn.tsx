import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { parseItemId, toCard } from "../catalog/generate";
import type { CardItem, CatalogItem } from "../catalog/types";
import { ProductImage } from "../components/ProductImage";
import { Loading, Page } from "../components/Page";
import { anchorFor, fitTransform, LM, type GarmentTransform, type Landmark } from "../ar/anchors";
import { TRY_ON_COPY } from "../ar/copy";
import { drawGarment, loadGarmentSprite, type GarmentSprite } from "../ar/garmentSprite";
import { createPoseTracker, type PoseTracker } from "../ar/pose";
import { downloadBlob, renderSnapshot, snapshotFilename } from "../ar/snapshot";
import { TransformSmoother } from "../ar/smooth";
import { syntheticLandmarks } from "../ar/syntheticPose";
import { unlock } from "../lib/achievements";
import { loadShard, useAsync } from "../lib/catalogApi";
import { useShop } from "../lib/store";
import "../ar/tryon.css";

type Facing = "user" | "environment";
type ErrorKey = "denied" | "noCamera" | "unsupported" | "modelFailed";
type Phase = "idle" | "starting" | "running" | { error: ErrorKey };

/** Frames without a transform before the garment is hidden. */
const LOST_MS = 500;
const DEBUG_W = 640;
const DEBUG_H = 480;

const BONES: Array<[number, number]> = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28], [0, 7], [0, 8],
];

function errorKeyFor(e: unknown): ErrorKey {
  const name = (e as { name?: string } | null)?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "noCamera";
  return "noCamera";
}

export function TryOn() {
  const { id = "" } = useParams();
  const parsed = parseItemId(id);
  const data = useAsync(() => (parsed ? loadShard(parsed.region, parsed.category) : Promise.reject(new Error("bad id"))), id);
  if (data.status === "loading") return <Page><Loading label="Fetching the goods" /></Page>;
  const item = data.status === "ready" ? data.data.find((i) => i.id === id) : undefined;
  if (!item) {
    return (
      <Page className="center">
        <h1>This item never came either.</h1>
        <Link to="/" className="btn btn-primary">Back to the shop</Link>
      </Page>
    );
  }
  return anchorFor(item.silhouette) ? <Stage key={item.id} item={item} /> : <Fallback item={item} message={TRY_ON_COPY.notTryable} />;
}

function Fallback({ item, message }: { item: CardItem; message: string }) {
  return (
    <Page className="tryon">
      <div className="tryon-card" role="status">
        <h1 className="tryon-title">{item.name}</h1>
        <p className="tryon-msg">{message}</p>
        <ProductImage item={item} className="tryon-photo" />
        <Link to={`/item/${item.id}`} className="btn btn-primary">{TRY_ON_COPY.close}</Link>
      </div>
    </Page>
  );
}

function Stage({ item }: { item: CatalogItem }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const debug = params.get("debug") === "landmarks";
  const add = useShop((s) => s.add);
  const anchor = anchorFor(item.silhouette)!;

  const [phase, setPhase] = useState<Phase>(debug ? "running" : "idle");
  const [facing, setFacing] = useState<Facing>("user");
  const [canFlip, setCanFlip] = useState(false);
  const [lost, setLost] = useState(false);
  const [added, setAdded] = useState(false);
  const [aspect, setAspect] = useState(debug ? `${DEBUG_W} / ${DEBUG_H}` : "3 / 4");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<PoseTracker | null>(null);
  const spriteRef = useRef<GarmentSprite | null>(null);
  const runRef = useRef(0);
  const cancelRef = useRef<(() => void) | null>(null);
  const addedTimer = useRef<number | undefined>(undefined);
  const stageRef = useRef<HTMLDivElement>(null);

  /** Stops the loop, every track and the tracker. Bumping runRef also aborts an in-flight start. */
  const stop = useCallback(() => {
    runRef.current++;
    cancelRef.current?.();
    cancelRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    trackerRef.current?.close();
    trackerRef.current = null;
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.srcObject = null;
    }
  }, []);

  /** The render loop. Draws on the overlay canvas from a tracker (or synthetic) pose. */
  const startLoop = useCallback(
    (run: number, isDebug: boolean) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const smoother = new TransformSmoother({ reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
      const backdrop = getComputedStyle(document.documentElement).getPropertyValue("--paper-2").trim() || "#f4ead6";
      const stroke = getComputedStyle(document.documentElement).getPropertyValue("--ink-2").trim() || "#463b5e";
      let lastGood: GarmentTransform | null = null;
      let lastSeen = performance.now();
      let isLost = false;
      let drewOnce = false;
      let handle = 0;
      let kind: "v" | "raf" = "raf";

      const frame = () => {
        if (runRef.current !== run) return;
        const now = performance.now();
        const w = isDebug ? DEBUG_W : video!.videoWidth;
        const h = isDebug ? DEBUG_H : video!.videoHeight;
        if (w && h) {
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            if (!isDebug) setAspect(`${w} / ${h}`);
          }
          let lms: Landmark[] | null = null;
          try {
            lms = isDebug ? syntheticLandmarks(now, w, h) : (trackerRef.current?.detect(video!, now) ?? null);
          } catch {
            lms = null;
          }
          const raw = lms ? fitTransform(anchor, lms, w, h) : null;
          ctx.clearRect(0, 0, w, h);
          if (isDebug) {
            ctx.fillStyle = backdrop;
            ctx.fillRect(0, 0, w, h);
            if (lms) {
              ctx.strokeStyle = stroke;
              ctx.lineWidth = 4;
              ctx.lineCap = "round";
              ctx.beginPath();
              for (const [a, b] of BONES) {
                ctx.moveTo(lms[a].x * w, lms[a].y * h);
                ctx.lineTo(lms[b].x * w, lms[b].y * h);
              }
              ctx.stroke();
              const nose = lms[LM.nose];
              const ear = lms[LM.leftEar];
              const r = Math.abs(ear.x - lms[LM.rightEar].x) * w * 0.6;
              ctx.beginPath();
              ctx.arc(nose.x * w, nose.y * h, r, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
          if (raw) {
            lastSeen = now;
            lastGood = smoother.next(raw, now);
            if (isLost) {
              isLost = false;
              setLost(false);
            }
          } else if (now - lastSeen > LOST_MS) {
            if (!isLost) {
              isLost = true;
              lastGood = null;
              smoother.reset();
              setLost(true);
            }
          }
          const sprite = spriteRef.current;
          if (lastGood && sprite) {
            drawGarment(ctx, sprite, lastGood);
            if (!drewOnce) {
              drewOnce = true;
              // Only a real try-on counts; the debug figure doesn't earn the achievement.
              if (!isDebug) unlock("fitting-room");
            }
          }
        }
        schedule();
      };

      const schedule = () => {
        if (runRef.current !== run) return;
        if (!isDebug && video && "requestVideoFrameCallback" in video) {
          kind = "v";
          handle = video.requestVideoFrameCallback(frame);
        } else {
          kind = "raf";
          handle = requestAnimationFrame(frame);
        }
      };

      cancelRef.current = () => {
        if (kind === "v") video?.cancelVideoFrameCallback(handle);
        else cancelAnimationFrame(handle);
      };
      schedule();
    },
    [anchor],
  );

  const openStream = useCallback(async (face: Facing, run: number): Promise<boolean> => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: face, width: { ideal: 640 } },
      audio: false,
    });
    if (runRef.current !== run) {
      stream.getTracks().forEach((t) => t.stop());
      return false;
    }
    streamRef.current = stream;
    const v = videoRef.current!;
    v.srcObject = stream;
    await v.play();
    return runRef.current === run;
  }, []);

  const start = useCallback(
    async (face: Facing) => {
      stop();
      const run = runRef.current;
      setLost(false);
      if (!navigator.mediaDevices?.getUserMedia) {
        setPhase({ error: "unsupported" });
        return;
      }
      setPhase("starting");
      // Load the model alongside the camera rather than after it, so the camera isn't sitting on
      // during the download. getUserMedia is still called in this tick, inside the tap (iOS needs that).
      const trackerLoad = createPoseTracker();
      try {
        if (!(await openStream(face, run))) {
          trackerLoad.then((t) => t.close(), () => undefined);
          return;
        }
      } catch (e) {
        trackerLoad.then((t) => t.close(), () => undefined);
        // play() can fail after the stream opened; release the camera before showing the error.
        if (runRef.current === run) {
          stop();
          setPhase({ error: errorKeyFor(e) });
        }
        return;
      }
      try {
        const tracker = await trackerLoad;
        if (runRef.current !== run) {
          tracker.close();
          return;
        }
        trackerRef.current = tracker;
      } catch {
        if (runRef.current === run) {
          stop();
          setPhase({ error: "modelFailed" });
        }
        return;
      }
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (runRef.current === run) setCanFlip(devices.filter((d) => d.kind === "videoinput").length > 1);
      } catch {
        // flip stays hidden
      }
      if (runRef.current !== run) return;
      setFacing(face);
      setPhase("running");
      startLoop(run, false);
    },
    [openStream, startLoop, stop],
  );

  const flip = useCallback(async () => {
    const next: Facing = facing === "user" ? "environment" : "user";
    const tracker = trackerRef.current;
    if (!tracker) return;
    cancelRef.current?.();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const run = ++runRef.current;
    try {
      if (!(await openStream(next, run))) return;
    } catch (e) {
      if (runRef.current === run) {
        stop();
        setPhase({ error: errorKeyFor(e) });
      }
      return;
    }
    setFacing(next);
    startLoop(run, false);
  }, [facing, openStream, startLoop, stop]);

  // Sprite for the garment.
  useEffect(() => {
    let alive = true;
    loadGarmentSprite(item).then((s) => {
      if (alive) spriteRef.current = s;
    }, () => undefined);
    return () => {
      alive = false;
    };
  }, [item]);

  // Debug path: no camera, no model.
  useEffect(() => {
    if (!debug) return;
    const run = ++runRef.current;
    startLoop(run, true);
    return stop;
  }, [debug, startLoop, stop]);

  // Release the camera on unmount and whenever the tab is hidden (a restart needs a tap).
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && !debug) {
        stop();
        setPhase((p) => (p === "running" || p === "starting" ? "idle" : p));
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      if (!debug) stop();
    };
  }, [debug, stop]);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  // The Start button unmounts once the camera starts, so move focus somewhere sensible.
  useEffect(() => {
    if (phase === "running" && !debug) stageRef.current?.focus();
  }, [phase, debug]);

  const onSnapshot = async () => {
    const video = videoRef.current;
    const overlay = canvasRef.current;
    if (!video || !overlay || !video.videoWidth) return;
    try {
      const blob = await renderSnapshot({ video, overlay, mirrored: facing === "user", caption: TRY_ON_COPY.snapshotCaption });
      downloadBlob(blob, snapshotFilename(item.name));
    } catch {
      // A failed snapshot isn't worth interrupting the fitting room over.
    }
  };

  const onAdd = () => {
    add(toCard(item), item.sizes[0]);
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 2500);
  };

  if (typeof phase === "object") return <Fallback item={item} message={TRY_ON_COPY[phase.error]} />;

  const running = phase === "running";
  const mirrored = facing === "user" && !debug;
  const fullLength = anchor === "full" || anchor === "lower";

  return (
    <Page className="tryon">
      <div className="tryon-card">
        <h1 className="tryon-title">{item.name}</h1>
        <div className="tryon-stage" style={{ aspectRatio: aspect }} ref={stageRef} tabIndex={-1} aria-label={`Fitting room: ${item.name}`}>
          <video ref={videoRef} className={`tryon-video ${mirrored ? "mirrored" : ""}`} playsInline muted hidden={debug} aria-label="Your camera" />
          <canvas ref={canvasRef} className={`tryon-canvas ${mirrored ? "mirrored" : ""}`} data-testid="tryon-canvas" aria-hidden="true" />
          {phase === "idle" && (
            <div className="tryon-overlay">
              <p className="tryon-msg">{TRY_ON_COPY.privacy}</p>
              <button className="btn btn-primary btn-xl" onClick={() => void start(facing)}>Start camera</button>
            </div>
          )}
          {phase === "starting" && (
            <div className="tryon-overlay"><Loading label={TRY_ON_COPY.loading.replace(/…$/, "")} /></div>
          )}
          {running && lost && <p className="tryon-hint" role="status">{fullLength ? TRY_ON_COPY.findYouFull : TRY_ON_COPY.findYou}</p>}
        </div>
        <div className="tryon-state" data-state={debug ? "debug" : phase} hidden />
        <div className="tryon-controls">
          {running && !debug && <button className="btn btn-ghost" onClick={() => void onSnapshot()}>{TRY_ON_COPY.snapshot}</button>}
          {running && !debug && canFlip && <button className="btn btn-ghost" onClick={() => void flip()}>{TRY_ON_COPY.flip}</button>}
          <button className="btn btn-primary" onClick={onAdd}>{TRY_ON_COPY.addToCart}</button>
          <button className="btn btn-ghost" onClick={() => navigate(`/item/${item.id}`)}>{TRY_ON_COPY.close}</button>
        </div>
        {added && <div className="toast" role="status">Added. It's already not on its way. <Link to="/cart">View cart →</Link></div>}
      </div>
    </Page>
  );
}

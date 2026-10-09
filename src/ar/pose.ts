import type { Landmark } from "./anchors";

export interface PoseTracker {
  /** Landmarks for the first detected person, or null. */
  detect(video: HTMLVideoElement, tMs: number): Landmark[] | null;
  close(): void;
}

/** Loads MediaPipe lazily from our own origin (wasm + model live under public/models/mediapipe). */
export async function createPoseTracker(): Promise<PoseTracker> {
  const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
  const base = import.meta.env.BASE_URL;
  const fileset = await FilesetResolver.forVisionTasks(`${base}models/mediapipe/wasm`);
  const make = (delegate: "GPU" | "CPU") =>
    PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${base}models/mediapipe/pose_landmarker_lite.task`, delegate },
      runningMode: "VIDEO",
      numPoses: 1,
    });
  let landmarker: Awaited<ReturnType<typeof make>>;
  try {
    landmarker = await make("GPU");
  } catch {
    landmarker = await make("CPU");
  }
  let lastT = -1;
  return {
    detect(video, tMs) {
      if (video.readyState < 2 || video.videoWidth === 0) return null;
      // MediaPipe requires strictly increasing timestamps.
      const t = tMs > lastT ? tMs : lastT + 1;
      lastT = t;
      const res = landmarker.detectForVideo(video, t);
      const lms = res.landmarks[0];
      return lms ? lms.map((l) => ({ x: l.x, y: l.y, z: l.z, visibility: l.visibility })) : null;
    },
    close() {
      landmarker.close();
    },
  };
}

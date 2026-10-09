import type { Silhouette } from "../catalog/types";

export type AnchorType = "torso" | "torsoLong" | "full" | "lower" | "skirt" | "head" | "neck";
/** MediaPipe pose landmark, x/y normalised 0..1 in video space (y down). */
export interface Landmark { x: number; y: number; z?: number; visibility?: number }
/** Where to draw the garment, in video pixels. x/y is the centre; rotation in radians (0 = upright). */
export interface GarmentTransform { x: number; y: number; width: number; height: number; rotation: number }

export const LM = {
  nose: 0,
  leftEar: 7,
  rightEar: 8,
  leftShoulder: 11,
  rightShoulder: 12,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

const ANCHOR_BY_SILHOUETTE: Record<Silhouette, AnchorType | null> = {
  shirt: "torso",
  tunic: "torso",
  jacket: "torso",
  vest: "torso",
  corset: "torso",
  coat: "torsoLong",
  dress: "full",
  ballgown: "full",
  anarkali: "full",
  saree: "full",
  lehenga: "full",
  pants: "lower",
  skirt: "skirt",
  hat: "head",
  scarf: "neck",
  boots: null,
  shoes: null,
};

export function anchorFor(s: Silhouette): AnchorType | null {
  return ANCHOR_BY_SILHOUETTE[s];
}

export function isTryable(s: Silhouette): boolean {
  return anchorFor(s) !== null;
}

interface Pt { x: number; y: number }
/** [left, right] landmark indices. */
type Pair = readonly [number, number];

interface VerticalSpec {
  top: Pair;
  bottom: Pair;
  /** Pair used for both the span (width basis) and the rotation line. */
  pair: Pair;
  widthK: number;
  extTop: number;
  extBottom: number;
}

type VerticalAnchor = "torso" | "torsoLong" | "full" | "lower" | "skirt";

const VERTICAL: Record<VerticalAnchor, VerticalSpec> = {
  torso: { top: [LM.leftShoulder, LM.rightShoulder], bottom: [LM.leftHip, LM.rightHip], pair: [LM.leftShoulder, LM.rightShoulder], widthK: 1.4, extTop: 0.15, extBottom: 0.1 },
  torsoLong: { top: [LM.leftShoulder, LM.rightShoulder], bottom: [LM.leftKnee, LM.rightKnee], pair: [LM.leftShoulder, LM.rightShoulder], widthK: 1.5, extTop: 0.1, extBottom: 0.05 },
  full: { top: [LM.leftShoulder, LM.rightShoulder], bottom: [LM.leftAnkle, LM.rightAnkle], pair: [LM.leftShoulder, LM.rightShoulder], widthK: 1.6, extTop: 0.08, extBottom: 0.03 },
  lower: { top: [LM.leftHip, LM.rightHip], bottom: [LM.leftAnkle, LM.rightAnkle], pair: [LM.leftHip, LM.rightHip], widthK: 1.6, extTop: 0.05, extBottom: 0.02 },
  skirt: { top: [LM.leftHip, LM.rightHip], bottom: [LM.leftKnee, LM.rightKnee], pair: [LM.leftHip, LM.rightHip], widthK: 1.8, extTop: 0.05, extBottom: 0.1 },
};

const EARS: Pair = [LM.leftEar, LM.rightEar];
const SHOULDERS: Pair = [LM.leftShoulder, LM.rightShoulder];

function mid(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Angle of the line from the right point to the left point; 0 when upright. */
function angleOf(left: Pt, right: Pt): number {
  return Math.atan2(left.y - right.y, left.x - right.x);
}

/** Reads a [left, right] pair in pixels, or null if either landmark is unusable. */
function readPair(lms: Landmark[], pair: Pair, videoW: number, videoH: number): [Pt, Pt] | null {
  const pts: Pt[] = [];
  for (const idx of pair) {
    const l = lms[idx];
    if (!l) return null;
    if (l.visibility !== undefined && l.visibility < 0.5) return null;
    pts.push({ x: l.x * videoW, y: l.y * videoH });
  }
  return [pts[0], pts[1]];
}

function finish(t: GarmentTransform, span: number): GarmentTransform | null {
  if (span < 1 || t.height < 1) return null;
  return t;
}

function fitVertical(spec: VerticalSpec, lms: Landmark[], videoW: number, videoH: number): GarmentTransform | null {
  const top = readPair(lms, spec.top, videoW, videoH);
  const bottom = readPair(lms, spec.bottom, videoW, videoH);
  const pair = readPair(lms, spec.pair, videoW, videoH);
  if (!top || !bottom || !pair) return null;

  const topMid = mid(top[0], top[1]);
  const botMid = mid(bottom[0], bottom[1]);
  const span = dist(pair[0], pair[1]);
  const ax = botMid.x - topMid.x;
  const ay = botMid.y - topMid.y;
  const t: Pt = { x: topMid.x - ax * spec.extTop, y: topMid.y - ay * spec.extTop };
  const b: Pt = { x: botMid.x + ax * spec.extBottom, y: botMid.y + ay * spec.extBottom };
  const c = mid(t, b);

  return finish(
    {
      x: c.x,
      y: c.y,
      width: span * spec.widthK,
      height: dist(t, b),
      rotation: angleOf(pair[0], pair[1]),
    },
    span,
  );
}

function fitHead(lms: Landmark[], videoW: number, videoH: number): GarmentTransform | null {
  const ears = readPair(lms, EARS, videoW, videoH);
  if (!ears) return null;
  const [el, er] = ears;
  const span = dist(el, er);
  // The hat sprite's box is the whole hat, brim included, and is wide and short (about 5:3).
  // The crown is roughly 45% of the brim, so this makes the crown about as wide as the head.
  const width = span * 2.4;
  const height = width * 0.6;
  const rotation = angleOf(el, er);
  const m = mid(el, er);
  // Perpendicular to the ear line, pointing up (negative y when upright): the hatband lands on the forehead.
  const offset = 0.65 * span;
  return finish(
    {
      x: m.x + Math.sin(rotation) * offset,
      y: m.y - Math.cos(rotation) * offset,
      width,
      height,
      rotation,
    },
    span,
  );
}

function fitNeck(lms: Landmark[], videoW: number, videoH: number): GarmentTransform | null {
  const shoulders = readPair(lms, SHOULDERS, videoW, videoH);
  if (!shoulders) return null;
  const [sl, sr] = shoulders;
  const span = dist(sl, sr);
  const rotation = angleOf(sl, sr);
  const m = mid(sl, sr);
  // The scarf sprite is tall and narrow (about 1:2.2): it hangs from the neck down the chest.
  const width = span * 0.8;
  const height = width * 2.2;
  // Perpendicular to the shoulder line, pointing down (positive y when upright), so the top sits
  // just above the shoulder line.
  const offset = height / 2 - 0.15 * span;
  return finish(
    {
      x: m.x - Math.sin(rotation) * offset,
      y: m.y + Math.cos(rotation) * offset,
      width,
      height,
      rotation,
    },
    span,
  );
}

export function fitTransform(anchor: AnchorType, landmarks: Landmark[], videoW: number, videoH: number): GarmentTransform | null {
  if (anchor === "head") return fitHead(landmarks, videoW, videoH);
  if (anchor === "neck") return fitNeck(landmarks, videoW, videoH);
  return fitVertical(VERTICAL[anchor], landmarks, videoW, videoH);
}

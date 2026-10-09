import type { Landmark } from "./anchors";

/** A standing, front-facing person centred in the frame with a slow sway (~4 degrees, 0.3 Hz). 33 landmarks. */
export function syntheticLandmarks(tMs: number, w = 640, h = 480): Landmark[] {
  const sway = Math.sin(2 * Math.PI * 0.3 * (tMs / 1000)) * ((4 * Math.PI) / 180);
  const cx = 0.5;
  const hipY = 0.55;
  const unit = 0.8 * h; // body height in px
  const lms: Landmark[] = Array.from({ length: 33 }, () => ({ x: cx, y: 0.5, z: 0, visibility: 1 }));
  // Offsets from the hip centre in body-heights (pixel space), rotated about the hips by the sway.
  const put = (i: number, dx: number, dy: number) => {
    const px = dx * unit;
    const py = dy * unit;
    const rx = px * Math.cos(sway) - py * Math.sin(sway);
    const ry = px * Math.sin(sway) + py * Math.cos(sway);
    lms[i] = { x: cx + rx / w, y: hipY + ry / h, z: 0, visibility: 1 };
  };
  // MediaPipe "left" is the subject's left, which is image-right when unmirrored, but the anchor
  // math only needs consistency: left-index landmarks sit at +x so angleOf() is 0 when upright.
  put(0, 0, -0.42);
  for (const i of [1, 2, 3]) put(i, 0.02 * (i === 1 ? 1 : 1.5), -0.43);
  for (const i of [4, 5, 6]) put(i, -0.02 * (i === 4 ? 1 : 1.5), -0.43);
  put(7, 0.065, -0.41);
  put(8, -0.065, -0.41);
  put(9, 0.02, -0.38);
  put(10, -0.02, -0.38);
  put(11, 0.1, -0.3);
  put(12, -0.1, -0.3);
  put(13, 0.14, -0.14);
  put(14, -0.14, -0.14);
  put(15, 0.15, 0.02);
  put(16, -0.15, 0.02);
  for (const i of [17, 19, 21]) put(i, 0.155, 0.06);
  for (const i of [18, 20, 22]) put(i, -0.155, 0.06);
  put(23, 0.06, 0);
  put(24, -0.06, 0);
  put(25, 0.065, 0.22);
  put(26, -0.065, 0.22);
  put(27, 0.07, 0.43);
  put(28, -0.07, 0.43);
  put(29, 0.075, 0.45);
  put(30, -0.075, 0.45);
  put(31, 0.09, 0.47);
  put(32, -0.09, 0.47);
  return lms;
}

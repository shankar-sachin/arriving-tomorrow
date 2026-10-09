// Pure TypeScript smoothing for AR garment transforms. No DOM.

// Structurally identical to GarmentTransform in ./anchors.
export interface SmoothTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

const TWO_PI = 2 * Math.PI;

function smoothingAlpha(cutoff: number, dtSec: number): number {
  const tau = 1 / (TWO_PI * cutoff);
  return 1 / (1 + tau / dtSec);
}

/** Casiez et al. One Euro filter for a single scalar signal. Times are in ms. */
export class OneEuro {
  private readonly minCutoff: number;
  private readonly beta: number;
  private readonly dCutoff: number;
  private initialized = false;
  private prevX = 0;
  private prevDx = 0;
  private prevT = 0;

  constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  filter(value: number, tMs: number): number {
    if (!this.initialized) {
      this.initialized = true;
      this.prevX = value;
      this.prevDx = 0;
      this.prevT = tMs;
      return value;
    }

    const dt = (tMs - this.prevT) / 1000;
    if (dt <= 0) return this.prevX;
    this.prevT = tMs;

    const dx = (value - this.prevX) / dt;
    const edx = this.prevDx + smoothingAlpha(this.dCutoff, dt) * (dx - this.prevDx);
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    const x = this.prevX + smoothingAlpha(cutoff, dt) * (value - this.prevX);

    this.prevX = x;
    this.prevDx = edx;
    return x;
  }

  reset(): void {
    this.initialized = false;
    this.prevX = 0;
    this.prevDx = 0;
    this.prevT = 0;
  }
}

/** Wrap an angle in radians into (-PI, PI]. */
export function wrapAngle(a: number): number {
  const k = Math.ceil((a - Math.PI) / TWO_PI);
  return a - TWO_PI * k;
}

/** Smooths every field of a garment transform, unwrapping rotation across ±PI. */
export class TransformSmoother {
  private readonly x: OneEuro;
  private readonly y: OneEuro;
  private readonly width: OneEuro;
  private readonly height: OneEuro;
  private readonly rotation: OneEuro;
  private prevRotation: number | null = null;

  constructor(opts: { reduced?: boolean } = {}) {
    const reduced = opts.reduced ?? false;
    const posCutoff = reduced ? 0.4 : 1.2;
    const rotCutoff = reduced ? 0.4 : 1.0;
    this.x = new OneEuro(posCutoff, 0.02);
    this.y = new OneEuro(posCutoff, 0.02);
    this.width = new OneEuro(posCutoff, 0.02);
    this.height = new OneEuro(posCutoff, 0.02);
    this.rotation = new OneEuro(rotCutoff, 0.01);
  }

  next(t: SmoothTarget, tMs: number): SmoothTarget {
    // Unwrap the incoming angle relative to the previous smoothed value.
    let rot = t.rotation;
    if (this.prevRotation !== null) {
      rot = this.prevRotation + wrapAngle(t.rotation - this.prevRotation);
    }
    const smoothedRot = wrapAngle(this.rotation.filter(rot, tMs));
    this.prevRotation = smoothedRot;

    return {
      x: this.x.filter(t.x, tMs),
      y: this.y.filter(t.y, tMs),
      width: this.width.filter(t.width, tMs),
      height: this.height.filter(t.height, tMs),
      rotation: smoothedRot,
    };
  }

  reset(): void {
    this.x.reset();
    this.y.reset();
    this.width.reset();
    this.height.reset();
    this.rotation.reset();
    this.prevRotation = null;
  }
}

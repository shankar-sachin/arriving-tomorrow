import { describe, expect, it } from "vitest";
import { OneEuro, TransformSmoother, wrapAngle, type SmoothTarget } from "../ar/smooth";

const FRAME_MS = 33;

function target(over: Partial<SmoothTarget> = {}): SmoothTarget {
  return { x: 0, y: 0, width: 100, height: 200, rotation: 0, ...over };
}

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function stddev(xs: number[]): number {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length;
  return Math.sqrt(variance);
}

describe("OneEuro", () => {
  it("passes the first sample through unchanged", () => {
    const f = new OneEuro();
    expect(f.filter(42, 0)).toBe(42);
  });

  it("keeps a constant signal constant", () => {
    const f = new OneEuro();
    let out = 0;
    for (let i = 0; i < 100; i++) out = f.filter(7.5, i * FRAME_MS);
    expect(out).toBeCloseTo(7.5, 9);
  });

  it("reduces jitter by more than half", () => {
    const f = new OneEuro(1.2, 0.02);
    const rand = lcg(12345);
    const input: number[] = [];
    const output: number[] = [];
    for (let i = 0; i < 200; i++) {
      const v = 100 + (rand() * 2 - 1) * 5;
      input.push(v);
      output.push(f.filter(v, i * FRAME_MS));
    }
    expect(stddev(output)).toBeLessThan(stddev(input) / 2);
  });

  it("returns the previous output when dt is not positive", () => {
    const f = new OneEuro();
    f.filter(10, 100);
    const a = f.filter(20, 133);
    expect(f.filter(50, 133)).toBe(a);
  });

  it("settles near a step within 2 seconds", () => {
    const f = new OneEuro(1.2, 0.02);
    for (let i = 0; i < 10; i++) f.filter(0, i * FRAME_MS);
    let out = 0;
    const start = 10 * FRAME_MS;
    for (let i = 0; i < 61; i++) out = f.filter(100, start + i * FRAME_MS);
    expect(Math.abs(out - 100)).toBeLessThan(1);
  });

  it("reset restarts from the next sample", () => {
    const f = new OneEuro();
    f.filter(10, 0);
    f.filter(20, 33);
    f.reset();
    expect(f.filter(99, 500)).toBe(99);
  });
});

describe("wrapAngle", () => {
  it("maps 3PI/2 to -PI/2", () => {
    expect(wrapAngle((3 * Math.PI) / 2)).toBeCloseTo(-Math.PI / 2, 12);
  });

  it("maps -PI to PI", () => {
    expect(wrapAngle(-Math.PI)).toBeCloseTo(Math.PI, 12);
  });

  it("leaves in-range angles unchanged", () => {
    expect(wrapAngle(0.5)).toBeCloseTo(0.5, 12);
    expect(wrapAngle(Math.PI)).toBeCloseTo(Math.PI, 12);
  });

  it("wraps large multiples into (-PI, PI]", () => {
    expect(wrapAngle(4 * Math.PI + 0.25)).toBeCloseTo(0.25, 12);
    expect(wrapAngle(-5 * Math.PI)).toBeCloseTo(Math.PI, 12);
  });
});

describe("TransformSmoother", () => {
  it("passes the first sample through", () => {
    const s = new TransformSmoother();
    const out = s.next(target({ x: 12, y: -3, width: 80, height: 160, rotation: 0.3 }), 0);
    expect(out.x).toBeCloseTo(12, 9);
    expect(out.y).toBeCloseTo(-3, 9);
    expect(out.width).toBeCloseTo(80, 9);
    expect(out.height).toBeCloseTo(160, 9);
    expect(out.rotation).toBeCloseTo(0.3, 9);
  });

  it("keeps a constant transform constant", () => {
    const s = new TransformSmoother();
    let out = target();
    for (let i = 0; i < 100; i++) out = s.next(target({ x: 5, rotation: 1 }), i * FRAME_MS);
    expect(out.x).toBeCloseTo(5, 9);
    expect(out.rotation).toBeCloseTo(1, 9);
  });

  it("moves a small amount when rotation crosses +/-PI", () => {
    const s = new TransformSmoother();
    const first = s.next(target({ rotation: 3.1 }), 0);
    const second = s.next(target({ rotation: -3.1 }), FRAME_MS);
    expect(Math.abs(second.rotation - first.rotation)).toBeLessThan(0.2);
  });

  it("reduced mode changes less on the first frame after a step", () => {
    const step = (reduced: boolean): number => {
      const s = new TransformSmoother({ reduced });
      s.next(target({ x: 0 }), 0);
      const out = s.next(target({ x: 100 }), FRAME_MS);
      return Math.abs(out.x);
    };
    expect(step(true)).toBeLessThan(step(false));
  });

  it("reset clears state", () => {
    const s = new TransformSmoother();
    s.next(target({ x: 0, rotation: 3 }), 0);
    s.next(target({ x: 50, rotation: 3 }), FRAME_MS);
    s.reset();
    const out = s.next(target({ x: 77, rotation: 0.2 }), 1000);
    expect(out.x).toBeCloseTo(77, 9);
    expect(out.rotation).toBeCloseTo(0.2, 9);
  });
});

import { describe, expect, it } from "vitest";
import { STAGES, trackingState } from "../lib/tracking";

const t0 = Date.UTC(2026, 9, 3, 12);

describe("tracking", () => {
  it("starts at order placed", () => {
    const s = trackingState(t0, t0);
    expect(s.stage).toBe(0);
    expect(s.progress).toBe(0);
  });

  it("walks through every stage", () => {
    STAGES.forEach((stage, i) => expect(trackingState(t0, t0 + stage.at).stage).toBe(i));
  });

  it("never, ever reaches 100%, even after a decade", () => {
    for (const later of [60_000, 3_600_000, 86_400_000 * 365 * 10]) {
      const s = trackingState(t0, t0 + later);
      expect(s.stage).toBe(STAGES.length - 1);
      expect(s.progress).toBeLessThan(1);
      expect(s.progress).toBeGreaterThanOrEqual(0.9);
    }
  });

  it("is monotonic", () => {
    let prev = -1;
    for (let ms = 0; ms < 3_600_000; ms += 5_000) {
      const p = trackingState(t0, t0 + ms).progress;
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
    }
  });

  it("always promises delivery tomorrow", () => {
    const now = t0 + 86_400_000 * 40;
    expect(trackingState(t0, now).eta.getTime() - now).toBe(86_400_000);
  });
});

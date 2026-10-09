import { describe, expect, it } from "vitest";
import { fitTransform, type AnchorType } from "../ar/anchors";
import { syntheticLandmarks } from "../ar/syntheticPose";

const ANCHORS: AnchorType[] = ["torso", "torsoLong", "full", "lower", "skirt", "head", "neck"];

describe("syntheticLandmarks", () => {
  it("returns 33 visible landmarks inside the frame", () => {
    const lms = syntheticLandmarks(0);
    expect(lms).toHaveLength(33);
    for (const l of lms) {
      expect(l.visibility).toBe(1);
      expect(l.x).toBeGreaterThan(0);
      expect(l.x).toBeLessThan(1);
      expect(l.y).toBeGreaterThan(0);
      expect(l.y).toBeLessThan(1);
    }
  });

  it("fits every anchor type at several times", () => {
    for (const t of [0, 400, 833, 1700, 5000]) {
      for (const a of ANCHORS) {
        const tr = fitTransform(a, syntheticLandmarks(t, 640, 480), 640, 480);
        expect(tr, `${a}@${t}`).not.toBeNull();
        expect(tr!.width).toBeGreaterThan(0);
        expect(tr!.height).toBeGreaterThan(0);
      }
    }
  });

  it("sways by only a few degrees", () => {
    for (let t = 0; t < 4000; t += 100) {
      const tr = fitTransform("torso", syntheticLandmarks(t), 640, 480)!;
      expect(Math.abs(tr.rotation)).toBeLessThan((6 * Math.PI) / 180);
    }
  });
});

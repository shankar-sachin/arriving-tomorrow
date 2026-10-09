import { describe, expect, it } from "vitest";
import { anchorFor, fitTransform, isTryable, LM, type AnchorType, type Landmark } from "../ar/anchors";
import type { Silhouette } from "../catalog/types";

const ALL_ANCHORS: AnchorType[] = ["torso", "torsoLong", "full", "lower", "skirt", "head", "neck"];

/** 33-entry landmark array for an upright person facing the camera, all visible. */
function person(overrides: Partial<Record<number, Partial<Landmark>>> = {}): Landmark[] {
  const lms: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
  const set = (idx: number, x: number, y: number) => {
    lms[idx] = { x, y, visibility: 1 };
  };
  set(LM.nose, 0.5, 0.12);
  set(LM.rightEar, 0.46, 0.15);
  set(LM.leftEar, 0.54, 0.15);
  set(LM.rightShoulder, 0.4, 0.3);
  set(LM.leftShoulder, 0.6, 0.3);
  set(LM.rightHip, 0.42, 0.55);
  set(LM.leftHip, 0.58, 0.55);
  set(LM.rightKnee, 0.42, 0.75);
  set(LM.leftKnee, 0.58, 0.75);
  set(LM.rightAnkle, 0.42, 0.95);
  set(LM.leftAnkle, 0.58, 0.95);
  for (const [k, v] of Object.entries(overrides)) {
    const idx = Number(k);
    lms[idx] = { ...lms[idx], ...v };
  }
  return lms;
}

describe("anchorFor / isTryable", () => {
  it("maps each of the 17 silhouettes to its anchor", () => {
    const expected: Record<Silhouette, AnchorType | null> = {
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
    expect(Object.keys(expected)).toHaveLength(17);
    for (const [s, anchor] of Object.entries(expected)) {
      expect(anchorFor(s as Silhouette)).toBe(anchor);
    }
  });

  it("marks boots and shoes as not tryable", () => {
    expect(isTryable("boots")).toBe(false);
    expect(isTryable("shoes")).toBe(false);
  });

  it("marks every other silhouette as tryable", () => {
    const others: Silhouette[] = ["saree", "lehenga", "tunic", "anarkali", "shirt", "jacket", "coat", "vest", "dress", "ballgown", "pants", "skirt", "corset", "hat", "scarf"];
    for (const s of others) expect(isTryable(s)).toBe(true);
  });
});

describe("fitTransform", () => {
  it("computes the torso transform by hand on a 1000x1000 video", () => {
    // Shoulder mid (500, 300), hip mid (500, 550), shoulder span 200px.
    // Axis (0, 250): top' = 300 - 37.5 = 262.5, bottom' = 550 + 25 = 575.
    const t = fitTransform("torso", person(), 1000, 1000);
    expect(t).not.toBeNull();
    expect(t!.x).toBeCloseTo(500, 6);
    expect(t!.y).toBeCloseTo(418.75, 6);
    expect(t!.width).toBeCloseTo(280, 6);
    expect(t!.height).toBeCloseTo(312.5, 6);
    expect(t!.rotation).toBeCloseTo(0, 6);
  });

  it("gives a rotation of pi/6 when the shoulder line is tilted +30 degrees", () => {
    const tilt = 0.3 + 0.2 * Math.tan(Math.PI / 6);
    const lms = person({ [LM.leftShoulder]: { x: 0.6, y: tilt } });
    const t = fitTransform("torso", lms, 1000, 1000);
    expect(t).not.toBeNull();
    expect(t!.rotation).toBeCloseTo(Math.PI / 6, 6);
  });

  it("returns null when a required landmark has low visibility", () => {
    const lms = person({ [LM.leftHip]: { visibility: 0.3 } });
    expect(fitTransform("torso", lms, 1000, 1000)).toBeNull();
  });

  it("returns null when a required landmark is missing", () => {
    const lms = person();
    lms.length = 20;
    expect(fitTransform("torso", lms, 1000, 1000)).toBeNull();
  });

  it("places the head centre above the ear midpoint", () => {
    const t = fitTransform("head", person(), 1000, 1000);
    expect(t).not.toBeNull();
    // Ear midpoint is (500, 150).
    expect(t!.x).toBeCloseTo(500, 6);
    expect(t!.y).toBeLessThan(150);
  });

  it("places the neck centre below the shoulder midpoint", () => {
    const t = fitTransform("neck", person(), 1000, 1000);
    expect(t).not.toBeNull();
    // Shoulder midpoint is (500, 300).
    expect(t!.x).toBeCloseTo(500, 6);
    expect(t!.y).toBeGreaterThan(300);
  });

  it("returns a non-null transform for every anchor on the upright fixture", () => {
    for (const anchor of ALL_ANCHORS) {
      expect(fitTransform(anchor, person(), 1000, 1000), anchor).not.toBeNull();
    }
  });
});

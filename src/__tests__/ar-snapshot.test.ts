import { describe, expect, it } from "vitest";
import { snapshotFilename, snapshotLayout, snapshotSize } from "../ar/snapshot";

function inside(
  px: number,
  py: number,
  rect: { x: number; y: number; w: number; h: number },
) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

describe("snapshotLayout", () => {
  for (const [w, h] of [
    [640, 480],
    [480, 640],
  ] as const) {
    describe(`${w}x${h}`, () => {
      const layout = snapshotLayout(w, h);

      it("places the photo at its original size, offset by the border", () => {
        expect(layout.photo).toEqual({ x: layout.border, y: layout.border, w, h });
      });

      it("puts the band directly below the photo with the same width", () => {
        expect(layout.band.x).toBe(layout.border);
        expect(layout.band.w).toBe(w);
        expect(layout.band.y).toBe(layout.photo.y + layout.photo.h);
      });

      it("keeps the snapshot size consistent with the layout", () => {
        const size = snapshotSize(w, h);
        expect(size.width).toBe(w + 2 * layout.border);
        expect(size.height).toBe(h + 2 * layout.border + layout.band.h);
        expect(size.height).toBe(layout.band.y + layout.band.h + layout.border);
      });

      it("keeps the stamp centre inside the photo rect", () => {
        expect(inside(layout.stamp.x, layout.stamp.y, layout.photo)).toBe(true);
        expect(layout.stamp.rotation).toBeCloseTo(-0.25);
      });
    });
  }

  it("applies minimums for tiny inputs", () => {
    const layout = snapshotLayout(100, 100);
    expect(layout.border).toBe(8);
    expect(layout.band.h).toBe(48);
    expect(snapshotSize(100, 100)).toEqual({ width: 116, height: 100 + 16 + 48 });
  });
});

describe("snapshotFilename", () => {
  it("slugifies the product name", () => {
    expect(snapshotFilename("Moonlit Burgundy Georgette Banarasi Saree!")).toBe(
      "arriving-tomorrow-moonlit-burgundy-georgette-banarasi-saree.png",
    );
  });

  it("caps very long names and leaves no trailing hyphen", () => {
    const name = "a".repeat(30) + " " + "b".repeat(30) + " " + "c".repeat(30);
    const file = snapshotFilename(name);
    const slug = file.replace(/^arriving-tomorrow-/, "").replace(/\.png$/, "");
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
    expect(file.endsWith(".png")).toBe(true);
  });
});

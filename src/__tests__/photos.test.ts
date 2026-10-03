import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { analyse, slug } from "../../scripts/fetch-photos";
import { PHOTO_SOURCES } from "../../scripts/photo-sources";
import { REGIONS } from "../catalog/taxonomy";

const archetypes = REGIONS.flatMap((r) => r.categories.flatMap((c) => c.archetypes.map((a) => a.name)));

describe("photo pipeline", () => {
  it("has photo sources for exactly the taxonomy's archetypes", () => {
    expect(Object.keys(PHOTO_SOURCES).sort()).toEqual([...archetypes].sort());
  });

  it("slugs archetype names into safe, unique folder names", () => {
    expect(slug("Robe à la Française")).toBe("robe-a-la-francaise");
    expect(new Set(archetypes.map(slug)).size).toBe(archetypes.length);
  });

  it("measures the garment colour, not the background", async () => {
    // A red "garment" in the middle of a white backdrop.
    const img = await sharp({ create: { width: 200, height: 200, channels: 3, background: "#ffffff" } })
      .composite([{ input: await sharp({ create: { width: 90, height: 120, channels: 3, background: "#c1121f" } }).png().toBuffer(), left: 55, top: 40 }])
      .png()
      .toBuffer();
    const { color, bg, greyFraction } = await analyse(img);
    expect(bg).toBe("#ffffff");
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
    expect(r).toBeGreaterThan(150);
    expect(g).toBeLessThan(60);
    expect(b).toBeLessThan(60);
    expect(greyFraction).toBeLessThan(0.9);
  });
});

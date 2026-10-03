import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { analyse, slug } from "../../scripts/fetch-photos";
import { PHOTO_SOURCES } from "../../scripts/photo-sources";
import { nearestPalette } from "../catalog/generate";
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

  it("picks the saturated garment over a white mannequin beside it", async () => {
    // Red gown on the left half of the centre, white mannequin on the right, grey backdrop.
    const red = await sharp({ create: { width: 60, height: 140, channels: 3, background: "#c8102e" } }).png().toBuffer();
    const white = await sharp({ create: { width: 60, height: 140, channels: 3, background: "#f4f1ea" } }).png().toBuffer();
    const img = await sharp({ create: { width: 200, height: 200, channels: 3, background: "#6b6b6b" } })
      .composite([{ input: red, left: 40, top: 30 }, { input: white, left: 100, top: 30 }])
      .png()
      .toBuffer();
    const { color } = await analyse(img);
    expect(nearestPalette(color).family).toBe("red");
  });
});

import { existsSync } from "node:fs";
import { join } from "node:path";
import approved from "../catalog/photo-approved.json";
import blocklist from "../catalog/photo-blocklist.json";
import manifest from "../catalog/photos.json";
import type { PhotoManifest } from "../catalog/types";

describe("photo review", () => {
  const m = manifest as PhotoManifest;
  const a = approved as Record<string, string[]>;

  it("every approved photo exists in the manifest and on disk", () => {
    for (const [archetype, keys] of Object.entries(a))
      for (const key of keys) {
        const photo = m[archetype]?.find((p) => p.key === key);
        expect(photo, `${archetype} ${key}`).toBeTruthy();
        expect(existsSync(join(__dirname, "../../public", photo!.src)), photo!.src).toBe(true);
      }
  });

  it("nothing approved is also blocklisted", () => {
    const blocked = new Set(blocklist as string[]);
    expect(Object.values(a).flat().filter((k) => blocked.has(k))).toEqual([]);
  });

  it("only open licences, with attribution", () => {
    for (const p of Object.values(m).flat()) {
      expect(p.license).toMatch(p.source === "ai" ? /^AI-generated$/ : /^(CC0|Public domain|PD|CC BY(-SA)? \d|Pexels License)/i);
      expect(p.license).not.toMatch(/\b(NC|ND)\b/);
      expect(p.creator && p.sourceUrl && p.licenseUrl).toBeTruthy();
    }
  });
});

import aiJobs from "../../scripts/ai-photo-jobs.json";
import { buildJobs, HINTS } from "../../scripts/ai-photo-prompts";
import { generateCatalog } from "../catalog/generate";
import type { Photo } from "../catalog/types";

describe("AI photos", () => {
  it("has a garment description for every archetype, and the job list is up to date", () => {
    expect(Object.keys(HINTS).sort()).toEqual([...archetypes].sort());
    expect(aiJobs).toEqual(buildJobs()); // run `npm run photos:ai-jobs` if this fails
    expect(aiJobs).toHaveLength(archetypes.length * 9);
  });

  it("prompts ask for an empty display, never a person", () => {
    for (const j of buildJobs()) expect(j.prompt).toMatch(/dress form|ghost mannequin|display stand|three-quarter view|standing upright/);
  });

  it("matches each product to the AI photo of its own colour family, without recolouring it", () => {
    const ai = (family: Photo["family"]): Photo => ({
      key: `ai:sherwani--${family}`, src: `photos/ai/sherwani/${family}.webp`, w: 720, h: 900, color: "#888888", bg: "#f5f0e6",
      source: "ai", family, title: "AI", creator: "Generated with FLUX.1-schnell", license: "AI-generated", licenseUrl: "https://example.org", sourceUrl: "https://example.org",
    });
    const plain = generateCatalog().filter((i) => i.archetype === "Sherwani");
    const withAi = generateCatalog(undefined, undefined, { Sherwani: [ai("red"), ai("blue")] }).filter((i) => i.archetype === "Sherwani");
    for (const [i, before] of withAi.map((x, n) => [x, plain[n]] as const)) {
      expect(i.colorName).toBe(before.colorName); // AI never recolours
      if (i.colorFamily === "red" || i.colorFamily === "blue") expect(i.photo?.src).toBe(`photos/ai/sherwani/${i.colorFamily}.webp`);
      else expect(i.photo).toBeUndefined(); // no AI photo for that family, too few real ones → drawing
    }
  });
});

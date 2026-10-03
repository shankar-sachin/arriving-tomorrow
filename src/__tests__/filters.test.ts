import { describe, expect, it } from "vitest";
import { generateCatalog, nearestPalette, toCard } from "../catalog/generate";
import type { PhotoManifest } from "../catalog/types";
import { activeCount, applyFilters, EMPTY_FILTERS, facetCounts, matches, parseFilters, writeFilters, type Filters } from "../lib/filters";

const items = generateCatalog().map(toCard);
const f = (patch: Partial<Filters>): Filters => ({ ...EMPTY_FILTERS, ...patch });

describe("filters", () => {
  it("round-trips through the URL, keeping unrelated params", () => {
    const filters = f({ aud: "women", colors: ["red", "pink"], fabrics: ["Banarasi Silk", "Raw Denim"], min: 50, max: 400, rating: 4.5, deals: true, sort: "price-asc" });
    const params = writeFilters(filters, new URLSearchParams("q=velvet"));
    expect(params.get("q")).toBe("velvet");
    expect(parseFilters(params)).toEqual(filters);
    expect(writeFilters(EMPTY_FILTERS).toString()).toBe("");
  });

  it("ignores garbage in the URL", () => {
    expect(parseFilters(new URLSearchParams("aud=aliens&min=abc&sort=chaos"))).toEqual(EMPTY_FILTERS);
  });

  it("Women and Men both include unisex pieces; Unisex is only unisex", () => {
    const women = applyFilters(items, f({ aud: "women" }));
    const men = applyFilters(items, f({ aud: "men" }));
    const unisex = applyFilters(items, f({ aud: "unisex" }));
    expect(women.every((i) => i.audience !== "men")).toBe(true);
    expect(men.every((i) => i.audience !== "women")).toBe(true);
    expect(unisex.every((i) => i.audience === "unisex")).toBe(true);
    expect(women.some((i) => i.audience === "unisex")).toBe(true);
    expect(women.length + men.length - unisex.length).toBe(items.length);
  });

  it("combines filters with AND across facets and OR within one", () => {
    const res = applyFilters(items, f({ colors: ["red", "blue"], max: 200, rating: 4 }));
    expect(res.length).toBeGreaterThan(0);
    for (const i of res) {
      expect(["red", "blue"]).toContain(i.colorFamily);
      expect(i.price).toBeLessThanOrEqual(200);
      expect(i.rating).toBeGreaterThanOrEqual(4);
    }
  });

  it("deals means 40%+ off", () => {
    for (const i of applyFilters(items, f({ deals: true }))) expect(1 - i.price / i.compareAt).toBeGreaterThanOrEqual(0.4);
  });

  it("facet counts ignore their own selection but respect the others", () => {
    const filters = f({ colors: ["red"], aud: "men" });
    const counts = new Map(facetCounts(items, filters, "colors", (i) => i.colorFamily));
    // Picking blue would show men's/unisex blue items, regardless of red being selected.
    expect(counts.get("blue")).toBe(items.filter((i) => i.colorFamily === "blue" && matches(i, f({ aud: "men" }))).length);
  });

  it("counts active filters", () => {
    expect(activeCount(EMPTY_FILTERS)).toBe(0);
    expect(activeCount(f({ aud: "men", colors: ["red", "pink"], min: 10, deals: true }))).toBe(5);
  });
});

describe("photos in the catalog", () => {
  it("matches colour names to a photo's measured colour", () => {
    expect(nearestPalette("#c0141f").family).toBe("red");
    expect(nearestPalette("#0a3fa8").family).toBe("blue");
    expect(nearestPalette("#f2ece0").family).toBe("neutral");
  });

  it("assigns photos to their archetype and recolours those SKUs", () => {
    const photo = (key: string, color: string) => ({
      key, src: `photos/sherwani/${key}.webp`, w: 600, h: 800, color, bg: "#eeeeee",
      source: "met" as const, title: "Coat", creator: "Unknown maker", license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", sourceUrl: "https://example.org",
    });
    const manifest: PhotoManifest = { Sherwani: [photo("met-1", "#c0141f"), photo("met-2", "#0a3fa8")] };
    const withPhotos = generateCatalog(undefined, undefined, manifest);
    const sherwanis = withPhotos.filter((i) => i.archetype === "Sherwani");
    expect(sherwanis.every((i) => i.photo && i.photoCredit?.license === "CC0 1.0")).toBe(true);
    for (const i of sherwanis) expect(i.colorFamily).toBe(i.photo!.src.includes("met-1") ? "red" : "blue");
    expect(withPhotos.filter((i) => i.archetype !== "Sherwani").every((i) => !i.photo)).toBe(true);
    // Names stay unique even when many SKUs share a photo (and therefore a colour).
    expect(new Set(withPhotos.map((i) => i.name)).size).toBe(withPhotos.length);
    // Photo credits stay off the lightweight card objects.
    expect("photoCredit" in toCard(sherwanis[0])).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { buildIndex, generateCatalog, itemId, joinFabric, mulberry32, parseItemId, VARIANTS_PER_ARCHETYPE } from "../catalog/generate";
import { REGIONS } from "../catalog/taxonomy";

const items = generateCatalog();

describe("catalog generator", () => {
  it("produces thousands of items, one batch per archetype", () => {
    const archetypes = REGIONS.flatMap((r) => r.categories.flatMap((c) => c.archetypes)).length;
    expect(items.length).toBe(archetypes * VARIANTS_PER_ARCHETYPE);
    expect(items.length).toBeGreaterThan(5000);
  });

  it("is deterministic for a given seed", () => {
    expect(generateCatalog()).toEqual(items);
    expect(generateCatalog(42)[0]).not.toEqual(items[0]);
  });

  it("gives every item a unique id and name", () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    expect(new Set(items.map((i) => i.name)).size).toBe(items.length);
  });

  it("keeps prices sane and discounts real", () => {
    for (const i of items) {
      expect(i.price).toBeGreaterThan(0);
      expect(i.compareAt).toBeGreaterThan(i.price);
      expect(i.rating).toBeGreaterThanOrEqual(3.8);
      expect(i.rating).toBeLessThanOrEqual(5);
      expect(i.sizes.length).toBeGreaterThan(0);
    }
  });

  it("round-trips ids, including hyphenated categories", () => {
    const id = itemId("india", "kurtas-suits", 7);
    expect(id).toBe("india-kurtas-suits-0007");
    expect(parseItemId(id)).toEqual({ region: "india", category: "kurtas-suits", index: 7 });
    expect(parseItemId("mars-hats-0001")).toBeNull();
    expect(parseItemId("nonsense")).toBeNull();
    for (const i of items.slice(0, 200)) expect(parseItemId(i.id)).toMatchObject({ region: i.region, category: i.category });
  });

  it("does not stutter fabric names", () => {
    expect(joinFabric("Raw Denim", "Denim Skirt")).toBe("Raw Denim Skirt");
    expect(joinFabric("Velvet", "Frock Coat")).toBe("Velvet Frock Coat");
  });

  it("builds an index whose counts add up", () => {
    const index = buildIndex(items);
    expect(index.total).toBe(items.length);
    expect(index.featured).toHaveLength(12);
    const sum = index.regions.reduce((n, r) => n + r.categories.reduce((m, c) => m + c.count, 0), 0);
    expect(sum).toBe(items.length);
  });

  it("mulberry32 stays in [0, 1)", () => {
    const rng = mulberry32(1);
    for (let k = 0; k < 1000; k++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

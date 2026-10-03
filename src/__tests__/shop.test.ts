import { describe, expect, it } from "vitest";
import { generateCatalog, toCard } from "../catalog/generate";
import { sortItems } from "../pages/Shop";
import { searchItems } from "../pages/Search";

const cards = generateCatalog().map(toCard);

describe("shop helpers", () => {
  it("sorts by price both ways", () => {
    const asc = sortItems(cards, "price-asc");
    const desc = sortItems(cards, "price-desc");
    expect(asc[0].price).toBeLessThanOrEqual(asc[asc.length - 1].price);
    expect(desc[0].price).toBe(asc[asc.length - 1].price);
  });

  it("search requires every term to match", () => {
    const hits = searchItems(cards, "velvet frock coat");
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) expect(h.name.toLowerCase()).toMatch(/velvet.*frock coat/);
    expect(searchItems(cards, "   ")).toEqual([]);
  });
});

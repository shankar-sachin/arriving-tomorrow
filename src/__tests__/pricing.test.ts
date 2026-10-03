import { describe, expect, it } from "vitest";
import { generateCatalog, toCard } from "../catalog/generate";
import { computeTotals, COUPON_CODE, itemCount, SHIPPING_FEE, type CartLine } from "../lib/pricing";

const [a, b] = generateCatalog().slice(0, 2).map(toCard);
const lines: CartLine[] = [
  { key: "a", item: a, size: "M", qty: 2 },
  { key: "b", item: b, size: "L", qty: 1 },
];

describe("pricing", () => {
  it("adds up subtotal, shipping, and tax without a coupon", () => {
    const t = computeTotals(lines, null);
    expect(t.subtotal).toBeCloseTo(a.price * 2 + b.price, 2);
    expect(t.shipping).toBe(SHIPPING_FEE);
    expect(t.discount).toBe(0);
    expect(t.total).toBeCloseTo(t.subtotal + t.shipping + t.tax, 2);
  });

  it("FREE-CLOTHES makes everything free, case-insensitively", () => {
    for (const code of [COUPON_CODE, "free-clothes", "  Free-Clothes "]) {
      const t = computeTotals(lines, code);
      expect(t.total).toBe(0);
      expect(t.discount).toBeCloseTo(t.subtotal + t.shipping + t.tax, 2);
    }
  });

  it("ignores other coupons", () => {
    expect(computeTotals(lines, "CHEAP-CLOTHES").discount).toBe(0);
  });

  it("charges nothing for an empty cart", () => {
    expect(computeTotals([], null)).toEqual({ subtotal: 0, shipping: 0, tax: 0, discount: 0, total: 0 });
    expect(itemCount(lines)).toBe(3);
  });
});

import { describe, expect, it } from "vitest";
import { generateCatalog, toCard } from "../catalog/generate";
import { ACHIEVEMENTS, earnedFromShop } from "../lib/achievements";
import { decodeGift, encodeGift, giftFromOrder, MAX_GIFT_ITEMS } from "../lib/gift";
import { computeTotals, COUPON_CODE, type CartLine } from "../lib/pricing";
import type { Order } from "../lib/store";
import { agentFor, AGENTS, classify, reply, tierFor } from "../lib/support";
import { resolveTheme } from "../lib/theme";

const cards = generateCatalog().map(toCard);
const find = (archetype: string) => cards.find((c) => c.archetype === archetype)!;
const line = (archetype: string, qty = 1): CartLine => {
  const item = find(archetype);
  return { key: `${item.id}:M`, item, size: "M", qty };
};
const order = (lines: CartLine[], placedAt = 1_760_000_000_000): Order => ({
  id: `CNC-${placedAt}`,
  placedAt,
  lines,
  totals: computeTotals(lines, COUPON_CODE),
});

describe("gift links", () => {
  it("round-trips an order, including non-ASCII names", () => {
    const o = order([line("Robe à la Française", 2), line("Sherwani")]);
    const gift = giftFromOrder(o, "  Sachin ", "Priyà", "Saw this and thought of you ✨");
    const back = decodeGift(encodeGift(gift));
    expect(back).toEqual(gift);
    expect(back!.from).toBe("Sachin");
    expect(back!.items[0].item.name).toBe(o.lines[0].item.name);
    expect(back!.value).toBeCloseTo(o.totals.discount, 2);
  });

  it("produces URL-safe codes", () => {
    const gift = giftFromOrder(order([line("Cowboy Hat")]), "a", "b", "??>>~~".repeat(20));
    expect(encodeGift(gift)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("caps the number of items so links stay shareable", () => {
    const many = cards.slice(0, 20).map((item) => ({ key: item.id, item, size: "M", qty: 1 }));
    expect(giftFromOrder(order(many), "", "", "").items).toHaveLength(MAX_GIFT_ITEMS);
  });

  it("rejects mangled links instead of crashing", () => {
    for (const bad of [null, "", "not-base64!!", "e30", encodeGift({} as never).slice(0, 5)]) expect(decodeGift(bad)).toBeNull();
  });
});

describe("customer support", () => {
  it("classifies the usual complaints", () => {
    expect(classify("Where's my order?")).toBe("where");
    expect(classify("I want a refund")).toBe("refund");
    expect(classify("Let me speak to a manager")).toBe("manager");
    expect(classify("THIS IS RIDICULOUS")).toBe("angry");
    expect(classify("hello")).toBe("greeting");
    expect(classify("thanks!")).toBe("thanks");
    expect(classify("asdfgh")).toBe("other");
  });

  it("gets more unhinged the longer you chat", () => {
    expect([0, 2, 3, 6, 7, 50].map(tierFor)).toEqual([0, 0, 1, 1, 2, 2]);
    const calm = reply("where is it", 0).text;
    const unhinged = reply("where is it", 9).text;
    expect(calm).not.toBe(unhinged);
  });

  it("always has an answer", () => {
    for (let turn = 0; turn < 30; turn++)
      for (const msg of ["hi", "where", "refund", "manager", "wtf", "thanks", "size", "bye", "???"]) expect(reply(msg, turn).text.length).toBeGreaterThan(10);
  });

  it("escalating tops out at the same person", () => {
    expect(agentFor(0)).toBe(AGENTS[0]);
    expect(agentFor(99)).toBe(AGENTS[AGENTS.length - 1]);
  });
});

describe("achievements", () => {
  it("has unique ids", () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
  });

  it("nothing is earned before you shop", () => {
    expect(earnedFromShop([], [])).toEqual([]);
  });

  it("unlocks order achievements", () => {
    const earned = earnedFromShop([order([line("Crinoline Ball Gown"), line("Cowboy Hat"), line("Sherwani", 99)])], []);
    expect(earned).toEqual(expect.arrayContaining(["first-order", "yeehaw", "time-traveller", "bulk"]));
    expect(earned).not.toContain("loyal");
  });

  it("counts lifetime retail value and cart size", () => {
    const pricey = order([line("Bridal Lehenga", 99)]);
    expect(earnedFromShop([pricey], [])).toContain("big-spender");
    expect(earnedFromShop([], [line("Kurta", 25)])).toEqual(["full-cart"]);
    expect(earnedFromShop(Array.from({ length: 10 }, (_, i) => order([line("Kurta")], i)), [])).toContain("loyal");
  });
});

describe("theme", () => {
  it("follows the system unless told otherwise", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

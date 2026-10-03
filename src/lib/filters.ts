import type { Audience, CardItem, ColorFamily, Pattern, RegionId } from "../catalog/types";

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "waited" | "discount";

export interface Filters {
  aud: Audience | null;
  regions: RegionId[];
  types: string[];
  colors: ColorFamily[];
  fabrics: string[];
  patterns: Pattern[];
  min: number | null;
  max: number | null;
  rating: number | null;
  deals: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: Filters = {
  aud: null,
  regions: [],
  types: [],
  colors: [],
  fabrics: [],
  patterns: [],
  min: null,
  max: null,
  rating: null,
  deals: false,
  sort: "featured",
};

export const SORTS: Array<[SortKey, string]> = [
  ["featured", "Featured"],
  ["price-asc", "Price: low → high"],
  ["price-desc", "Price: high → low"],
  ["rating", "Top rated"],
  ["waited", "Most waited for"],
  ["discount", "Biggest fake discount"],
];

export const PATTERN_LABELS: Record<Pattern, string> = {
  plain: "Solid",
  stripes: "Stripes",
  dots: "Dots",
  checks: "Checks",
  paisley: "Paisley",
  brocade: "Brocade",
  zigzag: "Zigzag",
  floral: "Floral",
};

export const AUDIENCES: Array<[Audience, string]> = [
  ["women", "Women"],
  ["men", "Men"],
  ["unisex", "Unisex"],
];

/** A deal is at least this much off the (very real, definitely not made-up) compare-at price. */
export const DEAL_THRESHOLD = 0.4;

const list = (v: string | null) => (v ? v.split(",").map(decodeURIComponent).filter(Boolean) : []);
const num = (v: string | null) => (v !== null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : null);

export function parseFilters(params: URLSearchParams): Filters {
  const aud = params.get("aud");
  const sort = params.get("sort");
  return {
    aud: aud === "women" || aud === "men" || aud === "unisex" ? aud : null,
    regions: list(params.get("r")) as RegionId[],
    types: list(params.get("t")),
    colors: list(params.get("c")) as ColorFamily[],
    fabrics: list(params.get("f")),
    patterns: list(params.get("p")) as Pattern[],
    min: num(params.get("min")),
    max: num(params.get("max")),
    rating: num(params.get("rating")),
    deals: params.get("deals") === "1",
    sort: SORTS.some(([k]) => k === sort) ? (sort as SortKey) : "featured",
  };
}

/** Serialises only non-default values, preserving unrelated params (like ?q=). */
export function writeFilters(f: Filters, base = new URLSearchParams()): URLSearchParams {
  const out = new URLSearchParams(base);
  const set = (k: string, v: string | null) => (v ? out.set(k, v) : out.delete(k));
  const joined = (a: string[]) => (a.length ? a.map(encodeURIComponent).join(",") : null);
  set("aud", f.aud);
  set("r", joined(f.regions));
  set("t", joined(f.types));
  set("c", joined(f.colors));
  set("f", joined(f.fabrics));
  set("p", joined(f.patterns));
  set("min", f.min === null ? null : String(f.min));
  set("max", f.max === null ? null : String(f.max));
  set("rating", f.rating === null ? null : String(f.rating));
  set("deals", f.deals ? "1" : null);
  set("sort", f.sort === "featured" ? null : f.sort);
  return out;
}

export const discount = (i: CardItem) => 1 - i.price / i.compareAt;

type FacetKey = "aud" | "regions" | "types" | "colors" | "fabrics" | "patterns" | "price" | "rating" | "deals";

/** Every filter except `skip`, so facet counts can show "what you'd get if you picked this". */
export function matches(i: CardItem, f: Filters, skip?: FacetKey): boolean {
  if (skip !== "aud" && f.aud && !(i.audience === f.aud || (f.aud !== "unisex" && i.audience === "unisex"))) return false;
  if (skip !== "regions" && f.regions.length && !f.regions.includes(i.region)) return false;
  if (skip !== "types" && f.types.length && !f.types.includes(i.archetype)) return false;
  if (skip !== "colors" && f.colors.length && !f.colors.includes(i.colorFamily)) return false;
  if (skip !== "fabrics" && f.fabrics.length && !f.fabrics.includes(i.fabric)) return false;
  if (skip !== "patterns" && f.patterns.length && !f.patterns.includes(i.pattern)) return false;
  if (skip !== "price" && f.min !== null && i.price < f.min) return false;
  if (skip !== "price" && f.max !== null && i.price > f.max) return false;
  if (skip !== "rating" && f.rating !== null && i.rating < f.rating) return false;
  if (skip !== "deals" && f.deals && discount(i) < DEAL_THRESHOLD) return false;
  return true;
}

export function sortItems(items: CardItem[], sort: SortKey): CardItem[] {
  const out = [...items];
  switch (sort) {
    case "price-asc": return out.sort((a, b) => a.price - b.price);
    case "price-desc": return out.sort((a, b) => b.price - a.price);
    case "rating": return out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "waited": return out.sort((a, b) => b.reviews - a.reviews);
    case "discount": return out.sort((a, b) => discount(b) - discount(a));
    default: return out;
  }
}

export function applyFilters(items: CardItem[], f: Filters): CardItem[] {
  return sortItems(items.filter((i) => matches(i, f)), f.sort);
}

/** Option → count, computed with every *other* active filter applied. Sorted by count, then name. */
export function facetCounts<K extends string>(items: CardItem[], f: Filters, key: FacetKey, value: (i: CardItem) => K): Array<[K, number]> {
  const counts = new Map<K, number>();
  for (const i of items) if (matches(i, f, key)) counts.set(value(i), (counts.get(value(i)) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function activeCount(f: Filters): number {
  return (
    (f.aud ? 1 : 0) + f.regions.length + f.types.length + f.colors.length + f.fabrics.length + f.patterns.length +
    (f.min !== null || f.max !== null ? 1 : 0) + (f.rating !== null ? 1 : 0) + (f.deals ? 1 : 0)
  );
}

export const toggle = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

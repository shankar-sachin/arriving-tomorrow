import { ADJECTIVES, OCCASIONS, PALETTES, REGIONS, SIZE_SETS } from "./taxonomy";
import type { Palette } from "./taxonomy";
import type { CardItem, CatalogIndex, CatalogItem, PhotoManifest, RegionId } from "./types";

export const DEFAULT_SEED = 0xc10755;
export const VARIANTS_PER_ARCHETYPE = 90;
/** Archetypes with fewer approved photos than this keep the SVG drawings (avoids 90 copies of one photo). */
export const MIN_PHOTOS = 3;

/** Small, fast, deterministic PRNG. Same seed → same catalog → stable URLs. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const pick = <T,>(arr: readonly T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)];

/** "Raw Denim" + "Denim Skirt" → "Raw Denim Skirt" instead of "Raw Denim Denim Skirt". */
export function joinFabric(fabric: string, archetype: string): string {
  const fabricWords = fabric.split(" ");
  const archWords = archetype.split(" ");
  if (fabricWords[fabricWords.length - 1].toLowerCase() === archWords[0].toLowerCase()) {
    return [...fabricWords, ...archWords.slice(1)].join(" ");
  }
  return `${fabric} ${archetype}`;
}

const BLURBS: Array<(p: { fabric: string; motif: string; arch: string; occasion: string }) => string> = [
  (p) => `Hand-finished ${p.fabric.toLowerCase()} with ${p.motif.toLowerCase()} detailing. Ships in 3–5 business eternities.`,
  (p) => `The ${p.arch.toLowerCase()} your wardrobe deserves and your doorstep will never see.`,
  (p) => `Made for ${p.occasion}. Estimated delivery: tomorrow. It has been tomorrow for a while.`,
  (p) => `${p.motif} meets ${p.fabric.toLowerCase()} in a ${p.arch.toLowerCase()} so good, the courier keeps it for themselves.`,
  (p) => `A wardrobe staple for ${p.occasion}. Free returns, mostly because there is nothing to return.`,
  () => `Tailored to perfection, packed with care, and currently somewhere between here and the heat death of the universe.`,
];

export const BADGES = ["Bestseller", "Only 1 left", "New", "Staff pick", "Trending"];

export function itemId(region: RegionId, category: string, index: number): string {
  return `${region}-${category}-${String(index).padStart(4, "0")}`;
}

export function parseItemId(id: string): { region: RegionId; category: string; index: number } | null {
  const parts = id.split("-");
  if (parts.length < 3) return null;
  const index = Number(parts[parts.length - 1]);
  const region = parts[0] as RegionId;
  if (!Number.isInteger(index) || !REGIONS.some((r) => r.id === region)) return null;
  return { region, category: parts.slice(1, -1).join("-"), index };
}

const roundPrice = (v: number) => Math.max(10, Math.round(v / 5) * 5) - 0.01;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** Closest named palette to a measured colour ("redmean" distance, cheap and perceptually decent). */
export function nearestPalette(hex: string): Palette {
  const [r1, g1, b1] = rgb(hex);
  let best = PALETTES[0];
  let bestD = Infinity;
  for (const p of PALETTES) {
    const [r2, g2, b2] = rgb(p.colors[0]);
    const rm = (r1 + r2) / 2;
    const d = (2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2;
    if (d < bestD) [best, bestD] = [p, d];
  }
  return best;
}

/**
 * `photos` (see scripts/fetch-photos.ts) is passed in rather than imported so the client bundle
 * never pulls in the photo manifest. Archetypes with photos cycle through them, and each SKU's
 * colour is re-matched to its photo so a "Ruby" sherwani is actually red.
 */
export function generateCatalog(seed = DEFAULT_SEED, variants = VARIANTS_PER_ARCHETYPE, photos: PhotoManifest = {}): CatalogItem[] {
  const rng = mulberry32(seed);
  const items: CatalogItem[] = [];
  const names = new Set<string>();
  // Prefer a fresh adjective on collision; the motif suffix is the last resort (combos are unique).
  const uniqueName = (base: string, motif: string, start: number) => {
    for (let k = 0; k < ADJECTIVES.length; k++) {
      const name = `${ADJECTIVES[(start + k) % ADJECTIVES.length]} ${base}`;
      if (!names.has(name)) return name;
    }
    return `${ADJECTIVES[start]} ${base} (${motif})`;
  };

  for (const region of REGIONS) {
    for (const category of region.categories) {
      const perArchetype: CatalogItem[][] = [];
      for (const arch of category.archetypes) {
        const batch: CatalogItem[] = [];
        perArchetype.push(batch);
        const fabrics = arch.fabrics ?? region.fabrics;
        const combos: Array<[number, number, number]> = [];
        for (let p = 0; p < PALETTES.length; p++)
          for (let f = 0; f < fabrics.length; f++)
            for (let m = 0; m < region.motifs.length; m++) combos.push([p, f, m]);
        shuffle(combos, rng);
        // AI photos are made per colour family, so they match a product's own colour exactly.
        const aiByFamily = new Map((photos[arch.name] ?? []).filter((p) => p.source === "ai" && p.family).map((p) => [p.family!, p]));
        const real = (photos[arch.name] ?? []).filter((p) => p.source !== "ai");
        const archPhotos = real.length >= MIN_PHOTOS ? real : [];

        for (const [k, [p, f, m]] of combos.slice(0, variants).entries()) {
          const aiPhoto = aiByFamily.get(PALETTES[p].family);
          const photo = aiPhoto ?? (archPhotos.length ? archPhotos[k % archPhotos.length] : undefined);
          // Real photos re-colour the product to match; an AI photo already matches its colour.
          const palette = photo && !aiPhoto ? nearestPalette(photo.color) : PALETTES[p];
          const fabric = fabrics[f];
          const [motif, pattern] = region.motifs[m];
          const name = uniqueName(`${palette.name} ${joinFabric(fabric, arch.name)}`, motif, Math.floor(rng() * ADJECTIVES.length));
          names.add(name);
          const [lo, hi] = arch.price;
          const price = roundPrice(lo + (hi - lo) * rng() ** 1.6);
          const compareAt = Math.max(price + 10, roundPrice(price * (1.15 + rng() * 0.75)));
          const badgeRoll = rng();
          const occasion = pick(OCCASIONS, rng);

          batch.push({
            id: "", // assigned below, once archetypes are interleaved
            name,
            region: region.id,
            category: category.id,
            archetype: arch.name,
            audience: arch.audience,
            silhouette: arch.silhouette,
            pattern,
            colors: palette.colors,
            colorName: palette.name,
            colorFamily: palette.family,
            price,
            compareAt,
            rating: Math.min(5, Math.round((3.8 + rng() * 1.25) * 10) / 10),
            reviews: Math.floor(rng() ** 2 * 9000) + 3,
            badge: badgeRoll < 0.2 ? BADGES[Math.floor(badgeRoll * 25)] : undefined,
            fabric,
            motif,
            ...(photo && {
              photo: { src: photo.src, w: photo.w, h: photo.h, bg: photo.bg },
              photoCredit: { title: photo.title, creator: photo.creator, license: photo.license, licenseUrl: photo.licenseUrl, sourceUrl: photo.sourceUrl, source: photo.source },
            }),
            blurb: pick(BLURBS, rng)({ fabric, motif, arch: arch.name, occasion }),
            sizes: SIZE_SETS[arch.sizes],
            tags: [region.name, category.name, arch.name, arch.audience, fabric, motif, palette.name, palette.family].map((t) =>
              t.toLowerCase(),
            ),
          });
        }
      }
      // Interleave archetypes so a category grid mixes garments instead of 90 of one in a row.
      let index = 0;
      for (let k = 0; k < variants; k++)
        for (const batch of perArchetype) if (batch[k]) items.push({ ...batch[k], id: itemId(region.id, category.id, index++) });
    }
  }
  return items;
}

export function toCard(item: CatalogItem): CardItem {
  const { motif: _m, blurb: _b, sizes: _s, tags: _t, photoCredit: _p, ...card } = item;
  return card;
}

export function buildIndex(items: CatalogItem[], seed = DEFAULT_SEED): CatalogIndex {
  const rng = mulberry32(seed ^ 0xfeed);
  // Lead with real photos where we have them.
  const byPhoto = (list: CatalogItem[]) => [...list.filter((i) => i.photo), ...list.filter((i) => !i.photo)];
  const featured = byPhoto(shuffle([...items], rng)).slice(0, 12).map(toCard);
  return {
    total: items.length,
    featured,
    regions: REGIONS.map((region) => {
      const regionItems = items.filter((i) => i.region === region.id);
      return {
        id: region.id,
        name: region.name,
        tagline: region.tagline,
        accent: region.accent,
        count: regionItems.length,
        categories: region.categories.map((c) => {
          const catItems = regionItems.filter((i) => i.category === c.id);
          const withPhoto = catItems.filter((i) => i.photo);
          return { id: c.id, name: c.name, count: catItems.length, cover: toCard(pick(withPhoto.length ? withPhoto : catItems, rng)) };
        }),
      };
    }),
  };
}

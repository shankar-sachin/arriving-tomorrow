# Catalog

All 6,120 products are generated at build time from a hand-curated taxonomy. There is no database: the catalog is read-only, so static JSON is faster and free to host.

## Pipeline

```
taxonomy.ts ──► generate.ts (seeded PRNG) ──► build-catalog.ts ──► public/catalog/
                                                                     ├─ index.json
                                                                     ├─ search.json
                                                                     └─ <region>/<category>.json
```

1. **Taxonomy** (`src/catalog/taxonomy.ts`): regions → categories → *archetypes*. Archetypes are real garments (Banarasi saree, sherwani, cowboy boots, crinoline ball gown…). Each region also has fabrics and motifs, and there are 30 shared colour palettes.
2. **Generator** (`src/catalog/generate.ts`): for each archetype, it lists every palette × fabric × motif combination, shuffles them with `mulberry32`, and keeps the first `VARIANTS_PER_ARCHETYPE` (90). Combos never repeat, and names are de-duplicated across the whole catalog.
3. **Determinism**: the same seed always gives the same catalog, so product URLs stay stable between builds.

## Current numbers

| Region | Categories | Archetypes | Products |
| --- | --- | --- | --- |
| India | 5 | 23 | 2,070 |
| America | 5 | 22 | 1,980 |
| Classical Europe | 5 | 23 | 2,070 |
| **Total** | **15** | **68** | **6,120** |

## Adding stuff

- **More of everything:** raise `VARIANTS_PER_ARCHETYPE` in `generate.ts`.
- **A new garment:** add an archetype to a category in `taxonomy.ts` with a `name`, a `silhouette`, a `price` band, and a `sizes` kind. You can optionally override its `fabrics`.
- **A new region:** add a `Region` entry (with fabrics, motifs, and categories) and add its id to `RegionId` in `types.ts`.
- **A new silhouette:** add a shape to `SHAPES` in `GarmentArt.tsx`, drawn in a 100×120 box, and add the name to the `Silhouette` type.

Changing the taxonomy or the seed changes generated IDs. That's fine (carts store snapshots), but old shared product links may point at different items.

Run `npm test` afterwards. The tests check counts, uniqueness, price sanity, and ID round-trips.

## Future options

The `docs/PLAN.md` roadmap covers moving to in-browser SQLite with FTS5 once the catalog gets very large, and a hosted database (Cloudflare D1 or Supabase) only if shared, written state is ever needed, such as a global "packages never delivered" counter.

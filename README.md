# Clothes Never Come

[![CI](https://github.com/shankar-sachin/clothesnevercome/actions/workflows/ci.yml/badge.svg)](https://github.com/shankar-sachin/clothesnevercome/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-ff3d7f.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=1b1033)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-7b2ff7?logo=vite&logoColor=white)](https://vite.dev/)
[![Catalog](https://img.shields.io/badge/catalog-6%2C120%20SKUs-ffb703)](docs/PLAN.md#3-the-catalog-the-big-one)
[![Deliveries](https://img.shields.io/badge/deliveries-0-1b1033)](#)
[![Coupon](https://img.shields.io/badge/coupon-FREE--CLOTHES-00b4a6)](#)

The online store where you can order anything you want, and none of it ever arrives.

Browse thousands of garments from India, America, and classical Europe. Fill your cart.
Check out for **$0.00**: the details fill themselves in and the `FREE-CLOTHES` coupon applies automatically.
Then watch a delivery truck that is always arriving *tomorrow*.

No accounts. No credit cards. No clothes.

## Features

- **6,120 procedurally generated products** across 3 regions, 15 categories, and 68 real garment archetypes (Banarasi sarees, sherwanis, cowboy boots, crinoline ball gowns, tricorne hats…)
- **Unique SVG art for every SKU**, built from silhouettes, palettes, and patterns
- **Shopping that feels real**: category chips, sorting, colour and price filters, search, infinite scroll, sizes, and a persistent cart
- **Self-filling parody checkout** with a typed-out coupon, a total that counts down to zero, and confetti
- **Order tracking that never resolves**: progress approaches 100% without reaching it, and the excuses rotate
- Spring animations everywhere, with `prefers-reduced-motion` respected throughout

## Getting started

```bash
npm install
npm run dev        # generates the catalog, then starts Vite
```

| Script | What it does |
| --- | --- |
| `npm run catalog` | Regenerates `public/catalog/` from the taxonomy (deterministic) |
| `npm run dev` | Catalog + dev server |
| `npm run build` | Catalog + typecheck + production build to `dist/` |
| `npm run typecheck` | `tsc` only |
| `npm test` | Vitest unit tests (generator, pricing, tracking, search) |

## How the catalog works

The catalog is read-only, so it ships as static data instead of living in a database:

1. `src/catalog/taxonomy.ts` holds hand-curated regions, categories, garment archetypes, fabrics, motifs, and colour palettes.
2. `src/catalog/generate.ts` expands them with a seeded PRNG into unique SKUs. The same seed always produces the same catalog, so URLs stay stable.
3. `scripts/build-catalog.ts` writes one JSON shard per category, plus `index.json` and `search.json`.

Want more stuff? Add archetypes to the taxonomy or raise `VARIANTS_PER_ARCHETYPE`. See [docs/PLAN.md](docs/PLAN.md) for the full plan, the database options, and the PR roadmap.

## Contributing

Work happens in pull requests. CI (typecheck → tests → build) must be green before merging.

## Security

See [SECURITY.md](SECURITY.md). Report vulnerabilities privately.

## License

[MIT](LICENSE) © 2026 shankar-sachin

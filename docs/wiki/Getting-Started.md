# Getting Started

## Requirements

- Node.js 22+
- npm 10+

## Run it

```bash
git clone https://github.com/shankar-sachin/arriving-tomorrow.git
cd arriving-tomorrow
npm install
npm run dev
```

`npm run dev` generates the catalog into `public/catalog/` and then starts Vite at http://localhost:5173.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run catalog` | Regenerates `public/catalog/` from the taxonomy |
| `npm run dev` | Catalog + dev server |
| `npm run build` | Catalog + typecheck + production build to `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | `tsc` only |
| `npm test` | Vitest unit tests |

## Project layout

```
src/
  catalog/       taxonomy, generator, and shared types
  components/    GarmentArt, ProductCard, ProductGrid, Header, ...
  pages/         one file per route
  lib/           cart store, pricing, tracking, catalog loader
  __tests__/     unit tests
scripts/
  build-catalog.ts   writes the JSON shards
docs/
  PLAN.md        build plan and PR roadmap
```

`public/catalog/` is generated and gitignored. Don't edit it by hand.

<h1 align="center">
  <img src="docs/brand/banner.png" alt="arriving tomorrow: Order everything. Receive nothing." width="100%">
</h1>

[![CI](https://github.com/shankar-sachin/arriving-tomorrow/actions/workflows/ci.yml/badge.svg)](https://github.com/shankar-sachin/arriving-tomorrow/actions/workflows/ci.yml)
[![Deploy](https://github.com/shankar-sachin/arriving-tomorrow/actions/workflows/deploy.yml/badge.svg)](https://github.com/shankar-sachin/arriving-tomorrow/actions/workflows/deploy.yml)
[![Live site](https://img.shields.io/badge/live-shankar--sachin.github.io-ff3d7f)](https://shankar-sachin.github.io/arriving-tomorrow/)
[![License: MIT](https://img.shields.io/badge/license-MIT-ff3d7f.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=1b1033)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-7b2ff7?logo=vite&logoColor=white)](https://vite.dev/)
[![Catalog](https://img.shields.io/badge/catalog-6%2C120%20SKUs-ffb703)](docs/PLAN.md#3-the-catalog-the-big-one)
[![Deliveries](https://img.shields.io/badge/deliveries-0-1b1033)](#)
[![Coupon](https://img.shields.io/badge/coupon-FREE--CLOTHES-00b4a6)](#)

**arriving tomorrow** (formerly Clothes Never Come) is the online store where you can order anything you want, and none of it ever arrives.

Browse thousands of garments from India, America, and classical Europe. Fill your cart.
Check out for **$0.00**: the details fill themselves in and the `FREE-CLOTHES` coupon applies automatically.
Then watch a delivery truck that is always arriving *tomorrow*.

No accounts. No credit cards. No clothes.

**Shop now (receive never):** https://shankar-sachin.github.io/arriving-tomorrow/

## Features

- **6,120 procedurally generated products** across 3 regions, 15 categories, and 68 real garment archetypes (Banarasi sarees, sherwanis, cowboy boots, crinoline ball gowns, tricorne hats…)
- **Unique SVG art for every SKU**, built from silhouettes, palettes, and patterns
- **Shopping that feels real**: category chips, sorting, colour and price filters, search, infinite scroll, sizes, and a persistent cart
- **Self-filling parody checkout** with a typed-out coupon, a total that counts down to zero, and confetti
- **Order tracking that never resolves**: progress approaches 100% without reaching it, and the excuses rotate
- **Gift links**: send any order to a friend, who gets their own never-arriving tracking page (the gift lives entirely in the URL)
- **Customer support** from Brenda, a scripted agent whose excuses escalate the longer you chat
- **16 achievements**, like "Spent $10,000 on nothing"
- **Installable app** (Add to Home Screen from Safari, or Install in Chrome) and **dark mode**
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

## AI product photos (Mac)

Product photos can be generated locally with [FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell) (Apache-2.0) on an Apple Silicon Mac. That's one studio photo per garment type × colour family (612 images), matched to every product of that colour.

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -U mflux pillow
python3 scripts/generate_photos.py --limit 5     # quick test first
python3 scripts/generate_photos.py               # the full run; resumable, shows an ETA
git add public/photos/ai && git commit -m "Add AI product photos" && git push
```

The first run downloads the model, which needs around 35 GB of free disk. Use `--quantize 4` on 16 GB Macs if memory is tight. After pushing, `npm run photos:ingest-ai` adds the images to the catalog, and they go through the same review as every other photo (`photo-approved.json`, `npm run photos:prune`). Every AI image is labelled as AI-generated on its product page.

## Deployment

Every push to `main` builds the site and deploys `dist/` to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). In **Settings → Pages**, the source must be set to **GitHub Actions** (not "Deploy from a branch"). More details are in the [wiki](https://github.com/shankar-sachin/arriving-tomorrow/wiki/Deployment).

It also deploys to **Vercel**, configured by [`vercel.json`](vercel.json): Vite build, `dist/` output, and a rewrite so deep links work. Vercel serves from `/`, so no `BASE_PATH` is needed there, and every pull request gets its own preview link.

## Documentation

The [wiki](https://github.com/shankar-sachin/arriving-tomorrow/wiki) covers architecture, the catalog generator, deployment, and an FAQ. Its source lives in [`docs/wiki/`](docs/wiki) and is published automatically on every merge to `main`.

## Contributing

Outside pull requests aren't accepted, but issues are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Everyone is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md). Pushing a `v*` tag publishes a GitHub release with that version's notes.

## Security

See [SECURITY.md](SECURITY.md). Report vulnerabilities privately.

## License

[MIT](LICENSE) © 2026 shankar-sachin

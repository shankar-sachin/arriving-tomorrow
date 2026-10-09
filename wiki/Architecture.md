# Architecture

A fully static single-page app. There is no server: the catalog ships as JSON files, and everything a shopper does lives in their own browser.

## Stack

| Layer | Choice |
| --- | --- |
| Build | Vite 8 |
| UI | React 19 + TypeScript 7 |
| Routing | React Router 7 (`BrowserRouter`, basename taken from Vite's `BASE_URL`) |
| Animation | Framer Motion + CSS keyframes, all honoring `prefers-reduced-motion` |
| State | Zustand with `persist` → `localStorage` |
| Effects | canvas-confetti |
| Fonts | Bricolage Grotesque + Instrument Serif, self-hosted via Fontsource |
| Tests | Vitest |

## Routes

| Path | Page |
| --- | --- |
| `/` | Home: hero, region cards, trending |
| `/shop/:region/:category?` | Product grid with sort, colour and price filters, infinite scroll |
| `/item/:id` | Product detail |
| `/search?q=` | Search across the whole catalog |
| `/cart` | Cart |
| `/checkout` | Self-filling parody checkout |
| `/orders` | Order history and lifetime savings |
| `/orders/:id` | Tracking that never completes |

## Data flow

1. `lib/catalogApi.ts` fetches `catalog/index.json`, one shard per category, or `search.json`, and caches each promise.
2. A product ID such as `india-kurtas-suits-0007` encodes its region and category, so a product page knows exactly which shard to load.
3. When you add an item to the cart, a compact *card* snapshot of it goes into the Zustand store. The cart and orders never need to refetch the catalog.

## Key modules

- **`lib/pricing.ts`**: `computeTotals(lines, coupon)` handles subtotal, shipping, and tax. `FREE-CLOTHES` (case-insensitive) discounts 100% of the gross.
- **`lib/tracking.ts`**: `trackingState(placedAt, now)` is a pure function of elapsed time. Progress is linear to 90% across the stages, then crawls asymptotically toward 99.99…% without ever reaching 100%. The ETA is always now + 1 day.
- **`components/GarmentArt.tsx`**: draws every product as SVG from a silhouette, an SVG `<pattern>`, and a three-colour palette.

## Privacy by design

No accounts, analytics, or runtime third-party requests. The checkout fields are read-only and filled with fake data, so no real payment information can ever be entered.

# Clothes Never Come: Build Plan

> A full online-shopping experience. Browse thousands of garments, fill your cart,
> check out for $0.00 with the auto-applied `FREE-CLOTHES` coupon, and then
> track a package that never, ever arrives.

## 1. Product pillars

| Pillar | What it means in practice |
| --- | --- |
| **Feels like real shopping** | Region → category → product grid, filters, sort, search, product pages, sizes, cart, checkout, order history, tracking. |
| **Dopamine everywhere** | Spring physics on every card, cart badge bounces, confetti at checkout, a total that counts down to $0.00, marquees, wobbly stickers. |
| **Zero friction, zero data** | No accounts, no real payment fields. Checkout fills itself with obviously fake details. Cart and orders live in `localStorage`. |
| **It never comes** | The tracker gets asymptotically close to "Delivered" (99.99…%) and stays there forever, cycling through excuses. The ETA is always *tomorrow*. |

Accessibility: every animation honors `prefers-reduced-motion`; all art has
`aria-label`s; the whole flow is keyboard-navigable.

## 2. Stack

- **Vite + React 19 + TypeScript** for a static SPA. No server is needed, because nothing is ever written anywhere except the user's own browser.
- **React Router**: `/`, `/shop/:region/:category?`, `/item/:id`, `/cart`, `/checkout`, `/orders`, `/orders/:id`.
- **Framer Motion** for layout animations, page transitions, springy hovers, and the delivery truck.
- **Zustand + `persist`** for the cart and orders, stored in `localStorage`.
- **canvas-confetti** for the coupon moment.
- **Vitest** for the generator, pricing, and tracking logic.
- **GitHub Actions CI**: catalog build → typecheck → test → production build on every PR.
- **Hosting**: any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages). Recommended: Cloudflare Pages or Vercel with per-PR preview deploys.

## 3. The catalog (the big one)

### 3.1 Do we need a database?

Mostly no, and that's good news. The catalog is **read-only**: shoppers never
create, edit, or buy anything real, and carts and orders live on-device. A
read-only catalog is best shipped as **static data generated at build time**.
That means no server, no cold starts, no bills, and CDN speed.

The options, ranked for this project:

| Option | Fit | When to pick it |
| --- | --- | --- |
| **A. Build-time generator → static JSON shards** *(chosen for v1)* | ★★★★★ | Thousands of SKUs, zero infra, deterministic, every PR diff is reviewable. |
| **B. Build-time SQLite file queried in-browser** (`sql.js` / `wa-sqlite` + FTS5) | ★★★★ | When we pass ~50k SKUs or want real full-text search and faceting without loading every shard. The generator just writes `catalog.sqlite` instead of JSON. |
| **C. Hosted Postgres** (Supabase / Neon) or **edge SQLite** (Turso / Cloudflare D1) | ★★★ | Only once we add *shared, written* state: a global "packages never delivered" counter, a live "people waiting" ticker, or community-submitted garments. |
| **D. Headless CMS** (Sanity / Payload) | ★★ | If a human team wants to hand-curate hero items, editorial drops, and copy without touching code. |

**Recommendation:** start with A. The data contract (`CatalogItem` in
`src/catalog/types.ts`) stays the same whichever backend sits behind it, so we
can move to B or C later without touching the UI. Add C (Cloudflare D1 or
Supabase) only for the fun global counters.

### 3.2 How we get thousands of real-feeling items

The catalog is a **curated taxonomy multiplied by a seeded combinatorial generator**:

1. **Hand-curated taxonomy** (`src/catalog/taxonomy.ts`): regions → categories →
   *archetypes*. Archetypes are real garment names with real fabrics and motifs:
   - **India**: Banarasi saree, lehenga choli, anarkali, kurta, sherwani, Nehru jacket, dhoti, mojari, dupatta…
   - **America**: denim jacket, varsity jacket, prairie dress, flannel shirt, cowboy boots, letterman sweater, poodle skirt…
   - **Classical Europe**: Regency gown, doublet, frock coat, corset bodice, crinoline ball gown, tricorne, waistcoat, cravat…
2. **Variation axes**: named color palettes, fabrics, motifs, adjectives, and
   price bands per archetype.
3. **Seeded PRNG** (`mulberry32`): the same seed always produces the same
   catalog, so IDs are stable, URLs are shareable, and tests are deterministic.
4. **Names, blurbs, ratings, and review counts** come from templates
   ("4.8★ from 2,341 people still waiting").
5. **Output**: `public/catalog/index.json` (regions, categories, counts),
   one shard per `region/category`, and a compact `search.json` index. The
   generator runs before `dev` and `build`, so its output is gitignored.

v1 targets **~6,000 unique SKUs**. Bumping `VARIANTS_PER_ARCHETYPE` scales that
up instantly.

### 3.3 Product imagery

Real product photos would need licensing, hosting, and moderation. Instead,
every SKU gets **procedural SVG art** (`<GarmentArt />`): a silhouette per
archetype (saree drape, lehenga flare, frock coat, crinoline bell, jeans,
tricorne…), filled with that SKU's palette and a pattern (paisley dots,
stripes, checks, brocade diamonds, zigzag, florals). The art is unique per
item, weighs nothing, scales to any size, and animates.

v1.0.0 ships with these drawings. **Real product images are planned for v1.1.0. See [section 6](#6-v110-real-product-images).**

Other later upgrade paths:
- **Open data enrichment**: Wikidata SPARQL for "traditional clothing by country" to expand archetypes into dozens more regions (Japan, Nigeria, Mexico, Korea, Scotland…), with each archetype's description linked back to its source.

## 4. The flow

1. **Home**: a "0 packages delivered since 2026" marquee, region cards, and trending picks.
2. **Shop**: category chips, sort (price, rating, "most waited for"), color and price filters, search, and infinite scroll. Cards tilt and pop on hover.
3. **Product page**: big animated art, size picker, "Add to cart (it won't come)". The cart badge bounces.
4. **Cart**: quantities and a running subtotal that feels expensive.
5. **Checkout**: the fields type themselves out. Shipping goes to "123 Nowhere Lane, Neverland". The card number is `FREE FREE FREE FREE`, the expiry is "Never", and the CVV is "LOL". The coupon field types `FREE-CLOTHES`, the discount slams in, the total rolls down to **$0.00**, and confetti fires. No input ever accepts real card data. The fields are read-only and the joke is obvious.
6. **Order tracking**: a timeline that moves through Placed → Packed → Shipped → Out for delivery, then sits at "Arriving tomorrow" forever. The progress bar approaches 100% and never reaches it. The truck drives, stalls, and reverses, and excuses rotate every few seconds.
7. **Orders**: every order you've ever placed, all "in transit", plus your lifetime "money saved".

## 5. PR roadmap

| PR | Scope |
| --- | --- |
| **v1.0.0** (shipped) | Plan, scaffold, taxonomy + generator (~6k SKUs), SVG art, shop/product/cart/checkout/tracking/orders, CI, unit tests. |
| **v1.1.0** | **Real product images** (see section 6). |
| #2 | Search upgrades (fuzzy matching, facets), URL-synced filters, skeleton loaders. |
| #3 | More regions (East Asia, Africa, Latin America, Middle East) via the Wikidata-assisted taxonomy. Target 15k+ SKUs. |
| #4 | Delight pass: add-to-cart flight animation, sound effects (muted by default), achievement toasts ("Spent $10k on nothing"). |
| #5 | Optional global counters on Cloudflare D1 / Supabase (option C). |
| #6 | Switch the catalog to in-browser SQLite with FTS5 (option B) once SKU count calls for it. |

Every PR runs CI (catalog → typecheck → tests → build). Merge once it's green.

## 6. v1.1.0: Real product images

### 6.1 Why v1 uses drawings

Every product is invented by the generator, so no photo of, say, a "Moonlit
Burgundy Georgette Banarasi Saree" exists anywhere. The two obvious shortcuts
are both off the table:

- **Scraping real store photos** means other brands' copyrighted images, shown next to fake prices. That's a legal problem and a trust problem.
- **Random stock photos** don't match the product. The listing says *Ruby Velvet Sherwani* and the photo shows a blue kurta.

So v1.1.0 needs images that are **ours to use** and **match each product's
garment, colour, and fabric**.

### 6.2 Options

| Option | Match quality | Cost | Verdict |
| --- | --- | --- | --- |
| **A. AI-generated product photos, baked at build time** | High: the prompt is built from archetype + palette + fabric + motif | One-off image-generation cost, plus storage | **Recommended** |
| B. Licensed stock (Unsplash / Pexels APIs) per archetype, filtered by colour | Medium: the right garment type, roughly the right colour, never the exact item | Free, but attribution is required and the APIs have hotlinking and rate rules | Fallback for archetypes A handles badly |
| C. Commissioned photography or flat-lays | Perfect | Expensive at any scale | Hero and marketing shots only |
| D. Keep SVG only | N/A | Free | Stays as the loading placeholder and error fallback |

### 6.3 Recommended approach (option A)

1. **Generate per archetype × palette, not per SKU.** That's 68 archetypes × 30 palettes = **2,040 images**, which covers all 6,120 SKUs. SKUs that share an archetype and palette share a photo; fabric and motif still differ in the text. This is about a third of the cost of per-SKU generation, and the generated catalog stays consistent.
2. **House style:** studio product shots on a warm cream backdrop, either ghost-mannequin or flat-lay. **No people or faces**, which avoids likeness and consent issues and keeps every image consistent.
3. **Prompt builder**: a new `scripts/build-images.ts` writes each prompt from the taxonomy, e.g. *"studio product photo, ghost mannequin, Kanjeevaram silk saree, saffron with deep pink border, temple-border motif, cream backdrop, soft light"*. Prompts are checked into the repo, so images are reproducible and reviewable in PRs.
4. **Cultural accuracy review.** Image models regularly get South Asian and historical European garments wrong (for example, a saree draped like a toga, or a lehenga that's really a ball gown). Every archetype gets a contact sheet that a human approves before its images ship, and rejected images are regenerated with prompt fixes.
5. **Formats and sizes:** AVIF and WebP at 400w (cards) and 1200w (product page) via `<picture>`/`srcset`, at roughly 40–120 KB each.
6. **Hosting:** keep the images **out of git**, because thousands of binaries bloat every clone. Upload them to object storage (Cloudflare R2 or S3) behind a CDN, keyed by `archetype/palette.avif`. The catalog shards gain an `image` field; the app falls back to the SVG when it's missing.
7. **Loading UX:** the SVG drawing renders instantly as the placeholder, and the photo cross-fades in once it loads (`loading="lazy"`, `decoding="async"`). Nothing ever shows a broken image.

### 6.4 v1.1.0 deliverables

| PR | Scope |
| --- | --- |
| 1.1.0-a | `image` field in `CatalogItem`, `<ProductImage>` with SVG fallback + cross-fade, `srcset` support. Ships with zero photos and changes nothing visually. |
| 1.1.0-b | `scripts/build-images.ts`: the prompt builder, generation runner, contact-sheet export, and upload to object storage |
| 1.1.0-c | Pilot: a single category (India → Sarees: 5 archetypes × 30 palettes = 150 images), reviewed and live |
| 1.1.0-d | Roll out the remaining 14 categories in batches, each with its own accuracy review |
| 1.1.0-e | Optional: licensed stock (option B) for any archetype that still fails review, with attribution shown on the product page |

### 6.5 Decisions needed before starting

- **Image generation provider and budget.** About 2,040 images, plus re-rolls for rejects.
- **Object storage account** (R2 or S3), and whether to put a custom domain in front of it.
- **Who signs off on cultural accuracy** for each region's contact sheets.

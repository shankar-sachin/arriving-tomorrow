# Changelog

All notable changes to Clothes Never Come. Releases are published automatically from this file when a `v*` tag is pushed (see `.github/workflows/release.yml`).

## [1.1.1] - 2026-10-03

The "now with someone to complain to" release.

### New
- **Send a package to a friend.** Any order can be turned into a gift link from its tracking page, with their name, your name and a message. Your friend gets their own tracking page for a gift that will never arrive. The whole gift lives in the link: no accounts, no server.
- **Customer support chat.** Brenda, Senior Delivery Optimist, is one tap away on every page. She's fully scripted (no AI, nothing leaves your browser), and her excuses get more unhinged the longer you talk. Asking for a manager gets you her manager, who is also Brenda.
- **Achievements.** 16 of them, from "Welcome to the waitlist" to "Spent $10,000 on nothing" and "Yeehaw, m'lady" (a crinoline ball gown and a cowboy hat in one order). They pop up as toasts and live on a new **/achievements** page.
- **Install it as an app.** A web app manifest and home-screen icons, so "Add to Home Screen" in Safari (or "Install app" in Chrome) gives you a full-screen app. A home-page banner explains how on iPhone, and **/app** has steps for every device. No App Store needed.
- **Dark mode.** Follows your system by default, with a sun/moon toggle in the header that remembers your choice and applies before the first paint, so there's no white flash.

### Behind the scenes
- **AI photo pipeline** for the garment types that still lack photos: `scripts/generate_photos.py` runs FLUX.1-schnell (Apache-2.0) locally on an Apple Silicon Mac, producing one studio photo per garment type × colour family (612). AI images are labelled as AI-generated. *(The images themselves arrive in a follow-up.)*
- **Automatic releases**: pushing a `v*` tag publishes a GitHub release with that version's notes from this changelog.
- The plan now covers v1.2.0: a unique AI photo for every product, AR try-on, and an unhinged in-browser AI support agent.

## [1.1.0] - 2026-10-03

The "it looks real now (it still won't come)" release.

### Real product photos
- **485 openly licensed photos** now cover **59 of the 68 garment types**, so **5,310 of 6,120 products** show a real photo. They come from Wikimedia Commons (including The Met's CC0 Costume Institute photos) and the Cleveland Museum of Art, and only CC0, public domain, CC BY, and CC BY-SA are kept.
- **Every photo was reviewed by hand.** 667 were rejected (wrong items, portraits, illustrations, brand logos, public figures) and blocklisted, and the build only ever uses approved photos.
- **Colour names match the photo**: a red gown is called "Burgundy", not "Camel". A saturated-hue analyser measures the garment, not the mannequin beside it.
- Photos cross-fade in over the drawings, which stay as the instant placeholder and the fallback. Product pages show the whole photo over a blurred backdrop, every product credits its photo, and a new **/credits** page lists them all.

### Shopping
- **Women / Men** in the header, plus a new **Shop all** page covering every region.
- **Advanced filters**: audience, region, garment, colour, fabric, pattern, price (presets plus min/max), rating, and 40%+ deals. Every option shows a live count, active filters appear as removable pills, and everything is **saved in the URL**, so filtered views are shareable.
- Category grids mix garment types instead of showing 90 of one in a row.

### Mobile
- Bottom tab bar, a header that hides on scroll, a filter bottom sheet, and a sticky add-to-cart bar.
- 44px tap targets, no iOS zoom-on-focus, safe-area insets, and heavy effects turned off on phones for smooth scrolling.

### Fixes
- **Clicking any link crashed the app in newer Chrome**, where `scrollTo()` returns a Promise that React treated as an effect cleanup. Fixed, with a regression test.
- The site now **deploys to GitHub Pages** properly (built output, correct base path, deep links survive refresh).
- Error boundaries show what went wrong instead of a blank page, and the app is protected from browser translation and extensions rewriting the page.

### Brand & project
- The **hanger-and-infinity logo** now appears on the favicon, header, footer, and README, and on the delivery truck.
- A wiki (auto-published from `docs/wiki/`), CONTRIBUTING (issues only), and a Code of Conduct.

## [1.0.0] - 2026-10-03

First release: 6,120 procedurally generated products across India, America, and classical Europe, with SVG art, a persistent cart, a self-filling $0.00 checkout with the `FREE-CLOTHES` coupon, and order tracking that never reaches 100%.

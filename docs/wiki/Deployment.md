# Deployment

The site is deployed to **GitHub Pages** by GitHub Actions. No Vercel or Netlify is needed.

**Live:** https://shankar-sachin.github.io/clothesnevercome/

## One-time setup

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

Don't use "Deploy from a branch" with `/ (root)`. The repository root holds *source* code: `index.html` points at `/src/main.tsx`, which browsers can't run, so you get a blank white page. The site must be served from the built `dist/` folder.

## How the workflow works

`.github/workflows/deploy.yml` runs on every push to `main` (or manually via **Run workflow**):

1. `npm ci`
2. `npm run build` with `BASE_PATH=/clothesnevercome/`, which generates the catalog, typechecks, and builds with every asset URL prefixed by the repo path
3. Copies `dist/index.html` to `dist/404.html`, so deep links like `/item/india-sarees-0001` still load the app on refresh (Pages has no rewrite rules)
4. Uploads `dist/` and deploys it with `actions/deploy-pages`

## Base path

- `vite.config.ts` reads `BASE_PATH` (it defaults to `/` for local dev).
- The router uses `import.meta.env.BASE_URL` as its `basename`.
- The catalog loader fetches from `BASE_URL + "catalog/…"`.

If you add a custom domain or move to a host serving from `/`, just drop the `BASE_PATH` env var.

## Other hosts

Any static host works: build with `npm run build`, serve `dist/`, and configure an SPA fallback to `index.html`. On Vercel, Netlify, or Cloudflare Pages that's a one-line rewrite rule.

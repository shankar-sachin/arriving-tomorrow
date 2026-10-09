# Deployment

The site is hosted on **Vercel**.

**Live:** https://arriving-tomorrow.vercel.app

## How it works

- Every push to `main` deploys to production.
- Every pull request gets a **preview deployment** with its own link, so changes can be tried on a phone before merging.
- [`vercel.json`](https://github.com/shankar-sachin/arriving-tomorrow/blob/main/vercel.json) sets the build:
  - `npm run build`, which generates the catalog, typechecks, and runs the Vite build
  - output from `dist/`
  - a rewrite of every path to `index.html`, so deep links like `/item/india-sarees-0001` or `/orders/…` load the app on refresh

## Setting it up from scratch

1. In Vercel, choose **Add New → Project**.
2. Import the `arriving-tomorrow` repository. If it isn't listed, use **Adjust GitHub App Permissions** to give Vercel access to it.
3. Keep the detected settings (Vite) and add no environment variables.
4. Deploy.

## Base path

Vercel serves the site from `/`, so `BASE_PATH` stays unset.

- `vite.config.ts` reads `BASE_PATH` and defaults to `/`.
- The router uses `import.meta.env.BASE_URL` as its `basename`.
- The catalog loader fetches from `BASE_URL + "catalog/…"`.

To serve from a sub-path instead (for example GitHub Pages at `/<repo>/`), build with `BASE_PATH=/<repo>/`.

## History

Until v1.1.1 the site was deployed to GitHub Pages by a GitHub Actions workflow, which copied `index.html` to `404.html` because Pages has no rewrite rules. It moved to Vercel for cleaner links and per-PR previews.

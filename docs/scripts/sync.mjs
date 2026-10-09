// Builds the generated docs pages from the repo's existing Markdown, so nothing is copied by hand.
// The sources (wiki/, README, PLAN, CHANGELOG, CONTRIBUTING) are never modified, which keeps the GitHub wiki sync intact.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITE = join(ROOT, "docs");
const GH = "https://github.com/shankar-sachin/arriving-tomorrow";

// [[Wiki Link]] targets -> site routes
const WIKI = {
  "Home": "/guide/getting-started",
  "Getting Started": "/guide/getting-started",
  "Architecture": "/guide/architecture",
  "Catalog": "/guide/catalog",
  "Deployment": "/guide/deployment",
  "FAQ": "/guide/faq",
};
// Repo-relative links -> site routes (anything else becomes a GitHub link)
const ROUTES = {
  "PLAN.md": "/roadmap",
  "CHANGELOG.md": "/changelog",
  "CONTRIBUTING.md": "/contributing",
  "wiki": "/guide/getting-started",
};

function fixLinks(md) {
  md = md.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, name, label) => {
    const route = WIKI[name.trim()];
    if (!route) throw new Error(`Unknown wiki link: ${name}`);
    return `[${label ?? name}](${route})`;
  });
  return md.replace(/\]\(((?!https?:|mailto:|#|\/)[^)\s]+?)(#[^)]*)?\)/g, (_, path, hash = "") => {
    const route = ROUTES[path];
    if (route) return `](${route}${hash})`;
    const kind = /\.\w+$/.test(path) ? "blob" : "tree";
    return `](${GH}/${kind}/main/${path}${hash})`;
  });
}

function emit(file, source, { title, edit, transform = (s) => s }) {
  let body = fixLinks(transform(readFileSync(join(ROOT, source), "utf8")));
  const front = ["---", `title: ${JSON.stringify(title)}`, `sourcePath: ${source}`, "---", ""].join("\n");
  const banner = `<!-- GENERATED from ${source} by docs/scripts/sync.mjs. Edit the source, not this file. -->\n\n`;
  writeFileSync(join(SITE, file), front + banner + body);
}

const guide = (file, src, title) => emit(`guide/${file}.md`, `wiki/${src}.md`, { title });
guide("getting-started", "Getting-Started", "Getting started");
guide("architecture", "Architecture", "Architecture");
guide("catalog", "Catalog", "Catalog");
emit("guide/deployment.md", "wiki/Deployment.md", {
  title: "Deployment",
  transform: (s) =>
    s.trimEnd() +
    `

## This documentation site

These docs are a [VitePress](https://vitepress.dev) site in \`docs/\`, deployed to GitHub Pages at https://shankar-sachin.github.io/arriving-tomorrow/ by \`.github/workflows/docs.yml\`. It rebuilds on every push to \`main\` that touches \`docs/\`, the README, the changelog or the contributing guide. The store itself is unaffected and stays on Vercel.

\`\`\`bash
npm run docs:dev      # live-reloading dev server
npm run docs:build    # static build to docs/.vitepress/dist
npm run docs:preview  # serve the build locally
\`\`\`
`,
});
guide("faq", "FAQ", "FAQ");
emit("roadmap.md", "PLAN.md", { title: "Roadmap" });
emit("changelog.md", "CHANGELOG.md", { title: "Changelog" });
emit("contributing.md", "CONTRIBUTING.md", { title: "Contributing" });
console.log("docs: generated pages from repo Markdown");

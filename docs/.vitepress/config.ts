import { defineConfig } from "vitepress";

const REPO = "https://github.com/shankar-sachin/arriving-tomorrow";
const STORE = "https://arriving-tomorrow.vercel.app";

export default defineConfig({
  title: "arriving tomorrow",
  description: "Order everything. Receive nothing. Docs and developer guide for the store that never delivers.",
  base: "/arriving-tomorrow/",
  lang: "en-US",
  cleanUrls: true,
  // The sync script lives here too; it is not a page.
  srcExclude: ["scripts/**"],
  // The getting-started page mentions the dev server URL; that is not a real link.
  ignoreDeadLinks: [/^http:\/\/localhost/],
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/arriving-tomorrow/favicon.svg" }],
    ["meta", { name: "theme-color", content: "#ff3d7f" }],
  ],
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "arriving tomorrow",
    nav: [
      { text: "Guide", link: "/guide/getting-started", activeMatch: "/guide/" },
      { text: "Roadmap", link: "/roadmap" },
      { text: "Changelog", link: "/changelog" },
      { text: "Contributing", link: "/contributing" },
      { text: "Open the store", link: STORE },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting started", link: "/guide/getting-started" },
          { text: "Architecture", link: "/guide/architecture" },
          { text: "Catalog", link: "/guide/catalog" },
          { text: "AI product photos", link: "/guide/ai-photos" },
          { text: "Deployment", link: "/guide/deployment" },
          { text: "FAQ", link: "/guide/faq" },
        ],
      },
      {
        text: "Project",
        items: [
          { text: "Roadmap", link: "/roadmap" },
          { text: "Changelog", link: "/changelog" },
          { text: "Contributing", link: "/contributing" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: REPO }],
    search: { provider: "local" },
    editLink: {
      // Generated pages carry their real source in frontmatter, so "edit" opens the original file.
      // This function is serialised into the client bundle, so it must not reference outer variables.
      pattern: ({ filePath, frontmatter }) =>
        `https://github.com/shankar-sachin/arriving-tomorrow/edit/main/${(frontmatter.sourcePath as string | undefined) ?? `docs/${filePath}`}`,
      text: "Edit this page on GitHub",
    },
    footer: {
      message: "Released under the MIT License. No clothes were delivered in the making of this site.",
      copyright: "© 2026 shankar-sachin",
    },
  },
});

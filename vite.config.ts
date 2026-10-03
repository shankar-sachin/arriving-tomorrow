import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  test: {
    environment: "node",
  },
});

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Vercel serves from "/". Set BASE_PATH to build for a sub-path host (e.g. GitHub Pages at /<repo>/).
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  test: {
    environment: "node",
  },
});

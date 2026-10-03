/**
 * App icons for the home screen / PWA manifest, rendered from the logo.
 *
 *   npx tsx scripts/build-icons.ts   → public/icons/*.png
 *
 * "any" icons are the rounded favicon; "maskable" ones are full-bleed with the mark inside the
 * safe zone, because Android crops them into circles, squircles and so on.
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

const GRADIENT = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3d7f"/><stop offset="1" stop-color="#7b2ff7"/></linearGradient>`;
const MARK = `
  <path d="M32 17C28 10.5 17.5 10.5 17.5 17S28 23.5 32 17 46.5 10.5 46.5 17 36 23.5 32 17Z" fill="none" stroke="#fff8e7" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M32 17v13L9.8 45.4c-1.7 1.2-.9 3.8 1.2 3.8h42c2.1 0 2.9-2.6 1.2-3.8L32 30" fill="none" stroke="#fff8e7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;

// Rounded square, like the favicon. Slightly inset so the mark breathes on a home screen.
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>${GRADIENT}</defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/><g transform="translate(32 34) scale(.86) translate(-32 -32)">${MARK}</g></svg>`;
// Full-bleed square, mark inside the 80% safe zone. (public/apple-touch-icon.png is hand-made.)
const square = (scale: number) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>${GRADIENT}</defs>
  <rect width="64" height="64" fill="url(#g)"/><g transform="translate(32 34) scale(${scale}) translate(-32 -32)">${MARK}</g></svg>`;

const jobs: Array<[string, string, number]> = [
  ["icon-192.png", rounded, 192],
  ["icon-512.png", rounded, 512],
  ["maskable-192.png", square(0.66), 192],
  ["maskable-512.png", square(0.66), 512],
];

mkdirSync(OUT, { recursive: true });
for (const [name, svg, size] of jobs) {
  await sharp(Buffer.from(svg), { density: (72 * size) / 64 }).resize(size, size).png({ compressionLevel: 9 }).toFile(join(OUT, name));
  console.log(`${name} (${size}px)`);
}

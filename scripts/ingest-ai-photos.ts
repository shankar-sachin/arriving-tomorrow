/**
 * Add AI photos produced by scripts/generate_photos.py to src/catalog/photos.json for review.
 *
 *   npm run photos:ingest-ai
 *
 * They still need approving in photo-approved.json (and `npm run photos:prune` for rejects),
 * exactly like fetched photos.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ColorFamily, Photo, PhotoManifest } from "../src/catalog/types";
import { analyse } from "./fetch-photos";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "src/catalog/photos.json");
const AI = join(ROOT, "public/photos/ai/manifest.json");

interface AiEntry { key: string; archetype: string; family: ColorFamily; src: string; w: number; h: number; prompt: string; seed: number; engine: string }

const entries: AiEntry[] = existsSync(AI) ? JSON.parse(readFileSync(AI, "utf8")) : [];
const manifest: PhotoManifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
let added = 0, skipped = 0;

for (const e of entries) {
  // Placeholders never enter the catalog (except in pipeline tests with --include-dummy).
  if (e.engine === "dummy" && !process.argv.includes("--include-dummy")) { skipped++; continue; }
  const { color, bg } = await analyse(readFileSync(join(ROOT, "public", e.src)));
  const photo: Photo = {
    key: e.key,
    src: e.src,
    w: e.w,
    h: e.h,
    color,
    bg,
    source: "ai",
    family: e.family,
    title: `AI-generated ${e.family} ${e.archetype}`,
    creator: "Generated with FLUX.1-schnell",
    license: "AI-generated",
    licenseUrl: "https://huggingface.co/black-forest-labs/FLUX.1-schnell",
    sourceUrl: "https://github.com/shankar-sachin/clothesnevercome/blob/main/scripts/ai-photo-jobs.json",
  };
  const list = (manifest[e.archetype] ??= []);
  const i = list.findIndex((p) => p.key === e.key);
  if (i >= 0) list[i] = photo; else list.push(photo);
  added++;
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + "\n");
console.log(`ingested ${added} AI photos${skipped ? `, skipped ${skipped} dummy placeholders` : ""}`);

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex, DEFAULT_SEED, generateCatalog, toCard, VARIANTS_PER_ARCHETYPE } from "../src/catalog/generate";
import approved from "../src/catalog/photo-approved.json";
import photos from "../src/catalog/photos.json";
import type { PhotoManifest } from "../src/catalog/types";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "catalog");
const write = (rel: string, data: unknown) => {
  const file = join(outDir, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data));
};

// Only reviewed photos ever reach the site (see scripts/prune-photos.ts).
const ok = new Set(Object.values(approved as Record<string, string[]>).flat());
const reviewed: PhotoManifest = Object.fromEntries(
  Object.entries(photos as PhotoManifest).map(([a, list]) => [a, list.filter((p) => ok.has(p.key) && (approved as Record<string, string[]>)[a]?.includes(p.key))]),
);
const items = generateCatalog(DEFAULT_SEED, VARIANTS_PER_ARCHETYPE, reviewed);
rmSync(outDir, { recursive: true, force: true });

const shards = new Map<string, typeof items>();
for (const item of items) {
  const key = `${item.region}/${item.category}`;
  shards.set(key, [...(shards.get(key) ?? []), item]);
}
for (const [key, shard] of shards) write(`${key}.json`, shard);

write("index.json", buildIndex(items));
write("search.json", items.map(toCard));

const withPhotos = items.filter((i) => i.photo).length;
console.log(`catalog: ${items.length} items across ${shards.size} shards (${withPhotos} with photos) → public/catalog`);

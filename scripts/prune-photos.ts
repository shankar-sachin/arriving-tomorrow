/**
 * Apply a photo review: keep only photos listed in src/catalog/photo-approved.json, delete the
 * other files, and add their keys to the blocklist so a future fetch never brings them back.
 *
 *   npm run photos:prune
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PhotoManifest } from "../src/catalog/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = <T,>(rel: string, fallback: T): T => (existsSync(join(ROOT, rel)) ? JSON.parse(readFileSync(join(ROOT, rel), "utf8")) : fallback);

const manifest = read<PhotoManifest>("src/catalog/photos.json", {});
const approved = read<Record<string, string[]>>("src/catalog/photo-approved.json", {});
const blocklist = new Set(read<string[]>("src/catalog/photo-blocklist.json", []));

// A photo can turn up under several archetypes; only blocklist keys approved nowhere.
const approvedAnywhere = new Set(Object.values(approved).flat());
let kept = 0, removed = 0;
for (const [archetype, photos] of Object.entries(manifest)) {
  const ok = new Set(approved[archetype] ?? []);
  manifest[archetype] = photos.filter((p) => {
    if (ok.has(p.key)) return ++kept, true;
    rmSync(join(ROOT, "public", p.src), { force: true });
    if (!approvedAnywhere.has(p.key)) blocklist.add(p.key);
    removed++;
    return false;
  });
}

writeFileSync(join(ROOT, "src/catalog/photos.json"), JSON.stringify(manifest, null, 1) + "\n");
writeFileSync(join(ROOT, "src/catalog/photo-blocklist.json"), JSON.stringify([...blocklist].sort(), null, 1) + "\n");
console.log(`kept ${kept}, removed ${removed}, blocklist now ${blocklist.size}`);

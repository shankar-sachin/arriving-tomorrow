import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex, generateCatalog, toCard } from "../src/catalog/generate";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "catalog");
const write = (rel: string, data: unknown) => {
  const file = join(outDir, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data));
};

const items = generateCatalog();
rmSync(outDir, { recursive: true, force: true });

const shards = new Map<string, typeof items>();
for (const item of items) {
  const key = `${item.region}/${item.category}`;
  shards.set(key, [...(shards.get(key) ?? []), item]);
}
for (const [key, shard] of shards) write(`${key}.json`, shard);

write("index.json", buildIndex(items));
write("search.json", items.map(toCard));

console.log(`catalog: ${items.length} items across ${shards.size} shards → public/catalog`);

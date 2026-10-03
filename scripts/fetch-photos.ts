/**
 * Fetch real, openly licensed photos for every archetype.
 *
 *   npx tsx scripts/fetch-photos.ts [--only "Sherwani,Doublet"] [--per 8]
 *
 * Sources: The Met (CC0), Wikimedia Commons (CC0 / PD / CC BY / CC BY-SA), and Pexels when
 * PEXELS_API_KEY is set. Photos are resized to WebP in public/photos/<archetype>/ and recorded,
 * with attribution, in src/catalog/photos.json. Keys listed in src/catalog/photo-blocklist.json
 * are never used. Runs in GitHub Actions (.github/workflows/photos.yml) because it needs the
 * open internet.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { REGIONS } from "../src/catalog/taxonomy";
import type { Photo, PhotoManifest } from "../src/catalog/types";
import { PHOTO_SOURCES } from "./photo-sources";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "src/catalog/photos.json");
const BLOCKLIST = join(ROOT, "src/catalog/photo-blocklist.json");
const UA = "ClothesNeverCome/1.1 (+https://github.com/shankar-sachin/clothesnevercome)";
const MET_DEPARTMENTS = new Set(["The Costume Institute", "Asian Art", "Islamic Art", "The American Wing"]);
const OPEN_LICENSE = /^(cc0|cc[- ]zero|public domain|pd\b|pd-|cc[- ]by(-sa)?[- ]\d)/i;

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const PER = Number(arg("per") ?? 8);
const ONLY = arg("only")?.split(",").map((s) => s.trim()).filter(Boolean);
const PEXELS_KEY = process.env.PEXELS_API_KEY;

export const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const stripHtml = (s = "") => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(url: string, init: RequestInit = {}, tries = 3): Promise<Response> {
  for (let t = 1; ; t++) {
    try {
      const res = await fetch(url, { ...init, headers: { "User-Agent": UA, ...(init.headers ?? {}) } });
      if (res.ok) return res;
      if (t >= tries || (res.status < 500 && res.status !== 429)) throw new Error(`${res.status} ${url}`);
    } catch (e) {
      if (t >= tries) throw e;
    }
    await sleep(800 * t);
  }
}
const json = async <T,>(url: string, init?: RequestInit) => (await get(url, init)).json() as Promise<T>;

interface Candidate extends Omit<Photo, "src" | "w" | "h" | "color" | "bg"> {
  key: string;
  imageUrl: string;
}

// ───────── Sources ─────────

async function fromMet(q: string, names: string[]): Promise<Candidate[]> {
  const search = await json<{ objectIDs: number[] | null }>(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(q)}`,
  );
  const out: Candidate[] = [];
  for (const id of (search.objectIDs ?? []).slice(0, 80)) {
    if (out.length >= PER * 2) break;
    try {
      const o = await json<Record<string, string | boolean>>(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
      const name = String(o.objectName ?? "").toLowerCase();
      if (!o.isPublicDomain || !o.primaryImageSmall || !MET_DEPARTMENTS.has(String(o.department))) continue;
      if (!names.some((n) => name.includes(n.toLowerCase()))) continue;
      out.push({
        key: `met:${id}`,
        imageUrl: String(o.primaryImageSmall),
        source: "met",
        title: [o.title, o.objectDate].filter(Boolean).join(", "),
        creator: String(o.artistDisplayName || o.culture || "Unknown maker"),
        license: "CC0 1.0",
        licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
        sourceUrl: String(o.objectURL),
      });
    } catch {
      /* skip broken objects */
    }
    await sleep(40); // stay well under the Met's 80 req/s limit
  }
  return out;
}

async function fromCommons(q: string): Promise<Candidate[]> {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=30" +
    `&gsrsearch=${encodeURIComponent(`${q} filetype:bitmap`)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1000`;
  const data = await json<{ query?: { pages: Record<string, { pageid: number; title: string; index: number; imageinfo?: Array<Record<string, unknown>> }> } }>(url);
  const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  const out: Candidate[] = [];
  for (const p of pages) {
    const info = p.imageinfo?.[0] as { thumburl?: string; width?: number; height?: number; mime?: string; descriptionurl?: string; extmetadata?: Record<string, { value: string }> } | undefined;
    const meta = info?.extmetadata ?? {};
    const license = stripHtml(meta.LicenseShortName?.value);
    if (!info?.thumburl || !/image\/(jpeg|png|webp)/.test(info.mime ?? "")) continue;
    if (Math.min(info.width ?? 0, info.height ?? 0) < 500) continue;
    if (!OPEN_LICENSE.test(license) || /\b(nc|nd)\b/i.test(license)) continue;
    // Files tagged with personality rights show identifiable people; skip them.
    if (/personality/i.test(meta.Restrictions?.value ?? "")) continue;
    out.push({
      key: `commons:${p.pageid}`,
      imageUrl: info.thumburl,
      source: "commons",
      title: stripHtml(meta.ObjectName?.value) || p.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, ""),
      creator: stripHtml(meta.Artist?.value) || "Unknown author",
      license,
      licenseUrl: meta.LicenseUrl?.value || "https://commons.wikimedia.org/wiki/Commons:Licensing",
      sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/?curid=${p.pageid}`,
    });
  }
  return out;
}

async function fromPexels(q: string): Promise<Candidate[]> {
  if (!PEXELS_KEY) return [];
  const data = await json<{ photos: Array<{ id: number; url: string; alt: string; photographer: string; src: { large: string } }> }>(
    `https://api.pexels.com/v1/search?per_page=20&query=${encodeURIComponent(q)}`,
    { headers: { Authorization: PEXELS_KEY } },
  );
  return data.photos.map((p) => ({
    key: `pexels:${p.id}`,
    imageUrl: p.src.large,
    source: "pexels" as const,
    title: p.alt || q,
    creator: p.photographer,
    license: "Pexels License",
    licenseUrl: "https://www.pexels.com/license/",
    sourceUrl: p.url,
  }));
}

// ───────── Image processing ─────────

const hex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/** Background = average of the border; garment colour = centre pixels that differ most from it. */
export async function analyse(buf: Buffer) {
  const N = 48;
  const px = await sharp(buf).resize(N, N, { fit: "fill" }).removeAlpha().raw().toBuffer();
  const at = (x: number, y: number) => [px[(y * N + x) * 3], px[(y * N + x) * 3 + 1], px[(y * N + x) * 3 + 2]];
  let bg = [0, 0, 0], n = 0, grey = 0;
  for (let i = 0; i < N; i++) for (const [x, y] of [[i, 0], [i, N - 1], [0, i], [N - 1, i]]) { const c = at(x, y); bg = bg.map((v, k) => v + c[k]); n++; }
  bg = bg.map((v) => v / n);
  const centre: Array<{ c: number[]; d: number }> = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const c = at(x, y);
      if (Math.max(...c) - Math.min(...c) < 18) grey++;
      if (x > N * 0.25 && x < N * 0.75 && y > N * 0.2 && y < N * 0.8) centre.push({ c, d: Math.hypot(c[0] - bg[0], c[1] - bg[1], c[2] - bg[2]) });
    }
  centre.sort((a, b) => b.d - a.d);
  const top = centre.slice(0, Math.max(20, Math.floor(centre.length * 0.4)));
  const color = [0, 1, 2].map((k) => top.reduce((s, p) => s + p.c[k], 0) / top.length);
  return { color: hex(color[0], color[1], color[2]), bg: hex(bg[0], bg[1], bg[2]), greyFraction: grey / (N * N) };
}

async function processCandidate(c: Candidate, dir: string): Promise<Photo | null> {
  const raw = Buffer.from(await (await get(c.imageUrl)).arrayBuffer());
  const img = sharp(raw).rotate();
  const meta = await img.metadata();
  if (Math.min(meta.width ?? 0, meta.height ?? 0) < 380) return null;
  const { color, bg, greyFraction } = await analyse(raw);
  if (greyFraction > 0.985) return null; // black-and-white photograph
  const file = `${c.key.replace(":", "-")}.webp`;
  const out = await img.resize({ width: 720, height: 900, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer({ resolveWithObject: true });
  writeFileSync(join(dir, file), out.data);
  const { key: _k, imageUrl: _u, ...credit } = c;
  return { ...credit, key: c.key, src: `photos/${dir.split("/").pop()}/${file}`, w: out.info.width, h: out.info.height, color, bg };
}

// ───────── Main ─────────

async function main() {
  const archetypes = REGIONS.flatMap((r) => r.categories.flatMap((c) => c.archetypes.map((a) => a.name)));
  const targets = ONLY ? archetypes.filter((a) => ONLY.includes(a)) : archetypes;
  const blocked = new Set<string>(existsSync(BLOCKLIST) ? JSON.parse(readFileSync(BLOCKLIST, "utf8")) : []);
  const manifest: PhotoManifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
  const report: string[] = [];

  for (const name of targets) {
    const src = PHOTO_SOURCES[name];
    if (!src) { report.push(`${name}: no sources configured`); continue; }
    const dir = join(ROOT, "public/photos", slug(name));
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });

    const lists = await Promise.all([
      src.met ? fromMet(src.met.q, src.met.names).catch((e) => (console.warn(`  met ${name}: ${e}`), [])) : [],
      ...(src.commons ?? []).map((q) => fromCommons(q).catch((e) => (console.warn(`  commons ${q}: ${e}`), []))),
      ...(src.pexels ?? []).map((q) => fromPexels(q).catch((e) => (console.warn(`  pexels ${q}: ${e}`), []))),
    ]);
    // Interleave sources so one archetype isn't all museum or all Commons.
    const queue: Candidate[] = [];
    const seen = new Set<string>();
    for (let i = 0; lists.some((l) => i < l.length); i++)
      for (const l of lists) if (l[i] && !seen.has(l[i].key) && !blocked.has(l[i].key)) { seen.add(l[i].key); queue.push(l[i]); }

    const photos: Photo[] = [];
    for (const c of queue) {
      if (photos.length >= PER) break;
      try {
        const p = await processCandidate(c, dir);
        if (p) photos.push(p);
      } catch (e) {
        console.warn(`  skip ${c.key}: ${e}`);
      }
    }
    manifest[name] = photos;
    const bySource = photos.reduce<Record<string, number>>((m, p) => ((m[p.source] = (m[p.source] ?? 0) + 1), m), {});
    const line = `${name}: ${photos.length}/${PER} from ${queue.length} candidates ${JSON.stringify(bySource)}`;
    report.push(line);
    console.log(line);
  }

  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST, JSON.stringify(sorted, null, 1) + "\n");
  const total = Object.values(sorted).reduce((n, l) => n + l.length, 0);
  console.log(`\nDone: ${total} photos across ${Object.keys(sorted).length} archetypes.`);
  const thin = report.filter((l) => /: [0-2]\//.test(l) || /no sources/.test(l));
  if (thin.length) console.log(`Thin coverage (<3):\n  ${thin.join("\n  ")}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();

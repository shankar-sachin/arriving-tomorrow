/**
 * Fetch real, openly licensed photos for every archetype.
 *
 *   npx tsx scripts/fetch-photos.ts [--only "Sherwani,Doublet"] [--per 8]
 *
 * Sources: The Met (CC0), Wikimedia Commons (CC0 / PD / CC BY / CC BY-SA), and Pexels when
 * PEXELS_API_KEY is set. Photos are resized to WebP in public/photos/<archetype>/ and recorded,
 * with attribution, in src/catalog/photos.json. Keys listed in src/catalog/photo-blocklist.json
 * are never used. Photos already approved (src/catalog/photo-approved.json) are kept; new ones
 * are added for review, and `npm run photos:prune` applies the review. Runs in GitHub Actions (.github/workflows/photos.yml) because it needs the
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
const APPROVED = join(ROOT, "src/catalog/photo-approved.json");
const UA = "ClothesNeverCome/1.1 (+https://github.com/shankar-sachin/clothesnevercome)";
const MET_DEPARTMENTS = new Set(["The Costume Institute", "Asian Art", "Islamic Art", "The American Wing"]);
const OPEN_LICENSE = /^(cc0|cc[- ]zero|public domain|pd\b|pd-|cc[- ]by(-sa)?[- ]\d)/i;

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const PER = Number(arg("per") ?? 8);
/** Only (re)fetch archetypes with fewer than this many approved photos. */
const THIN = Number(arg("thin") ?? Infinity);
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

let metGone = false;

async function fromMet(q: string, names: string[]): Promise<Candidate[]> {
  if (metGone) return [];
  let search: { objectIDs: number[] | null };
  try {
    search = await json(`https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(q)}`);
  } catch (e) {
    // As of Oct 2026 the Met's public API answers 410 Gone; stop asking after the first one.
    if (/^Error: 410 /.test(String(e))) {
      metGone = true;
      console.warn("  The Met API returned 410 Gone; skipping it for the rest of this run.");
      return [];
    }
    throw e;
  }
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

type CommonsPage = { pageid: number; title: string; index?: number; imageinfo?: Array<Record<string, unknown>> };
const COMMONS = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*";
const IMAGEINFO = "&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1000";

/** Turn Commons file pages into candidates, enforcing open licences and skipping people-rights files. */
function commonsCandidates(pages: CommonsPage[]): Candidate[] {
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

async function commonsSearch(search: string, limit = 30): Promise<Candidate[]> {
  const data = await json<{ query?: { pages: Record<string, CommonsPage> } }>(
    `${COMMONS}&generator=search&gsrnamespace=6&gsrlimit=${limit}&gsrsearch=${encodeURIComponent(search)}${IMAGEINFO}`,
  );
  return commonsCandidates(Object.values(data.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0)));
}

/** Keyword search (least precise; last resort). */
const fromCommons = (q: string) => commonsSearch(`${q} filetype:bitmap`);

/** The Met's own CC0 object photos, uploaded to Commons as "<Object name> MET <accession>.jpg". */
const fromMetOnCommons = (name: string) => commonsSearch(`intitle:"MET" intitle:"${name}" filetype:bitmap`, 40);

/**
 * Human-curated Commons categories. Find categories whose *title* contains a required term
 * (far more precise than searching file text), then take their files.
 */
async function fromCommonsCategories(cats: { search: string[]; must: string[]; not?: string[] }): Promise<{ cats: string[]; candidates: Candidate[] }> {
  const titles = new Set<string>();
  for (const q of cats.search) {
    const data = await json<{ query?: { search: Array<{ title: string }> } }>(
      `${COMMONS}&list=search&srnamespace=14&srlimit=15&srsearch=${encodeURIComponent(q)}`,
    );
    for (const { title } of data.query?.search ?? []) {
      const t = title.toLowerCase();
      if (cats.must.some((m) => t.includes(m.toLowerCase())) && !(cats.not ?? []).some((n) => t.includes(n.toLowerCase()))) titles.add(title);
    }
  }
  const chosen = [...titles].slice(0, 5);
  const candidates: Candidate[] = [];
  for (const cat of chosen) {
    const data = await json<{ query?: { pages: Record<string, CommonsPage> } }>(
      `${COMMONS}&generator=categorymembers&gcmtype=file&gcmlimit=60&gcmtitle=${encodeURIComponent(cat)}${IMAGEINFO}`,
    );
    candidates.push(...commonsCandidates(Object.values(data.query?.pages ?? {})));
  }
  return { cats: chosen, candidates };
}

/** Cleveland Museum of Art Open Access (CC0, no key), textiles and costume only. */
async function fromCleveland(q: string): Promise<Candidate[]> {
  const data = await json<{ data: Array<{ id: number; title: string; creation_date?: string; culture?: string[]; type?: string; department?: string; url: string; share_license_status?: string; images?: { web?: { url: string } } }> }>(
    `https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(q)}&has_image=1&cc0=1&limit=40`,
  );
  return data.data
    .filter((o) => o.images?.web?.url && o.share_license_status === "CC0" && (/textile|costume/i.test(o.type ?? "") || /textile/i.test(o.department ?? "")))
    .map((o) => ({
      key: `cma:${o.id}`,
      imageUrl: o.images!.web!.url,
      source: "cma" as const,
      title: [o.title, o.creation_date].filter(Boolean).join(", "),
      creator: o.culture?.[0] || "Unknown maker",
      license: "CC0 1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      sourceUrl: o.url,
    }));
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

/**
 * Background = average of the border. Garment colour = the dominant *saturated* hue among centre
 * pixels that differ from the background, so a red gown next to a white mannequin reads as red,
 * not as the pinkish-tan average of both. Mostly-unsaturated garments fall back to their mean.
 */
export async function analyse(buf: Buffer) {
  const N = 64;
  const px = await sharp(buf).resize(N, N, { fit: "fill" }).removeAlpha().raw().toBuffer();
  const at = (x: number, y: number) => [px[(y * N + x) * 3], px[(y * N + x) * 3 + 1], px[(y * N + x) * 3 + 2]];
  let bg = [0, 0, 0], n = 0, grey = 0;
  for (let i = 0; i < N; i++) for (const [x, y] of [[i, 0], [i, N - 1], [0, i], [N - 1, i]]) { const c = at(x, y); bg = bg.map((v, k) => v + c[k]); n++; }
  bg = bg.map((v) => v / n);

  const hsv = ([r, g, b]: number[]) => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    const h = d === 0 ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: h * 60, s: max === 0 ? 0 : d / max, v: max / 255 };
  };
  const garment: number[][] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const c = at(x, y);
      if (Math.max(...c) - Math.min(...c) < 18) grey++;
      const inCentre = x > N * 0.2 && x < N * 0.8 && y > N * 0.15 && y < N * 0.85;
      if (inCentre && Math.hypot(c[0] - bg[0], c[1] - bg[1], c[2] - bg[2]) > 40) garment.push(c);
    }
  const pool = garment.length >= 20 ? garment : [];
  const saturated = pool.filter((c) => { const v = hsv(c); return v.s > 0.28 && v.v > 0.15; });
  let color: number[];
  if (saturated.length >= Math.max(12, pool.length * 0.2)) {
    const BINS = 12;
    const weight = new Array(BINS).fill(0);
    for (const c of saturated) { const v = hsv(c); weight[Math.floor(v.h / (360 / BINS)) % BINS] += v.s; }
    const top = weight.indexOf(Math.max(...weight));
    const members = saturated.filter((c) => Math.floor(hsv(c).h / (360 / BINS)) % BINS === top);
    color = [0, 1, 2].map((k) => members.reduce((sum, c) => sum + c[k], 0) / members.length);
  } else {
    const src = pool.length ? pool : [at(N / 2, N / 2)];
    color = [0, 1, 2].map((k) => src.reduce((sum, c) => sum + c[k], 0) / src.length);
  }
  return { color: hex(color[0], color[1], color[2]), bg: hex(bg[0], bg[1], bg[2]), greyFraction: grey / (N * N) };
}

/** Recompute colours for photos already on disk (no network). */
async function reanalyse() {
  const manifest: PhotoManifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  let n = 0;
  for (const list of Object.values(manifest))
    for (const p of list) {
      const { color, bg } = await analyse(readFileSync(join(ROOT, "public", p.src)));
      Object.assign(p, { color, bg });
      n++;
    }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + "\n");
  console.log(`Re-analysed ${n} photos.`);
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
  const approvedCount = (a: string) => (existsSync(APPROVED) ? (JSON.parse(readFileSync(APPROVED, "utf8"))[a]?.length ?? 0) : 0);
  const targets = (ONLY ? archetypes.filter((a) => ONLY.includes(a)) : archetypes).filter((a) => approvedCount(a) < THIN);
  console.log(`Fetching ${targets.length} archetype(s), up to ${PER} photos each.`);
  const blocked = new Set<string>(existsSync(BLOCKLIST) ? JSON.parse(readFileSync(BLOCKLIST, "utf8")) : []);
  const manifest: PhotoManifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
  const approved: Record<string, string[]> = existsSync(APPROVED) ? JSON.parse(readFileSync(APPROVED, "utf8")) : {};
  const report: string[] = [];

  for (const name of targets) {
    const src = PHOTO_SOURCES[name];
    if (!src) { report.push(`${name}: no sources configured`); continue; }
    const dir = join(ROOT, "public/photos", slug(name));
    mkdirSync(dir, { recursive: true });
    // Keep reviewed photos; drop anything unreviewed from a previous run.
    const ok = new Set(approved[name] ?? []);
    const keep = (manifest[name] ?? []).filter((p) => ok.has(p.key));
    for (const p of manifest[name] ?? []) if (!ok.has(p.key)) rmSync(join(ROOT, "public", p.src), { force: true });

    const warn = (what: string) => (e: unknown) => (console.warn(`  ${what}: ${e}`), [] as Candidate[]);
    const catResult = src.cats ? await fromCommonsCategories(src.cats).catch((e) => (console.warn(`  cats ${name}: ${e}`), { cats: [], candidates: [] })) : { cats: [], candidates: [] };
    if (catResult.cats.length) console.log(`  categories: ${catResult.cats.join(" | ")}`);
    // Most precise sources first: museum objects, curated categories, then keyword search.
    const lists = await Promise.all([
      ...(src.metCommons ?? []).map((n) => fromMetOnCommons(n).catch(warn(`met-on-commons ${n}`))),
      ...(src.cma ?? []).map((q) => fromCleveland(q).catch(warn(`cleveland ${q}`))),
      Promise.resolve(catResult.candidates),
      src.met ? fromMet(src.met.q, src.met.names).catch(warn(`met ${name}`)) : [],
      ...(src.commons ?? []).map((q) => fromCommons(q).catch((e) => (console.warn(`  commons ${q}: ${e}`), []))),
      ...(src.pexels ?? []).map((q) => fromPexels(q).catch((e) => (console.warn(`  pexels ${q}: ${e}`), []))),
    ]);
    // Interleave sources so one archetype isn't all museum or all Commons.
    const queue: Candidate[] = [];
    const seen = new Set<string>(keep.map((p) => p.key));
    for (let i = 0; lists.some((l) => i < l.length); i++)
      for (const l of lists) if (l[i] && !seen.has(l[i].key) && !blocked.has(l[i].key)) { seen.add(l[i].key); queue.push(l[i]); }

    const photos: Photo[] = [...keep];
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
    const line = `${name}: ${photos.length}/${PER} (${keep.length} approved, ${photos.length - keep.length} new for review) from ${queue.length} candidates ${JSON.stringify(bySource)}`;
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

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) (process.argv.includes("--reanalyse") ? reanalyse() : main());

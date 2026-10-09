/**
 * Self-host MediaPipe pose landmarker model + tasks-vision wasm under public/models/mediapipe/,
 * so the AR try-on page never loads them from a CDN.
 *
 *   npm run fetch:pose
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/models/mediapipe");
const WASM_SRC = join(ROOT, "node_modules/@mediapipe/tasks-vision/wasm");
const WASM_OUT = join(OUT, "wasm");
// Pinned to version 1 (not "latest") so landmark output can't change under us between builds.
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const MODEL_OUT = join(OUT, "pose_landmarker_lite.task");
const MIN_BYTES = 1024 * 1024;

const fail = (msg: string): never => {
  console.error(`fetch:pose failed: ${msg}`);
  process.exit(1);
};

// Copy the wasm runtime, overwriting only when the size differs. The "_module" build is only
// loaded with FilesetResolver.forVisionTasks(path, true), which we don't use, so skip its 11 MB.
mkdirSync(WASM_OUT, { recursive: true });
const wasmFiles = readdirSync(WASM_SRC).filter((name) => !name.includes("_module_"));
for (const name of readdirSync(WASM_OUT)) if (!wasmFiles.includes(name)) rmSync(join(WASM_OUT, name));
for (const name of wasmFiles) {
  const src = join(WASM_SRC, name);
  const dest = join(WASM_OUT, name);
  if (!existsSync(dest) || statSync(dest).size !== statSync(src).size) copyFileSync(src, dest);
}

// Download the pose model unless a real copy (> 1 MB) is already present.
const sizeOf = (p: string) => (existsSync(p) ? statSync(p).size : 0);
if (sizeOf(MODEL_OUT) <= MIN_BYTES) {
  const part = `${MODEL_OUT}.part`;
  try {
    const res = await fetch(MODEL_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(part, Buffer.from(await res.arrayBuffer()));
  } catch (err) {
    // Global fetch ignores HTTPS_PROXY on some setups; curl honours it.
    console.warn(`fetch failed (${(err as Error).message}), retrying with curl`);
    rmSync(part, { force: true });
    const r = spawnSync("curl", ["-fsSL", "-o", part, MODEL_URL], { stdio: "inherit" });
    if (r.status !== 0) fail(`curl exited with ${r.status ?? r.signal}`);
  }
  if (sizeOf(part) < MIN_BYTES) {
    rmSync(part, { force: true });
    fail(`downloaded model is under 1 MB, refusing to use it`);
  }
  renameSync(part, MODEL_OUT);
}

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
console.log(`pose model: ${mb(sizeOf(MODEL_OUT))}, wasm: ${wasmFiles.length} files → public/models/mediapipe`);

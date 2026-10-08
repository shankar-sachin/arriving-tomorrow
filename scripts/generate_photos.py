#!/usr/bin/env python3
"""
Generate AI product photos with FLUX.1-schnell (Apache-2.0) on an Apple Silicon Mac.

Setup (once):
    python3 -m venv .venv && source .venv/bin/activate
    pip install -U mflux pillow

Run (resumable — rerun to continue where it stopped):
    python3 scripts/generate_photos.py                     # all 612 jobs
    python3 scripts/generate_photos.py --limit 10          # quick test
    python3 scripts/generate_photos.py --only "Sherwani,Doublet"
    python3 scripts/generate_photos.py --quantize 4        # 8–16 GB Macs

Reads scripts/ai-photo-jobs.json (built by `npm run photos:ai-jobs`), writes WebP files under
public/photos/ai/ and records them in public/photos/ai/manifest.json. Then commit and push both;
`npm run photos:ingest-ai` adds them to the catalog for review.
"""
from __future__ import annotations

import argparse
import inspect
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
JOBS = ROOT / "scripts" / "ai-photo-jobs.json"
MANIFEST = ROOT / "public" / "photos" / "ai" / "manifest.json"
OUT_W, OUT_H = 720, 900  # 4:5, matches the product cards


# ───────── Engines ─────────

def _python_gen(flux, steps: int, width: int, height: int):
    """Build gen(job) for the generate_image signature this mflux version has, and check it before the first image."""
    sig = inspect.signature(flux.generate_image)
    if "config" in sig.parameters:  # mflux 0.5 – 0.9: steps and sizes travel in a Config object
        try:
            from mflux.config.config import Config  # type: ignore
        except ImportError:
            from mflux.models.common.config import Config  # type: ignore
        cfg_extra = {"model_config": getattr(flux, "model_config", None)} if "model_config" in inspect.signature(Config).parameters else {}

        def make_args(job: dict) -> dict:
            return dict(seed=job["seed"], prompt=job["prompt"],
                        config=Config(num_inference_steps=steps, height=height, width=width, **cfg_extra))
    else:  # mflux 0.22+: steps and sizes are plain keyword arguments (see Flux1.generate_image)
        def make_args(job: dict) -> dict:
            return dict(seed=job["seed"], prompt=job["prompt"], num_inference_steps=steps, height=height, width=width)

    sig.bind(**make_args({"seed": 0, "prompt": ""}))  # raises TypeError now, not after the first image

    def gen(job: dict) -> Image.Image:
        result = flux.generate_image(**make_args(job))
        return getattr(result, "image", result)  # GeneratedImage.image is a PIL image

    return gen


def mflux_engine(quantize: int, steps: int, width: int, height: int):
    """Load FLUX.1-schnell once via mflux's Python API; fall back to its CLI if the API moved."""
    last: Exception | None = None
    attempts = [
        # mflux ≥ 0.10
        ("mflux.models.flux.variants.txt2img.flux", "Flux1", "mflux.models.common.config", "ModelConfig"),
        # mflux 0.5 – 0.9
        ("mflux.flux.flux", "Flux1", "mflux.config.model_config", "ModelConfig"),
    ]
    for flux_mod, flux_cls, cfg_mod, cfg_cls in attempts:
        try:  # only a wrong module layout moves on to the next attempt
            Flux1 = getattr(__import__(flux_mod, fromlist=[flux_cls]), flux_cls)
            ModelConfig = getattr(__import__(cfg_mod, fromlist=[cfg_cls]), cfg_cls)
        except (ImportError, AttributeError) as e:
            last = e
            continue
        # Real load errors (HF 401, network, OOM) propagate with their own message.
        flux = Flux1(model_config=ModelConfig.schnell(), quantize=quantize)
        print(f"engine: mflux Python API ({flux_mod})")
        return _python_gen(flux, steps, width, height)
    try:  # oldest public API
        from mflux import Flux1  # type: ignore
    except (ImportError, AttributeError) as e:
        last = e
    else:
        flux = Flux1.from_name(model_name="schnell", quantize=quantize)
        print("engine: mflux Python API (Flux1.from_name)")
        return _python_gen(flux, steps, width, height)

    cli = shutil.which("mflux-generate")
    if not cli:
        sys.exit(f"Couldn't load mflux ({last}). Install it with:  pip install -U mflux")
    print("engine: mflux-generate CLI (reloads the model each image, so it's slower)")

    def gen(job: dict) -> Image.Image:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out.png"
            subprocess.run(
                [cli, "--model", "schnell", "--prompt", job["prompt"], "--steps", str(steps), "--seed", str(job["seed"]),
                 "--width", str(width), "--height", str(height), "-q", str(quantize), "--output", str(out)],
                check=True,
            )
            return Image.open(out).copy()

    return gen


FAMILY_RGB = {
    "red": (190, 25, 45), "pink": (225, 60, 140), "orange": (240, 140, 30), "yellow": (240, 190, 20),
    "green": (10, 120, 85), "blue": (30, 70, 170), "purple": (100, 30, 150), "neutral": (230, 220, 200), "black": (25, 25, 30),
}


def dummy_engine(width: int, height: int):
    """No model: draws a placeholder. For testing the pipeline on machines without a GPU."""
    print("engine: dummy (placeholders, not real photos)")

    def gen(job: dict) -> Image.Image:
        img = Image.new("RGB", (width, height), (245, 240, 230))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle((width * 0.25, height * 0.15, width * 0.75, height * 0.9), radius=40, fill=FAMILY_RGB[job["family"]])
        d.text((20, 20), f"{job['archetype']} / {job['family']}", fill=(0, 0, 0))
        return img

    return gen


# ───────── Main ─────────

def to_webp(img: Image.Image) -> tuple[bytes, int, int]:
    img = img.convert("RGB")
    img.thumbnail((OUT_W, OUT_H), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=80, method=6)
    return buf.getvalue(), img.width, img.height


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", help="comma-separated archetype names")
    ap.add_argument("--limit", type=int, help="stop after this many new images")
    ap.add_argument("--quantize", type=int, default=8, choices=[3, 4, 6, 8], help="model quantisation (4 for 8–16 GB RAM)")
    ap.add_argument("--steps", type=int, default=4, help="schnell is tuned for 1–4 steps")
    ap.add_argument("--width", type=int, default=832)
    ap.add_argument("--height", type=int, default=1040)
    ap.add_argument("--engine", choices=["mflux", "dummy"], default="mflux")
    ap.add_argument("--overwrite", action="store_true", help="regenerate images that already exist")
    args = ap.parse_args()

    jobs = json.loads(JOBS.read_text())
    if args.only:
        wanted = {s.strip() for s in args.only.split(",")}
        jobs = [j for j in jobs if j["archetype"] in wanted]
    manifest = {e["key"]: e for e in (json.loads(MANIFEST.read_text()) if MANIFEST.exists() else [])}
    todo = [j for j in jobs if args.overwrite or not (ROOT / j["out"]).exists()]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{len(jobs) - len(todo)} already done, {len(todo)} to generate")
    if not todo:
        return

    gen = dummy_engine(args.width, args.height) if args.engine == "dummy" else mflux_engine(args.quantize, args.steps, args.width, args.height)
    started = time.time()
    for i, job in enumerate(todo, 1):
        t0 = time.time()
        data, w, h = to_webp(gen(job))
        out = ROOT / job["out"]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        manifest[job["key"]] = {k: job[k] for k in ("key", "archetype", "family", "prompt", "seed")} | {
            "src": job["out"].removeprefix("public/"), "w": w, "h": h, "engine": args.engine,
        }
        tmp = MANIFEST.with_suffix(".tmp")
        tmp.write_text(json.dumps(sorted(manifest.values(), key=lambda e: e["key"]), indent=1) + "\n")
        os.replace(tmp, MANIFEST)  # atomic, so stopping mid-run never corrupts it
        per = (time.time() - started) / i
        eta = per * (len(todo) - i)
        print(f"[{i}/{len(todo)}] {job['archetype']} · {job['family']}  {time.time() - t0:.1f}s  (eta {eta / 60:.0f} min)", flush=True)

    print(f"Done. Now: git add public/photos/ai && git commit -m 'Add AI product photos' && git push")


if __name__ == "__main__":
    main()

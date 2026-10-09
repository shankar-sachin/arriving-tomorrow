---
title: AI product photos
---

# AI product photos

Product photos can be generated locally with [FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell) (Apache-2.0) on an Apple Silicon Mac. That is one studio photo per garment type and colour family (68 types x 9 families = **612 images**), matched to every product of that colour. The dev VM and CI runners have no GPU, so the Mac is the practical place to run it.

## Requirements

- An Apple Silicon Mac and Python 3.
- Around **35 GB** of free disk for the first model download.
- Use `--quantize 4` on 8-16 GB Macs if memory is tight.

## Setup

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -U mflux pillow
```

## Hugging Face login

The model downloads from Hugging Face on first run. FLUX.1-schnell is Apache-2.0, but logging in avoids anonymous rate limits and is needed if the download asks for access:

```bash
pip install -U "huggingface_hub[cli]"
hf auth login          # older versions: huggingface-cli login
```

Paste a read-access token from your Hugging Face account settings. If the repo asks you to accept terms, open the model page once while signed in and accept them.

## Generate

The job list comes from `npm run photos:ai-jobs` (built from `scripts/ai-photo-prompts.ts`). The generator is resumable: rerun it and it continues where it stopped, showing an ETA.

```bash
python3 scripts/generate_photos.py --limit 5     # quick test first
python3 scripts/generate_photos.py               # the full run
```

| Flag | Effect |
| --- | --- |
| `--limit N` | Only the first N jobs, for a quick test |
| `--only "Sherwani,Doublet"` | Only those garment types |
| `--quantize 4` | Lower memory use, for 8-16 GB Macs |
| `--fast` | 720x896 and 2 steps, roughly 2-3x quicker |

Expect roughly 10-30 seconds per image. Output is WebP under `public/photos/ai/`, with a `manifest.json` recording each image.

## Commit, ingest and review

```bash
git add public/photos/ai && git commit -m "Add AI product photos" && git push
npm run photos:ingest-ai
```

`photos:ingest-ai` adds the images to `src/catalog/photos.json` so they go through the same review as every other photo: a human checks them on contact sheets, `photo-approved.json` is the allowlist, and `npm run photos:prune` deletes and blocklists everything else. The build only ever uses approved photos. Placeholder images from pipeline tests are skipped unless you pass `--include-dummy`.

Every AI image is labelled as AI-generated on its product page.

## What comes next

The [roadmap](/roadmap) covers a unique photo for every product (6,120 images), which needs object storage and automated checks.

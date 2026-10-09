// Instant-photo snapshot: the video frame, the AR overlay, and a band with the title and caption.

export interface SnapshotLayout {
  border: number;
  photo: { x: number; y: number; w: number; h: number };
  band: { x: number; y: number; w: number; h: number };
  title: { x: number; y: number; size: number };
  caption: { x: number; y: number; size: number };
  stamp: { x: number; y: number; size: number; rotation: number };
}

const CREAM = "#fbf6ee";
const INK = "#1c1530";
const MUTED = "#6b5b7b";
const STAMP = "rgba(255,61,127,0.85)";
const FONT = "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

export function snapshotLayout(photoW: number, photoH: number): SnapshotLayout {
  const m = Math.min(photoW, photoH);
  const border = Math.max(8, Math.round(0.04 * m));
  const bandH = Math.max(48, Math.round(0.18 * m));

  const photo = { x: border, y: border, w: photoW, h: photoH };
  const band = { x: border, y: border + photoH, w: photoW, h: bandH };

  // Title sits at ~40% of the band height (vertical middle), caption below it.
  const title = { x: band.x, y: band.y + 0.4 * bandH, size: 0.32 * bandH };
  const caption = { x: band.x, y: band.y + 0.72 * bandH, size: 0.2 * bandH };

  // Stamp: about 22% in from the photo's right edge and 15% down from its top.
  const stamp = {
    x: photo.x + photo.w * (1 - 0.22),
    y: photo.y + photo.h * 0.15,
    size: 0.08 * m,
    rotation: -0.25,
  };

  return { border, photo, band, title, caption, stamp };
}

export function snapshotSize(photoW: number, photoH: number): { width: number; height: number } {
  const { border, band } = snapshotLayout(photoW, photoH);
  return { width: photoW + 2 * border, height: photoH + 2 * border + band.h };
}

function drawInRect(
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource,
  rect: { x: number; y: number; w: number; h: number },
  mirrored: boolean,
) {
  ctx.save();
  if (mirrored) {
    ctx.translate(rect.x + rect.w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(src, 0, rect.y, rect.w, rect.h);
  } else {
    ctx.drawImage(src, rect.x, rect.y, rect.w, rect.h);
  }
  ctx.restore();
}

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}

export async function renderSnapshot(opts: {
  video: HTMLVideoElement;
  overlay: HTMLCanvasElement;
  mirrored: boolean;
  caption: string;
}): Promise<Blob> {
  const { video, overlay, mirrored, caption } = opts;
  const { width, height } = snapshotSize(video.videoWidth, video.videoHeight);
  const layout = snapshotLayout(video.videoWidth, video.videoHeight);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas context unavailable");

  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, width, height);

  // Video frame, then the overlay in the same rect (overlay is in unmirrored video coordinates).
  drawInRect(ctx, video, layout.photo, mirrored);
  drawInRect(ctx, overlay, layout.photo, mirrored);

  // Title and caption in the band.
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.font = `700 ${layout.title.size}px ${FONT}`;
  ctx.fillText("arriving tomorrow", layout.title.x, layout.title.y);
  ctx.fillStyle = MUTED;
  ctx.font = `${layout.caption.size}px ${FONT}`;
  ctx.fillText(caption, layout.caption.x, layout.caption.y);

  // Rubber stamp, rotated, with a rounded outline.
  const { size, rotation } = layout.stamp;
  const text = "IT NEVER CAME";
  ctx.font = `800 ${size}px ${FONT}`;
  const pad = size * 0.25;
  const boxW = ctx.measureText(text).width + pad * 2;
  const boxH = size * 1.1;
  // Keep the whole rotated stamp inside the photo: the layout only knows its centre, not the text width.
  const halfX = (boxW / 2) * Math.abs(Math.cos(rotation)) + (boxH / 2) * Math.abs(Math.sin(rotation));
  const halfY = (boxW / 2) * Math.abs(Math.sin(rotation)) + (boxH / 2) * Math.abs(Math.cos(rotation));
  const margin = layout.border;
  const x = Math.max(layout.photo.x + halfX + margin, Math.min(layout.stamp.x, layout.photo.x + layout.photo.w - halfX - margin));
  const y = Math.min(layout.photo.y + layout.photo.h - halfY - margin, Math.max(layout.stamp.y, layout.photo.y + halfY + margin));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = STAMP;
  ctx.strokeStyle = STAMP;
  ctx.lineWidth = 3;
  ctx.fillText(text, 0, 0);
  strokeRoundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, size * 0.2);
  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("snapshot encoding failed"));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function snapshotFilename(productName: string): string {
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return `arriving-tomorrow-${slug || "snapshot"}.png`;
}

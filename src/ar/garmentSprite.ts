import type { CardItem, Silhouette } from "../catalog/types";
import { INK, SHAPES, patternTileSvg } from "../components/garmentShapes";

/** Structurally identical to GarmentTransform in anchors.ts: video pixels, x/y = centre, rotation in radians. */
export interface SpriteTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GarmentSprite {
  image: CanvasImageSource;
  /** Anchor box in the image's own pixel space. */
  box: Box;
}

type SpriteItem = Pick<CardItem, "id" | "silhouette" | "pattern" | "colors">;

/** Size of the art's coordinate space (matches the viewBox in GarmentArt). */
export const ART_W = 100;
export const ART_H = 120;

/*
 * Anchor boxes, in the 100x120 art space, read off the paths in garmentShapes.ts.
 *
 * The renderer stretches this rectangle onto the body rect for the garment's anchor
 * (torso: shoulders->hips, torsoLong: shoulders->knees, full: shoulders->ankles,
 * lower: hips->ankles, skirt: hips->knees, head, neck). Anything outside the box (sleeves,
 * flared skirts, brims, tassels) overhangs naturally.
 *
 * Vertical: top = shoulder/neckline (where the outline meets the shoulder, not the collar
 * peaks), bottom = hem. Horizontal: the body width at the shoulder line / waist, i.e. between
 * the side seams, so sleeves and skirt flare are overhang. Per silhouette:
 *   shirt     side seams x30..70, shoulder y18, hem y104
 *   tunic     seams 28..72, shoulder y14, hem 112
 *   jacket    seams 28..72, shoulder 16, hem 92
 *   coat      hem flares 24..76, shoulder 14, hem 114 (knees)
 *   vest      seams 30..70, shoulder 14, hem 96 (centre points reach 98)
 *   corset    top edge 32..68, y16 (curve peak 16), bottom 98
 *   dress     bodice shoulders 36..64, neckline y12, hem 112 (skirt flares to 18..82)
 *   ballgown  bodice 34..66 (shoulders 40..60 plus margin), y10, hem 114 (flares to 6..94)
 *   anarkali  shoulders 26..74, y12, hem 114
 *   lehenga   blouse 34..66, y12, hem 114 (skirt flares to 10..90)
 *   saree     drape 30..70, y12, hem 112
 *   pants     waistband 30..70, y12, hem 114
 *   skirt     waistband 34..66, y30, hem 100 (flares to 14..86)
 *   hat       the whole hat including brim: x2..98, y32 (crown) to ~90 (brim curve)
 *   scarf     whole body without the fringe: x28..72, y10..108
 *   boots / shoes  whole shoe (no anchor today, so only used if one is added later)
 */
const BOXES: Record<Silhouette, Box> = {
  shirt: { x: 30, y: 18, w: 40, h: 86 },
  tunic: { x: 28, y: 14, w: 44, h: 98 },
  jacket: { x: 28, y: 16, w: 44, h: 76 },
  coat: { x: 24, y: 14, w: 52, h: 100 },
  vest: { x: 30, y: 14, w: 40, h: 82 },
  corset: { x: 32, y: 16, w: 36, h: 82 },
  dress: { x: 36, y: 12, w: 28, h: 100 },
  ballgown: { x: 34, y: 10, w: 32, h: 104 },
  anarkali: { x: 26, y: 12, w: 48, h: 102 },
  lehenga: { x: 34, y: 12, w: 32, h: 102 },
  saree: { x: 30, y: 12, w: 40, h: 100 },
  pants: { x: 30, y: 12, w: 40, h: 102 },
  skirt: { x: 34, y: 30, w: 32, h: 70 },
  hat: { x: 2, y: 32, w: 96, h: 58 },
  scarf: { x: 28, y: 10, w: 44, h: 98 },
  boots: { x: 36, y: 16, w: 54, h: 90 },
  shoes: { x: 8, y: 64, w: 84, h: 38 },
};

/** Sub-rectangle of the 100x120 art that lines up with the garment's anchor box. */
export function spriteBox(silhouette: Silhouette): Box {
  return { ...BOXES[silhouette] };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Standalone, static SVG (no shadow, no backdrop, transparent). `scale` multiplies the 100x120 size. */
export function garmentSvgString(item: SpriteItem, opts: { scale?: number } = {}): string {
  const scale = opts.scale ?? 1;
  const shape = SHAPES[item.silhouette];
  const [primary, secondary, accent] = item.colors.map(esc);
  const pid = `gp-${item.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const tile = patternTileSvg(pid, item.pattern, secondary);
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ART_W} ${ART_H}" width="${ART_W * scale}" height="${ART_H * scale}">`,
    tile ? `<defs>${tile}</defs>` : "",
    `<path d="${shape.body}" fill="${primary}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`,
    item.pattern !== "plain" ? `<path d="${shape.body}" fill="url(#${pid})" opacity="0.85"/>` : "",
    shape.accent
      ? `<path d="${shape.accent}" fill="${accent}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`
      : "",
    shape.detail
      ? `<path d="${shape.detail}" fill="none" stroke="${INK}" stroke-opacity="0.55" stroke-width="1.3" stroke-linecap="round"/>`
      : "",
    `</svg>`,
  ];
  return parts.join("");
}

const cache = new Map<string, Promise<GarmentSprite>>();

/** Rasterises the garment once per (item, scale). Browser only. */
export function loadGarmentSprite(item: SpriteItem, scale = 4): Promise<GarmentSprite> {
  const key = `${item.id}@${scale}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = (async (): Promise<GarmentSprite> => {
    const blob = new Blob([garmentSvgString(item, { scale })], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      let image: CanvasImageSource = img;
      if (typeof createImageBitmap === "function") {
        try {
          image = await createImageBitmap(img);
        } catch {
          // keep the HTMLImageElement
        }
      }
      const b = spriteBox(item.silhouette);
      return { image, box: { x: b.x * scale, y: b.y * scale, w: b.w * scale, h: b.h * scale } };
    } finally {
      URL.revokeObjectURL(url);
    }
  })();
  cache.set(key, p);
  p.catch(() => cache.delete(key));
  return p;
}

/**
 * Draws the sprite so that sprite.box fills a width x height rect centred on (t.x, t.y)
 * and rotated by t.rotation. The rest of the drawing overhangs the rect.
 */
export function drawGarment(
  ctx: CanvasRenderingContext2D,
  sprite: GarmentSprite,
  t: SpriteTransform,
  opacity = 0.92,
): void {
  const { box } = sprite;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(t.x, t.y);
  ctx.rotate(t.rotation);
  ctx.scale(t.width / box.w, t.height / box.h);
  ctx.drawImage(sprite.image, -(box.x + box.w / 2), -(box.y + box.h / 2));
  ctx.restore();
}

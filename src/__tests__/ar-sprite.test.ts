import { describe, expect, it } from "vitest";
import { drawGarment, garmentSvgString, spriteBox } from "../ar/garmentSprite";
import type { Silhouette } from "../catalog/types";

const ALL: Silhouette[] = [
  "saree", "lehenga", "tunic", "anarkali", "shirt", "jacket", "coat", "vest", "dress",
  "ballgown", "pants", "skirt", "corset", "hat", "boots", "shoes", "scarf",
];

const mk = (silhouette: Silhouette, pattern: "plain" | "stripes" | "floral" = "stripes") => ({
  id: `t-${silhouette}`,
  silhouette,
  pattern,
  colors: ["#aa1122", "#33bb44", "#5566cc"] as [string, string, string],
});

describe("garmentSvgString", () => {
  it.each(["shirt", "dress", "hat"] as Silhouette[])("builds a static svg for %s", (s) => {
    const svg = garmentSvgString(mk(s), { scale: 2 });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg).toContain('width="200"');
    expect(svg).toContain('height="240"');
    expect(svg).toContain("#aa1122");
    expect(svg).toContain("#33bb44");
    expect(svg).toContain("#5566cc");
    expect(svg).not.toMatch(/<animate|<ellipse|<rect[^>]*(?:width|height)="100%"|data-framer|style=/);
    expect(svg.match(/<svg/g)).toHaveLength(1);
    expect(svg.endsWith("</svg>")).toBe(true);
    // balanced tags: every open element is self-closed or has a closing tag
    const opens = (svg.match(/<(?!\/)[a-z]+[^>]*[^/]>/g) ?? []).length;
    const closes = (svg.match(/<\/[a-z]+>/g) ?? []).length;
    expect(opens).toBe(closes);
  });

  it("omits pattern defs for plain and references them otherwise", () => {
    expect(garmentSvgString(mk("shirt", "plain"))).not.toContain("<pattern");
    const svg = garmentSvgString(mk("shirt", "floral"));
    expect(svg).toContain('<pattern id="gp-t-shirt"');
    expect(svg).toContain('fill="url(#gp-t-shirt)"');
  });
});

describe("spriteBox", () => {
  it.each(ALL)("%s box is positive and inside the art", (s) => {
    const b = spriteBox(s);
    expect(b.w).toBeGreaterThan(0);
    expect(b.h).toBeGreaterThan(0);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.y).toBeGreaterThanOrEqual(0);
    expect(b.x + b.w).toBeLessThanOrEqual(100);
    expect(b.y + b.h).toBeLessThanOrEqual(120);
  });
});

describe("drawGarment", () => {
  it("maps the box onto the centred rect", () => {
    const calls: Array<[string, ...unknown[]]> = [];
    const rec = (name: string) => (...a: unknown[]) => void calls.push([name, ...a]);
    const ctx = {
      save: rec("save"), restore: rec("restore"), translate: rec("translate"),
      rotate: rec("rotate"), scale: rec("scale"), drawImage: rec("drawImage"),
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D;
    const image = {} as CanvasImageSource;
    drawGarment(ctx, { image, box: { x: 40, y: 60, w: 100, h: 200 } }, { x: 300, y: 400, width: 50, height: 100, rotation: 0.5 }, 0.5);
    expect(calls).toEqual([
      ["save"],
      ["translate", 300, 400],
      ["rotate", 0.5],
      ["scale", 0.5, 0.5],
      ["drawImage", image, -90, -160],
      ["restore"],
    ]);
    expect(ctx.globalAlpha).toBe(0.5);
    // box top-left (40,60) -> ((40-90)*0.5, (60-160)*0.5) = (-25,-50): the rect's top-left corner
    expect((40 - 90) * 0.5).toBe(-25);
    expect((60 - 160) * 0.5).toBe(-50);
  });
});

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Pattern, Silhouette } from "../catalog/types";
import { INK, SHAPES, patternTileSvg } from "./garmentShapes";

function PatternTile({ id, pattern, color }: { id: string; pattern: Pattern; color: string }) {
  const markup = patternTileSvg(id, pattern, color);
  return markup ? <g dangerouslySetInnerHTML={{ __html: markup }} /> : null;
}

interface Props {
  silhouette: Silhouette;
  pattern: Pattern;
  colors: [string, string, string];
  label: string;
  float?: boolean;
  className?: string;
}

export function GarmentArt({ silhouette, pattern, colors, label, float = false, className }: Props) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const shape = SHAPES[silhouette];
  const [primary, secondary, accent] = colors;
  const patternId = `p${uid}`;

  return (
    <motion.svg
      viewBox="0 0 100 120"
      role="img"
      aria-label={label}
      className={className}
      animate={float && !reduce ? { y: [0, -4, 0], rotate: [0, 1.5, 0, -1.5, 0] } : undefined}
      transition={float ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <defs>
        <PatternTile id={patternId} pattern={pattern} color={secondary} />
      </defs>
      <ellipse cx="50" cy="116" rx="34" ry="3" fill="rgba(27,16,51,0.12)" />
      <path d={shape.body} fill={primary} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      {pattern !== "plain" && <path d={shape.body} fill={`url(#${patternId})`} opacity="0.85" />}
      {shape.accent && <path d={shape.accent} fill={accent} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />}
      {shape.detail && (
        <path d={shape.detail} fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="1.3" strokeLinecap="round" />
      )}
    </motion.svg>
  );
}

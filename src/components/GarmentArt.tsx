import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Pattern, Silhouette } from "../catalog/types";

interface Shape {
  /** Main body, filled with primary + pattern. */
  body: string;
  /** Trim pieces, filled with the accent colour. */
  accent?: string;
  /** Seams and details, stroked. */
  detail?: string;
}

// All shapes live in a 100×120 box.
const SHAPES: Record<Silhouette, Shape> = {
  shirt: {
    body: "M32 18 L44 12 Q50 20 56 12 L68 18 L88 34 L78 46 L70 40 L70 104 L30 104 L30 40 L22 46 L12 34 Z",
    accent: "M30 98 L70 98 L70 104 L30 104 Z",
    detail: "M50 20 L50 98 M44 12 Q50 24 56 12",
  },
  tunic: {
    body: "M34 14 L44 10 Q50 18 56 10 L66 14 L84 34 L76 42 L68 36 L72 112 L28 112 L32 36 L24 42 L16 34 Z",
    accent: "M28 104 L72 104 L72 112 L28 112 Z M47 16 L53 16 L53 46 L47 46 Z",
    detail: "M24 42 L32 36 M76 42 L68 36",
  },
  jacket: {
    body: "M30 16 L44 10 L50 30 L56 10 L70 16 L88 36 L80 46 L72 40 L72 92 L28 92 L28 40 L20 46 L12 36 Z",
    accent: "M28 86 L72 86 L72 92 L28 92 Z M80 46 L88 36 L90 39 L82 49 Z M20 46 L12 36 L10 39 L18 49 Z",
    detail: "M44 10 L40 30 L50 52 M56 10 L60 30 L50 52 M50 52 L50 92",
  },
  coat: {
    body: "M30 14 L44 8 L50 28 L56 8 L70 14 L88 34 L80 44 L72 38 L76 114 L54 110 L50 60 L46 110 L24 114 L28 38 L20 44 L12 34 Z",
    accent: "M44 8 L40 28 L50 50 L60 28 L56 8 L50 28 Z",
    detail: "M50 50 L50 60 M45 62 h0.1 M45 72 h0.1 M45 82 h0.1",
  },
  vest: {
    body: "M34 14 L44 10 L50 34 L56 10 L66 14 L70 30 L70 92 L54 98 L50 92 L46 98 L30 92 L30 30 Z",
    accent: "M60 50 L68 50 L68 54 L60 54 Z M32 50 L40 50 L40 54 L32 54 Z",
    detail: "M50 34 L50 92 M53 46 h0.1 M53 60 h0.1 M53 74 h0.1",
  },
  dress: {
    body: "M40 12 Q50 20 60 12 L64 16 L60 46 L82 112 L18 112 L40 46 L36 16 Z",
    accent: "M39 44 L61 44 L61 50 L39 50 Z",
    detail: "M18 112 Q34 104 50 112 Q66 104 82 112",
  },
  ballgown: {
    body: "M42 10 Q50 16 58 10 L60 14 L57 44 Q96 70 94 114 L6 114 Q4 70 43 44 L40 14 Z",
    accent: "M41 42 L59 42 L57 48 L43 48 Z",
    detail: "M50 48 Q40 80 30 114 M50 48 Q60 80 70 114 M6 114 Q28 104 50 114 Q72 104 94 114",
  },
  anarkali: {
    body: "M38 12 Q50 20 62 12 L74 18 L80 50 L72 50 L66 30 L62 42 Q90 80 88 114 L12 114 Q10 80 38 42 L34 30 L28 50 L20 50 L26 18 Z",
    accent: "M12 106 Q50 98 88 106 L88 114 L12 114 Z M37 40 L63 40 L62 45 L38 45 Z",
    detail: "M50 45 Q46 80 40 114 M50 45 Q54 80 60 114",
  },
  lehenga: {
    body: "M38 12 Q50 18 62 12 L66 30 L34 30 Z M36 36 L64 36 L90 114 L10 114 Z",
    accent: "M13 104 L87 104 L90 114 L10 114 Z M36 36 L64 36 L65 41 L35 41 Z",
    detail: "M50 41 L50 114 M43 41 L30 114 M57 41 L70 114",
  },
  saree: {
    body: "M40 12 Q50 18 60 12 L64 30 L70 112 L30 112 L36 30 Z",
    accent: "M60 12 L76 18 L66 62 L38 112 L30 112 L58 52 Z",
    detail: "M30 104 L70 104",
  },
  pants: {
    body: "M30 12 L70 12 L74 114 L55 114 L50 44 L45 114 L26 114 Z",
    accent: "M30 12 L70 12 L70 20 L30 20 Z",
    detail: "M50 20 L50 44 M38 20 Q38 30 30 32 M62 20 Q62 30 70 32",
  },
  skirt: {
    body: "M34 30 L66 30 L86 100 L14 100 Z",
    accent: "M34 30 L66 30 L67 37 L33 37 Z",
    detail: "M42 37 L34 100 M50 37 L50 100 M58 37 L66 100",
  },
  corset: {
    body: "M32 20 Q50 12 68 20 Q60 50 66 94 Q50 100 34 94 Q40 50 32 20 Z",
    accent: "M32 20 Q50 12 68 20 L67 25 Q50 18 33 25 Z",
    detail: "M50 18 L50 98 M46 30 L54 36 M54 30 L46 36 M46 46 L54 52 M54 46 L46 52 M46 62 L54 68 M54 62 L46 68 M46 78 L54 84 M54 78 L46 84",
  },
  hat: {
    body: "M8 80 Q50 100 92 80 Q98 74 86 72 L72 72 Q74 34 50 32 Q26 34 28 72 L14 72 Q2 74 8 80 Z",
    accent: "M29 62 L71 62 L72 72 L28 72 Z",
    detail: "M14 76 Q50 90 86 76",
  },
  boots: {
    body: "M36 16 L62 16 L62 80 Q86 82 90 96 L90 104 L36 104 Z",
    accent: "M36 98 L90 98 L90 106 L36 106 Z M36 16 L62 16 L62 24 L36 24 Z",
    detail: "M62 80 L56 98 M40 40 Q49 46 58 40",
  },
  shoes: {
    body: "M10 86 Q14 64 40 66 Q58 68 72 76 Q92 80 90 96 L10 96 Z",
    accent: "M8 96 L92 96 L92 102 L8 102 Z",
    detail: "M40 66 Q44 78 56 72 M30 80 Q50 86 74 80",
  },
  scarf: {
    body: "M36 10 L64 10 L60 60 L72 108 L54 108 L50 72 L46 108 L28 108 L40 60 Z",
    accent: "M36 10 L64 10 L63 18 L37 18 Z",
    detail: "M28 108 v6 M33 108 v6 M38 108 v6 M43 108 v6 M57 108 v6 M62 108 v6 M67 108 v6 M72 108 v6",
  },
};

function PatternTile({ id, pattern, color }: { id: string; pattern: Pattern; color: string }) {
  const common = { id, patternUnits: "userSpaceOnUse" as const };
  switch (pattern) {
    case "stripes":
      return (
        <pattern {...common} width="8" height="8" patternTransform="rotate(35)">
          <rect width="3" height="8" fill={color} />
        </pattern>
      );
    case "dots":
      return (
        <pattern {...common} width="9" height="9">
          <circle cx="4.5" cy="4.5" r="1.7" fill={color} />
        </pattern>
      );
    case "checks":
      return (
        <pattern {...common} width="12" height="12">
          <rect width="6" height="12" fill={color} opacity="0.45" />
          <rect width="12" height="6" fill={color} opacity="0.45" />
        </pattern>
      );
    case "paisley":
      return (
        <pattern {...common} width="16" height="16">
          <path d="M8 3 Q13 6 10 11 Q7 14 5 11 Q4 8 7 9 Q9 7 8 3 Z" fill={color} />
        </pattern>
      );
    case "brocade":
      return (
        <pattern {...common} width="12" height="12">
          <path d="M6 1 L11 6 L6 11 L1 6 Z" fill="none" stroke={color} strokeWidth="1.2" />
          <circle cx="6" cy="6" r="1.3" fill={color} />
        </pattern>
      );
    case "zigzag":
      return (
        <pattern {...common} width="12" height="8">
          <polyline points="0,6 3,2 6,6 9,2 12,6" fill="none" stroke={color} strokeWidth="1.5" />
        </pattern>
      );
    case "floral":
      return (
        <pattern {...common} width="14" height="14">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={7 + 2.4 * Math.cos((a * Math.PI) / 180)} cy={7 + 2.4 * Math.sin((a * Math.PI) / 180)} r="1.6" fill={color} />
          ))}
          <circle cx="7" cy="7" r="1.1" fill="#fff8e7" />
        </pattern>
      );
    case "plain":
      return null;
  }
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
      <path d={shape.body} fill={primary} stroke="#1b1033" strokeWidth="1.6" strokeLinejoin="round" />
      {pattern !== "plain" && <path d={shape.body} fill={`url(#${patternId})`} opacity="0.85" />}
      {shape.accent && <path d={shape.accent} fill={accent} stroke="#1b1033" strokeWidth="1.2" strokeLinejoin="round" />}
      {shape.detail && (
        <path d={shape.detail} fill="none" stroke="#1b1033" strokeOpacity="0.55" strokeWidth="1.3" strokeLinecap="round" />
      )}
    </motion.svg>
  );
}

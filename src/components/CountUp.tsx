import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { money } from "../lib/format";

/** Animates a dollar figure from wherever it was to `value`. */
export function CountUp({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = money(value);
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = money(v)),
    });
    from.current = value;
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <span ref={ref}>{money(value)}</span>;
}

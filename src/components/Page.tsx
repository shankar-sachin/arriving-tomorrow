import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** Wraps a route so it fades/slides in and out with AnimatePresence. */
export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      className={`page ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}

export function Loading({ label = "Unpacking the catalog" }: { label?: string }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      {label}…
    </div>
  );
}

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { unlock } from "../lib/achievements";
import { applyTheme, resolveTheme, systemPrefersDark, useTheme } from "../lib/theme";

function useSystemDark() {
  const [dark, setDark] = useState(systemPrefersDark);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => setDark(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return dark;
}

export function ThemeToggle() {
  const choice = useTheme((s) => s.choice);
  const set = useTheme((s) => s.set);
  const systemDark = useSystemDark();
  const dark = resolveTheme(choice, systemDark) === "dark";

  // Keeps <meta name="theme-color"> in sync when the system theme changes under "system".
  useEffect(() => applyTheme(choice), [choice, systemDark]);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    // Picking what the system already does means "follow the system" again.
    set(next === (systemDark ? "dark" : "light") ? "system" : next);
    if (next === "dark") unlock("lights-out");
  };

  return (
    <button className="theme-btn" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}>
      <motion.svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" key={dark ? "moon" : "sun"} initial={{ rotate: -90, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
        {dark ? (
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" fill="currentColor" />
        ) : (
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.2" fill="currentColor" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </g>
        )}
      </motion.svg>
    </button>
  );
}

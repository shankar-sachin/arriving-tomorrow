import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { itemCount } from "../lib/pricing";
import { useShop } from "../lib/store";

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TABS = [
  { to: "/", label: "Home", end: true, d: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { to: "/shop/all", label: "Shop", end: false, d: "M9 4 4 6l1 5h2v9h10v-9h2l1-5-5-2a3 3 0 0 1-6 0Z" },
  { to: "/orders", label: "Orders", end: false, d: "M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19.5a1.5 1.5 0 1 0 0-.01M17 19.5a1.5 1.5 0 1 0 0-.01" },
  { to: "/cart", label: "Cart", end: false, d: "M5 7h14l-1.5 12a1 1 0 0 1-1 .9H7.5a1 1 0 0 1-1-.9zM9 7a3 3 0 0 1 6 0" },
];

/** Thumb-reachable tab bar for phones (hidden on wider screens via CSS). */
export function BottomNav() {
  const count = useShop((s) => itemCount(s.cart));
  const pulse = useShop((s) => s.pulse);
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className="tab">
          <span className="tab-icon">
            {icon(t.d)}
            {t.label === "Cart" && count > 0 && (
              <motion.b key={pulse} className="tab-badge" initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
                {count}
              </motion.b>
            )}
          </span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

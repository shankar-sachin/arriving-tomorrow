import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ACHIEVEMENTS, earnedFromShop, unlock, useAchievements } from "../lib/achievements";
import { useShop } from "../lib/store";

/** Unlocks the order/cart achievements whenever orders or the cart change. */
function useShopAchievements() {
  const orders = useShop((s) => s.orders);
  const cart = useShop((s) => s.cart);
  useEffect(() => {
    earnedFromShop(orders, cart).forEach(unlock);
  }, [orders, cart]);
}

/** Opened from the home screen (iOS sets navigator.standalone; everything else uses display-mode). */
export const isStandalone = () =>
  (typeof navigator !== "undefined" && (navigator as Navigator & { standalone?: boolean }).standalone === true) ||
  (typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches);

export function AchievementToasts() {
  useShopAchievements();
  const current = useAchievements((s) => s.queue[0]);
  const dismiss = useAchievements((s) => s.dismiss);

  useEffect(() => {
    if (isStandalone()) unlock("home-screen");
  }, []);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, 4200);
    return () => clearTimeout(t);
  }, [current, dismiss]);

  const a = ACHIEVEMENTS.find((x) => x.id === current);

  return (
    <div className="toast-zone" aria-live="polite">
      <AnimatePresence mode="wait">
        {a && (
          <motion.div
            key={a.id}
            className="toast"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            <span className="toast-medal" aria-hidden="true">★</span>
            <Link to="/achievements" onClick={dismiss}>
              <small>Achievement unlocked</small>
              <strong>{a.title}</strong>
              <span>{a.blurb}</span>
            </Link>
            <button className="toast-x" onClick={dismiss} aria-label="Dismiss">×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

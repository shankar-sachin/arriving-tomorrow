import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { CountUp } from "../components/CountUp";
import { Page } from "../components/Page";
import { money } from "../lib/format";
import { computeTotals, COUPON_CODE, itemCount } from "../lib/pricing";
import { useShop } from "../lib/store";

// Obviously fake, read-only details. The page never accepts real payment info.
const FIELDS: Array<{ group: string; label: string; value: string; wide?: boolean }> = [
  { group: "Shipping", label: "Full name", value: "A. Valued Customer" },
  { group: "Shipping", label: "Email", value: "you@never.arrives" },
  { group: "Shipping", label: "Address", value: "123 Nowhere Lane, Apt ∞", wide: true },
  { group: "Shipping", label: "City", value: "Neverland" },
  { group: "Shipping", label: "Postcode", value: "00000" },
  { group: "Payment", label: "Card number", value: "FREE FREE FREE FREE", wide: true },
  { group: "Payment", label: "Expiry", value: "Never" },
  { group: "Payment", label: "CVV", value: "LOL" },
];

// Character offset at which each field starts typing.
const OFFSETS = FIELDS.map((_, i) => FIELDS.slice(0, i).reduce((n, f) => n + f.value.length, 0));
const TOTAL_CHARS = FIELDS.reduce((n, f) => n + f.value.length, 0);
const COUPON_START = TOTAL_CHARS + 6;
const COUPON_END = COUPON_START + COUPON_CODE.length;

export function Checkout() {
  const liveCart = useShop((s) => s.cart);
  // Keep showing the last non-empty cart so the exit animation after ordering doesn't flash $0 or redirect.
  const snapshot = useRef(liveCart);
  if (liveCart.length) snapshot.current = liveCart;
  const cart = snapshot.current;
  const placed = useRef(false);
  const placeOrder = useShop((s) => s.placeOrder);
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(reduce ? COUPON_END + 1 : 0);
  const fired = useRef(false);

  useEffect(() => {
    if (tick > COUPON_END) return;
    const t = setTimeout(() => setTick((n) => n + 1), tick < TOTAL_CHARS ? 22 : 70);
    return () => clearTimeout(t);
  }, [tick]);

  const couponTyped = COUPON_CODE.slice(0, Math.max(0, tick - COUPON_START));
  const applied = tick > COUPON_END;
  const totals = computeTotals(cart, applied ? COUPON_CODE : null);

  useEffect(() => {
    if (!applied || fired.current || reduce) return;
    fired.current = true;
    const colors = ["#ff3d7f", "#ffb703", "#00b4a6", "#7b2ff7", "#3a86ff"];
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 }, colors }), 250);
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 }, colors }), 400);
  }, [applied, reduce]);

  if (!liveCart.length && !placed.current) return <Navigate to="/cart" replace />;

  const groups = ["Shipping", "Payment"];

  const submit = () => {
    placed.current = true;
    const order = placeOrder();
    if (!order) return;
    if (!reduce) confetti({ particleCount: 220, spread: 140, startVelocity: 45, origin: { y: 0.4 } });
    navigate(`/orders/${order.id}`);
  };

  return (
    <Page className="checkout">
      <h1 className="page-title">Checkout <span className="serif">(the easy part)</span></h1>
      <p className="lede">Sit back. We're filling this in for you. You won't need a card, because it's all free.</p>
      <div className="cart-layout">
        <div className="autofill">
          {groups.map((g) => (
            <fieldset key={g}>
              <legend>{g}</legend>
              <div className="fields">
                {FIELDS.map((f, i) => {
                  if (f.group !== g) return null;
                  const offset = OFFSETS[i];
                  const shown = f.value.slice(0, Math.max(0, tick - offset));
                  const typing = tick >= offset && tick < offset + f.value.length;
                  return (
                    <label key={f.label} className={`field ${f.wide ? "wide" : ""} ${typing ? "typing" : ""}`}>
                      <span>{f.label}</span>
                      <input readOnly tabIndex={-1} value={shown} aria-label={f.label} />
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <p className="fine">This is a parody checkout. Every field is read-only and filled with fake data. Nothing is collected, charged, or sent anywhere.</p>
        </div>

        <aside className="summary">
          <h2>Order summary</h2>
          <div className="row"><span>Items ({itemCount(cart)})</span><span>{money(totals.subtotal)}</span></div>
          <div className="row"><span>Never-Delivery shipping</span><span>{money(totals.shipping)}</span></div>
          <div className="row"><span>Tax</span><span>{money(totals.tax)}</span></div>
          <div className={`coupon ${applied ? "applied" : ""}`}>
            <span>Coupon</span>
            <code>{couponTyped || " "}{!applied && tick >= COUPON_START && <i className="caret" />}</code>
          </div>
          <AnimatePresence>
            {applied && (
              <motion.div className="row discount" initial={{ opacity: 0, scale: 1.6, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
                <span>FREE-CLOTHES (100% off)</span>
                <span>−{money(totals.discount)}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="row total"><span>Total</span><CountUp value={totals.total} duration={1.6} /></div>
          <motion.button className="btn btn-primary btn-block btn-xl" disabled={!applied} onClick={submit} whileTap={{ scale: 0.95 }} animate={applied && !reduce ? { scale: [1, 1.05, 1] } : undefined} transition={{ repeat: Infinity, duration: 1.6 }}>
            {applied ? "Place order for $0.00" : "Applying your discount…"}
          </motion.button>
          <Link to="/cart" className="link center-link">Back to cart</Link>
        </aside>
      </div>
    </Page>
  );
}

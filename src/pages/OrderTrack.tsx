import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GiftComposer } from "../components/GiftComposer";
import { ProductImage } from "../components/ProductImage";
import { LogoMark } from "../components/Logo";
import { Page } from "../components/Page";
import { unlock } from "../lib/achievements";
import { money } from "../lib/format";
import { useShop } from "../lib/store";
import { NEVER, STAGES, trackingState } from "../lib/tracking";

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

function Truck() {
  const reduce = useReducedMotion();
  return (
    <div className="road" aria-hidden="true">
      <div className="road-house">⌂</div>
      <motion.svg
        className="truck"
        viewBox="0 0 64 36"
        animate={reduce ? undefined : { x: ["0%", "560%", "520%", "600%", "540%", "0%"], scaleX: [1, 1, 1, 1, -1, -1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.5, 0.6, 0.65, 1] }}
      >
        <rect x="2" y="6" width="38" height="20" rx="3" fill="#fff8e7" stroke="#1b1033" strokeWidth="2" />
        <LogoMark x={13} y={7.5} size={17} />
        <path d="M40 12 h12 l8 8 v6 h-20 z" fill="#ffb703" stroke="#1b1033" strokeWidth="2" strokeLinejoin="round" />
        <rect x="44" y="14" width="7" height="5" fill="#c9fff9" />
        <circle cx="14" cy="28" r="5" fill="#463b5e" stroke="#fbf6ec" strokeWidth="2" />
        <circle cx="48" cy="28" r="5" fill="#463b5e" stroke="#fbf6ec" strokeWidth="2" />
      </motion.svg>
    </div>
  );
}

export function OrderTrack() {
  const { id } = useParams();
  const order = useShop((s) => s.orders.find((o) => o.id === id));
  const now = useNow();
  const placedAt = order?.placedAt;

  useEffect(() => {
    if (placedAt === undefined) return;
    if (Date.now() - placedAt > 86_400_000) unlock("still-tomorrow");
    const t = setTimeout(() => unlock("watched-pot"), 120_000);
    return () => clearTimeout(t);
  }, [placedAt]);

  if (!order) {
    return (
      <Page className="center">
        <h1>We can't find that order.</h1>
        <p className="lede">Which, to be fair, is also what will happen to the clothes.</p>
        <Link to="/orders" className="btn btn-primary">Your orders</Link>
      </Page>
    );
  }

  const t = trackingState(order.placedAt, now);
  const stages = [...STAGES, NEVER];
  const units = order.lines.reduce((n, l) => n + l.qty, 0);

  return (
    <Page className="track">
      <section className="track-hero">
        <span className="eyebrow">Order {order.id}</span>
        <h1>Arriving <span className="serif">tomorrow.</span></h1>
        <p className="lede">
          Estimated delivery: {t.eta.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}.
          Check back tomorrow and it'll still say tomorrow.
        </p>
        <Truck />
        <div className="progress" role="progressbar" aria-valuenow={Math.floor(t.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <motion.div className="progress-fill" animate={{ width: `${t.progress * 100}%` }} transition={{ duration: 0.9 }} />
          <span>{(t.progress * 100).toFixed(t.progress > 0.9 ? 4 : 0)}%</span>
        </div>
        <div className="excuse">
          <span className="live-dot" /> Live update:{" "}
          <AnimatePresence mode="wait">
            <motion.em key={t.excuse} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {t.excuse}
            </motion.em>
          </AnimatePresence>
        </div>
      </section>

      <div className="track-layout">
        <ol className="timeline">
          {stages.map((s, i) => {
            const state = i < t.stage ? "done" : i === t.stage ? "current" : "todo";
            return (
              <motion.li key={s.label} className={state} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <span className="node" />
                <div>
                  <strong>{s.label}</strong>
                  <small>
                    {s === NEVER ? "Never" : state === "todo" ? "Pending" : new Date(order.placedAt + s.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </small>
                </div>
              </motion.li>
            );
          })}
        </ol>

        <aside className="summary">
          <h2>{units} {units === 1 ? "item" : "items"} on the way-ish</h2>
          <ul className="mini-lines">
            {order.lines.map((l) => (
              <li key={l.key}>
                <span className="mini-art" style={{ background: l.item.colors[1] }}>
                  <ProductImage item={l.item} />
                </span>
                <span>{l.item.name}<small> × {l.qty} · {l.size}</small></span>
              </li>
            ))}
          </ul>
          <div className="row"><span>Retail value</span><span>{money(order.totals.subtotal + order.totals.shipping + order.totals.tax)}</span></div>
          <div className="row discount"><span>FREE-CLOTHES</span><span>−{money(order.totals.discount)}</span></div>
          <div className="row total"><span>You paid</span><span>{money(order.totals.total)}</span></div>
          <Link to="/" className="btn btn-primary btn-block">Order more nothing</Link>
          <GiftComposer order={order} />
        </aside>
      </div>
    </Page>
  );
}

import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ProductImage } from "../components/ProductImage";
import { Page } from "../components/Page";
import { unlock } from "../lib/achievements";
import { money } from "../lib/format";
import { decodeGift } from "../lib/gift";
import { NEVER, STAGES, trackingState } from "../lib/tracking";
import { useNow } from "./OrderTrack";

export function Gift() {
  const [params] = useSearchParams();
  const gift = decodeGift(params.get("d"));
  const now = useNow();
  const valid = gift !== null;

  useEffect(() => {
    if (valid) unlock("gifted");
  }, [valid]);

  if (!gift) {
    return (
      <Page className="center">
        <h1>This gift got lost.</h1>
        <p className="lede">The link looks broken. Honestly, that's the most on-brand way a gift from us could go missing.</p>
        <Link to="/" className="btn btn-primary">Go shopping instead</Link>
      </Page>
    );
  }

  const t = trackingState(gift.placedAt, now);
  const units = gift.items.reduce((n, l) => n + l.qty, 0);
  const from = gift.from || "Someone who loves you";

  return (
    <Page className="track gift">
      <section className="track-hero">
        <span className="eyebrow">A gift{gift.to ? ` for ${gift.to}` : ""}</span>
        <h1>
          {from} sent you <span className="serif">something.</span>
        </h1>
        {gift.message && (
          <motion.blockquote className="gift-note" initial={{ opacity: 0, rotate: -3, y: 12 }} animate={{ opacity: 1, rotate: -1.5, y: 0 }} transition={{ delay: 0.2 }}>
            “{gift.message}”
            <cite>{from}</cite>
          </motion.blockquote>
        )}
        <p className="lede">
          It's {money(gift.value)} of {units === 1 ? "clothing" : `clothing (${units} items)`}, and it's arriving tomorrow. It will always be arriving tomorrow.
        </p>
        <div className="progress" role="progressbar" aria-valuenow={Math.floor(t.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <motion.div className="progress-fill" animate={{ width: `${t.progress * 100}%` }} transition={{ duration: 0.9 }} />
          <span>{(t.progress * 100).toFixed(t.progress > 0.9 ? 4 : 0)}%</span>
        </div>
        <div className="excuse">
          <span className="live-dot" /> {[...STAGES, NEVER][t.stage].label}:{" "}
          <AnimatePresence mode="wait">
            <motion.em key={t.excuse} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {t.excuse}
            </motion.em>
          </AnimatePresence>
        </div>
      </section>

      <div className="gift-items">
        {gift.items.map((l, i) => (
          <motion.figure key={`${l.item.id}-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
            <div className="gift-art" style={{ background: l.item.colors[1] }}>
              <ProductImage item={l.item} />
            </div>
            <figcaption>
              {l.item.name}
              <small>× {l.qty} · {l.size}</small>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <div className="gift-cta">
        <h2>Return the favour?</h2>
        <p className="lede">Send them something back. It's free with FREE-CLOTHES, and it'll arrive at exactly the same time.</p>
        <Link to="/" className="btn btn-primary btn-xl">Send a gift back</Link>
      </div>
    </Page>
  );
}

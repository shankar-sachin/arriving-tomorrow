import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { unlock } from "../lib/achievements";
import { giftFromOrder, giftUrl, MAX_GIFT_ITEMS, MAX_MESSAGE, MAX_NAME } from "../lib/gift";
import type { Order } from "../lib/store";

/** Turns an order into a shareable link. Everything lives in the URL: no accounts, no server. */
export function GiftComposer({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "failed">("idle");

  const url = () => giftUrl(giftFromOrder(order, from, to, message));
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const share = async () => {
    try {
      await navigator.share({
        title: "A gift from Clothes Never Come",
        text: `${from.trim() || "Someone"} sent you a gift. It's arriving tomorrow.`,
        url: url(),
      });
      setStatus("shared");
      unlock("regifter");
    } catch (e) {
      // Closing the share sheet isn't a failure.
      if ((e as Error).name !== "AbortError") setStatus("failed");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setStatus("copied");
      unlock("regifter");
    } catch {
      setStatus("failed");
    }
  };

  if (!open) {
    return (
      <button className="btn btn-ghost btn-block gift-open" onClick={() => setOpen(true)}>
        Send this to a friend instead
      </button>
    );
  }

  return (
    <motion.div className="gift-composer" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
      <h3>Gift it</h3>
      <p className="fine">
        They get a link with their own tracking page. It never arrives for them either.
        {order.lines.length > MAX_GIFT_ITEMS && ` The link shows the first ${MAX_GIFT_ITEMS} items.`}
      </p>
      <label className="field">
        <span>Their name</span>
        <input value={to} onChange={(e) => setTo(e.target.value)} maxLength={MAX_NAME} placeholder="Priya" />
      </label>
      <label className="field">
        <span>Your name</span>
        <input value={from} onChange={(e) => setFrom(e.target.value)} maxLength={MAX_NAME} placeholder="Your secret admirer" />
      </label>
      <label className="field">
        <span>Message</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={MAX_MESSAGE} rows={3} placeholder="Saw this and thought of you. You'll never see it." />
      </label>
      <div className="gift-actions">
        {canShare && <button className="btn btn-primary" onClick={share}>Share</button>}
        <button className={`btn ${canShare ? "btn-ghost" : "btn-primary"}`} onClick={copy}>Copy link</button>
      </div>
      <AnimatePresence mode="wait">
        {status !== "idle" && (
          <motion.p key={status} className={`gift-status ${status}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {status === "copied" && "Link copied. Go ruin someone's week."}
            {status === "shared" && "Sent. They'll be waiting forever."}
            {status === "failed" && "Couldn't share that. Very on-brand of us. Try Copy link."}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

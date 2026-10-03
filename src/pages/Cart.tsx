import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CountUp } from "../components/CountUp";
import { GarmentArt } from "../components/GarmentArt";
import { Page } from "../components/Page";
import { money } from "../lib/format";
import { computeTotals, itemCount } from "../lib/pricing";
import { useShop } from "../lib/store";

export function Cart() {
  const cart = useShop((s) => s.cart);
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.remove);
  const totals = computeTotals(cart, null);

  if (!cart.length) {
    return (
      <Page className="center">
        <h1>Your cart is empty.</h1>
        <p className="lede">Much like your doorstep will be. Let's fix the first part.</p>
        <Link to="/" className="btn btn-primary">Go shopping</Link>
      </Page>
    );
  }

  return (
    <Page className="cart">
      <h1 className="page-title">Your cart <span className="serif">({itemCount(cart)})</span></h1>
      <div className="cart-layout">
        <ul className="lines">
          <AnimatePresence initial={false}>
            {cart.map((l) => (
              <motion.li key={l.key} className="line" layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0, padding: 0 }}>
                <Link to={`/item/${l.item.id}`} className="line-art" style={{ background: l.item.colors[1] }}>
                  <GarmentArt silhouette={l.item.silhouette} pattern={l.item.pattern} colors={l.item.colors} label={l.item.name} />
                </Link>
                <div className="line-info">
                  <Link to={`/item/${l.item.id}`}><h3>{l.item.name}</h3></Link>
                  <span className="muted">Size {l.size} · {money(l.item.price)} each</span>
                  <div className="stepper">
                    <button onClick={() => setQty(l.key, l.qty - 1)} aria-label="Decrease quantity">−</button>
                    <span>{l.qty}</span>
                    <button onClick={() => setQty(l.key, l.qty + 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <div className="line-end">
                  <strong>{money(l.item.price * l.qty)}</strong>
                  <button className="link" onClick={() => remove(l.key)}>Remove</button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <aside className="summary">
          <h2>Summary</h2>
          <div className="row"><span>Subtotal</span><CountUp value={totals.subtotal} /></div>
          <div className="row"><span>Never-Delivery shipping</span><span>{money(totals.shipping)}</span></div>
          <div className="row"><span>Tax</span><span>{money(totals.tax)}</span></div>
          <div className="row total"><span>Total</span><CountUp value={totals.total} /></div>
          <p className="teaser">Psst. Something wonderful happens at checkout.</p>
          <Link to="/checkout" className="btn btn-primary btn-block">Checkout</Link>
        </aside>
      </div>
    </Page>
  );
}

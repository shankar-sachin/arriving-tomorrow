import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CountUp } from "../components/CountUp";
import { Page } from "../components/Page";
import { money } from "../lib/format";
import { useShop } from "../lib/store";
import { trackingState } from "../lib/tracking";
import { useNow } from "./OrderTrack";

export function Orders() {
  const orders = useShop((s) => s.orders);
  const now = useNow(5000);
  const saved = orders.reduce((n, o) => n + o.totals.discount, 0);

  if (!orders.length) {
    return (
      <Page className="center">
        <h1>No orders yet.</h1>
        <p className="lede">Zero orders, zero deliveries. At least the stats line up.</p>
        <Link to="/" className="btn btn-primary">Start shopping</Link>
      </Page>
    );
  }

  return (
    <Page className="orders">
      <h1 className="page-title">Your orders <span className="serif">(all in transit)</span></h1>
      <div className="saved-banner">
        <span>Lifetime savings</span>
        <strong><CountUp value={saved} duration={2} /></strong>
        <span>across {orders.length} {orders.length === 1 ? "order" : "orders"}, none delivered</span>
      </div>
      <ul className="order-list">
        {orders.map((o, i) => {
          const t = trackingState(o.placedAt, now);
          return (
            <motion.li key={o.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/orders/${o.id}`} className="order-card">
                <div>
                  <strong>{o.id}</strong>
                  <small>{new Date(o.placedAt).toLocaleString()} · {o.lines.reduce((n, l) => n + l.qty, 0)} items · saved {money(o.totals.discount)}</small>
                </div>
                <div className="order-progress"><span style={{ width: `${t.progress * 100}%` }} /></div>
                <em>Arriving tomorrow</em>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </Page>
  );
}

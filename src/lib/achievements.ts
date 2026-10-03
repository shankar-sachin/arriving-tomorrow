import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "./pricing";
import { itemCount } from "./pricing";
import type { Order } from "./store";

export const ACHIEVEMENTS = [
  { id: "first-order", title: "Welcome to the waitlist", blurb: "Place your first order." },
  { id: "loyal", title: "Loyal customer", blurb: "Place 10 orders. Receive 0." },
  { id: "big-spender", title: "Spent $10,000 on nothing", blurb: "Order $10,000 of retail value, lifetime." },
  { id: "whale", title: "Six figures of nothing", blurb: "Order $100,000 of retail value, lifetime." },
  { id: "bulk", title: "Bulk nothing", blurb: "Order 99 of the same thing at once." },
  { id: "full-cart", title: "Cart full of dreams", blurb: "Have 25 items in your cart at once." },
  { id: "time-traveller", title: "Time traveller", blurb: "One order with something from India, America and Classical Europe." },
  { id: "yeehaw", title: "Yeehaw, m'lady", blurb: "Order a crinoline ball gown and a cowboy hat together." },
  { id: "still-tomorrow", title: "Still tomorrow", blurb: "Check on an order that's over a day old. It's arriving tomorrow." },
  { id: "watched-pot", title: "A watched pot", blurb: "Stare at a tracking page for two whole minutes." },
  { id: "regifter", title: "Generous to a fault", blurb: "Send a friend a package that will never arrive." },
  { id: "gifted", title: "It's the thought that counts", blurb: "Open a gift someone sent you." },
  { id: "manager", title: "Let me speak to your manager", blurb: "Ask support for a manager." },
  { id: "persistent", title: "Persistent", blurb: "Send customer support 15 messages." },
  { id: "lights-out", title: "Lights out", blurb: "Switch on dark mode." },
  { id: "home-screen", title: "Home screen hero", blurb: "Open arriving tomorrow as an app from your home screen." },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

const retail = (o: Order) => o.totals.subtotal + o.totals.shipping + o.totals.tax;

/** Achievements that follow from orders and the cart alone. Pure, so it's easy to test. */
export function earnedFromShop(orders: Order[], cart: CartLine[]): AchievementId[] {
  const out: AchievementId[] = [];
  const lifetime = orders.reduce((n, o) => n + retail(o), 0);
  if (orders.length >= 1) out.push("first-order");
  if (orders.length >= 10) out.push("loyal");
  if (lifetime >= 10_000) out.push("big-spender");
  if (lifetime >= 100_000) out.push("whale");
  if (orders.some((o) => o.lines.some((l) => l.qty >= 99))) out.push("bulk");
  if (itemCount(cart) >= 25) out.push("full-cart");
  if (orders.some((o) => new Set(o.lines.map((l) => l.item.region)).size >= 3)) out.push("time-traveller");
  if (
    orders.some((o) => {
      const kinds = new Set(o.lines.map((l) => l.item.archetype));
      return kinds.has("Crinoline Ball Gown") && kinds.has("Cowboy Hat");
    })
  )
    out.push("yeehaw");
  return out;
}

interface AchievementState {
  /** id → when it was unlocked. */
  unlocked: Partial<Record<AchievementId, number>>;
  supportMessages: number;
  /** Freshly unlocked, waiting to be toasted. Not persisted. */
  queue: AchievementId[];
  unlock: (id: AchievementId) => void;
  dismiss: () => void;
  countSupportMessage: () => void;
}

export const useAchievements = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      supportMessages: 0,
      queue: [],
      unlock: (id) => {
        if (get().unlocked[id]) return;
        set((s) => ({ unlocked: { ...s.unlocked, [id]: Date.now() }, queue: [...s.queue, id] }));
      },
      dismiss: () => set((s) => ({ queue: s.queue.slice(1) })),
      countSupportMessage: () => {
        const n = get().supportMessages + 1;
        set({ supportMessages: n });
        if (n >= 15) get().unlock("persistent");
      },
    }),
    { name: "clothes-never-come-achievements", partialize: (s) => ({ unlocked: s.unlocked, supportMessages: s.supportMessages }) },
  ),
);

export const unlock = (id: AchievementId) => useAchievements.getState().unlock(id);

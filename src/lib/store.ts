import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CardItem } from "../catalog/types";
import { computeTotals, COUPON_CODE, type CartLine, type Totals } from "./pricing";

export interface Order {
  id: string;
  placedAt: number;
  lines: CartLine[];
  totals: Totals;
}

interface ShopState {
  cart: CartLine[];
  orders: Order[];
  /** Bumped on every add so the cart badge can bounce. */
  pulse: number;
  add: (item: CardItem, size: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  placeOrder: () => Order | null;
}

const orderId = () => `CNC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],
      pulse: 0,
      add: (item, size) =>
        set((s) => {
          const key = `${item.id}:${size}`;
          const existing = s.cart.find((l) => l.key === key);
          const cart = existing
            ? s.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + 1) } : l))
            : [...s.cart, { key, item, size, qty: 1 }];
          return { cart, pulse: s.pulse + 1 };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(99, qty) } : l)),
        })),
      remove: (key) => set((s) => ({ cart: s.cart.filter((l) => l.key !== key) })),
      placeOrder: () => {
        const { cart, orders } = get();
        if (!cart.length) return null;
        const order: Order = { id: orderId(), placedAt: Date.now(), lines: cart, totals: computeTotals(cart, COUPON_CODE) };
        set({ cart: [], orders: [order, ...orders] });
        return order;
      },
    }),
    { name: "clothes-never-come", partialize: (s) => ({ cart: s.cart, orders: s.orders }) },
  ),
);

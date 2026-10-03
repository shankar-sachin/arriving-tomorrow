import type { CardItem } from "../catalog/types";

export interface CartLine {
  key: string;
  item: CardItem;
  size: string;
  qty: number;
}

export interface Totals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export const COUPON_CODE = "FREE-CLOTHES";
export const SHIPPING_FEE = 14.99;
export const TAX_RATE = 0.0825;

const cents = (n: number) => Math.round(n * 100) / 100;

export function computeTotals(lines: CartLine[], coupon: string | null): Totals {
  const subtotal = cents(lines.reduce((sum, l) => sum + l.item.price * l.qty, 0));
  const shipping = lines.length ? SHIPPING_FEE : 0;
  const tax = cents(subtotal * TAX_RATE);
  const gross = cents(subtotal + shipping + tax);
  // FREE-CLOTHES is 100% off everything, including the shipping that never happens.
  const discount = coupon?.trim().toUpperCase() === COUPON_CODE ? gross : 0;
  return { subtotal, shipping, tax, discount, total: cents(gross - discount) };
}

export function itemCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

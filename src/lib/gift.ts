import type { CardItem } from "../catalog/types";
import type { Order } from "./store";

/** Everything the recipient's page needs, packed into the link itself. No server involved. */
export interface Gift {
  from: string;
  to: string;
  message: string;
  placedAt: number;
  items: Array<{ item: Pick<CardItem, "id" | "name" | "silhouette" | "pattern" | "colors" | "photo">; qty: number; size: string }>;
  /** What the sender "spent", before FREE-CLOTHES. */
  value: number;
}

/** Links get long; a gift shows its first few items and counts the rest. */
export const MAX_GIFT_ITEMS = 6;
export const MAX_NAME = 40;
export const MAX_MESSAGE = 280;

export function giftFromOrder(order: Order, from: string, to: string, message: string): Gift {
  const t = order.totals;
  return {
    from: from.trim().slice(0, MAX_NAME),
    to: to.trim().slice(0, MAX_NAME),
    message: message.trim().slice(0, MAX_MESSAGE),
    placedAt: order.placedAt,
    items: order.lines.slice(0, MAX_GIFT_ITEMS).map(({ item, qty, size }) => ({
      item: { id: item.id, name: item.name, silhouette: item.silhouette, pattern: item.pattern, colors: item.colors, photo: item.photo },
      qty,
      size,
    })),
    value: t.subtotal + t.shipping + t.tax,
  };
}

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromBase64Url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

export function encodeGift(gift: Gift): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(gift)));
}

/** Returns null for anything that isn't a well-formed gift, since links get mangled in chat apps. */
export function decodeGift(code: string | null): Gift | null {
  if (!code) return null;
  try {
    const g = JSON.parse(new TextDecoder().decode(fromBase64Url(code))) as Gift;
    const ok =
      typeof g.from === "string" &&
      typeof g.to === "string" &&
      typeof g.message === "string" &&
      Number.isFinite(g.placedAt) &&
      Number.isFinite(g.value) &&
      Array.isArray(g.items) &&
      g.items.every((l) => l && typeof l.item?.name === "string" && Array.isArray(l.item.colors) && Number.isFinite(l.qty));
    if (!ok) return null;
    return {
      ...g,
      from: g.from.slice(0, MAX_NAME),
      to: g.to.slice(0, MAX_NAME),
      message: g.message.slice(0, MAX_MESSAGE),
      items: g.items.slice(0, MAX_GIFT_ITEMS),
    };
  } catch {
    return null;
  }
}

export function giftUrl(gift: Gift, origin = window.location.origin): string {
  return `${origin}${import.meta.env.BASE_URL}gift?d=${encodeGift(gift)}`;
}

import { useEffect, useRef, useState } from "react";
import type { CardItem } from "../catalog/types";
import { ProductCard } from "./ProductCard";

const PAGE = 48;

/** Renders cards in pages of 48, loading more as the sentinel scrolls into view. */
export function ProductGrid({ items }: { items: CardItem[] }) {
  const [shown, setShown] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => setShown(PAGE), [items]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setShown((n) => n + PAGE);
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [items]);

  if (!items.length) return <p className="empty">Nothing matches. Which, honestly, is on brand.</p>;

  return (
    <>
      <div className="grid">
        {items.slice(0, shown).map((item, i) => (
          <ProductCard key={item.id} item={item} index={i} />
        ))}
      </div>
      {shown < items.length && <div ref={sentinel} className="sentinel">Loading more things that won't arrive…</div>}
    </>
  );
}

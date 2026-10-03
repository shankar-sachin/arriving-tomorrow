import { useMemo, useState } from "react";
import { Link, NavLink, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PALETTES, REGIONS } from "../catalog/taxonomy";
import type { CardItem, ColorFamily } from "../catalog/types";
import { Loading, Page } from "../components/Page";
import { ProductGrid } from "../components/ProductGrid";
import { loadShard, useAsync } from "../lib/catalogApi";
import { money } from "../lib/format";

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "waited" | "discount";

const SORTS: Array<[SortKey, string]> = [
  ["featured", "Featured"],
  ["price-asc", "Price: low → high"],
  ["price-desc", "Price: high → low"],
  ["rating", "Top rated"],
  ["waited", "Most waited for"],
  ["discount", "Biggest fake discount"],
];

// One representative swatch per colour family.
const FAMILIES = [...new Map(PALETTES.map((p) => [p.family, p.colors[0]])).entries()] as Array<[ColorFamily, string]>;

export function sortItems(items: CardItem[], sort: SortKey): CardItem[] {
  const out = [...items];
  switch (sort) {
    case "price-asc": return out.sort((a, b) => a.price - b.price);
    case "price-desc": return out.sort((a, b) => b.price - a.price);
    case "rating": return out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "waited": return out.sort((a, b) => b.reviews - a.reviews);
    case "discount": return out.sort((a, b) => a.price / a.compareAt - b.price / b.compareAt);
    default: return out;
  }
}

export function Shop() {
  const { region: regionId, category } = useParams();
  const region = REGIONS.find((r) => r.id === regionId);
  const [sort, setSort] = useState<SortKey>("featured");
  const [family, setFamily] = useState<ColorFamily | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const cats = region ? (category ? region.categories.filter((c) => c.id === category) : region.categories) : [];
  const key = `${regionId}/${category ?? "*"}`;
  const data = useAsync(() => Promise.all(cats.map((c) => loadShard(region!.id, c.id))).then((s) => s.flat()), key);

  const priceCeiling = useMemo(() => (data.status === "ready" ? Math.ceil(Math.max(...data.data.map((i) => i.price)) / 50) * 50 : 0), [data]);

  const items = useMemo(() => {
    if (data.status !== "ready") return [];
    const filtered = data.data.filter((i) => (!family || i.colorFamily === family) && (maxPrice === null || i.price <= maxPrice));
    return sortItems(filtered, sort);
  }, [data, family, maxPrice, sort]);

  if (!region || (category && !cats.length)) return <Navigate to="/" replace />;
  const current = cats.length === 1 && category ? cats[0].name : `All of ${region.name}`;

  return (
    <Page className="shop">
      <section className="shop-hero" style={{ "--accent": region.accent } as React.CSSProperties}>
        <nav className="crumbs"><Link to="/">Home</Link> / <Link to={`/shop/${region.id}`}>{region.name}</Link>{category && <> / <span>{current}</span></>}</nav>
        <motion.h1 key={key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          {current}
        </motion.h1>
        <p>{region.tagline}</p>
        <div className="chips">
          <NavLink end to={`/shop/${region.id}`} className="chip">All</NavLink>
          {region.categories.map((c) => (
            <NavLink key={c.id} to={`/shop/${region.id}/${c.id}`} className="chip">{c.name}</NavLink>
          ))}
        </div>
      </section>

      <div className="toolbar">
        <label className="select">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </label>
        <div className="swatches" role="group" aria-label="Filter by colour">
          {FAMILIES.map(([f, hex]) => (
            <button
              key={f}
              className={`swatch ${family === f ? "on" : ""}`}
              style={{ background: hex }}
              aria-label={f}
              aria-pressed={family === f}
              title={f}
              onClick={() => setFamily(family === f ? null : f)}
            />
          ))}
        </div>
        {priceCeiling > 0 && (
          <label className="range">
            <span>Under {money(maxPrice ?? priceCeiling)}</span>
            <input type="range" min={50} max={priceCeiling} step={10} value={maxPrice ?? priceCeiling} onChange={(e) => setMaxPrice(Number(e.target.value))} />
          </label>
        )}
        <span className="result-count">{data.status === "ready" ? `${items.length.toLocaleString()} items` : ""}</span>
      </div>

      {data.status === "loading" && <Loading />}
      {data.status === "error" && <p className="empty">The catalog got lost in transit. Fitting.</p>}
      {data.status === "ready" && <ProductGrid items={items} />}
    </Page>
  );
}

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, Navigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { REGIONS } from "../catalog/taxonomy";
import type { CardItem } from "../catalog/types";
import { ActiveFilters, FilterPanel } from "../components/FilterPanel";
import { Loading, Page } from "../components/Page";
import { ProductGrid } from "../components/ProductGrid";
import { loadSearch, loadShard, useAsync } from "../lib/catalogApi";
import { activeCount, applyFilters, AUDIENCES, parseFilters, SORTS, writeFilters, type Filters, type SortKey } from "../lib/filters";

export { sortItems } from "../lib/filters";

const ALL = "all";

export function Shop() {
  const { region: regionId, category } = useParams();
  const [params, setParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const filters = useMemo(() => parseFilters(params), [params]);
  const setFilters = (next: Filters) => setParams(writeFilters(next, params), { replace: true });

  const isAll = regionId === ALL;
  const region = REGIONS.find((r) => r.id === regionId);
  const cats = region ? (category ? region.categories.filter((c) => c.id === category) : region.categories) : [];
  const key = `${regionId}/${category ?? "*"}`;
  const data = useAsync<CardItem[]>(
    () => (isAll ? loadSearch() : Promise.all(cats.map((c) => loadShard(region!.id, c.id))).then((s) => s.flat())),
    key,
  );

  const items = useMemo(() => (data.status === "ready" ? applyFilters(data.data, filters) : []), [data, filters]);

  // Lock page scroll behind the mobile filter sheet.
  useEffect(() => {
    document.body.classList.toggle("sheet-open", sheetOpen);
    return () => document.body.classList.remove("sheet-open");
  }, [sheetOpen]);

  if (!isAll && (!region || (category && !cats.length))) return <Navigate to="/" replace />;

  const audLabel = AUDIENCES.find(([a]) => a === filters.aud)?.[1];
  const title = isAll ? audLabel ?? "Everything" : cats.length === 1 && category ? cats[0].name : `All of ${region!.name}`;
  const tagline = isAll ? "Every region, every garment, zero deliveries." : region!.tagline;
  const accent = region?.accent ?? "#ff3d7f";
  const nActive = activeCount(filters);
  const panel = data.status === "ready" && (
    <FilterPanel items={data.data} filters={filters} onChange={setFilters} showRegions={isAll} />
  );

  return (
    <Page className="shop">
      <section className="shop-hero" style={{ "--accent": accent } as React.CSSProperties}>
        <nav className="crumbs">
          <Link to="/">Home</Link> / {isAll ? <span>Shop all</span> : <Link to={`/shop/${region!.id}`}>{region!.name}</Link>}
          {category && <> / <span>{title}</span></>}
        </nav>
        <motion.h1 key={title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          {title}
        </motion.h1>
        <p>{tagline}</p>
        <div className="chips">
          {isAll
            ? REGIONS.map((r) => (
                <Link key={r.id} to={`/shop/${r.id}${filters.aud ? `?aud=${filters.aud}` : ""}`} className="chip">{r.name}</Link>
              ))
            : (
              <>
                <NavLink end to={`/shop/${region!.id}`} className="chip">All</NavLink>
                {region!.categories.map((c) => (
                  <NavLink key={c.id} to={`/shop/${region!.id}/${c.id}`} className="chip">{c.name}</NavLink>
                ))}
              </>
            )}
        </div>
      </section>

      <div className="shop-body">
        <aside className="filter-sidebar" aria-label="Filters">{panel}</aside>

        <div className="shop-main">
          <div className="toolbar">
            <button type="button" className="filter-btn" onClick={() => setSheetOpen(true)}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
              Filters{nActive ? <b>{nActive}</b> : null}
            </button>
            <label className="select">
              <span>Sort</span>
              <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortKey })}>
                {SORTS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
            <span className="result-count">{data.status === "ready" ? `${items.length.toLocaleString()} items` : ""}</span>
          </div>
          <ActiveFilters filters={filters} onChange={setFilters} />

          {data.status === "loading" && <Loading />}
          {data.status === "error" && <p className="empty">The catalog got lost in transit. Fitting.</p>}
          {data.status === "ready" && <ProductGrid items={items} />}
        </div>
      </div>

      {createPortal(
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheetOpen(false)} />
            <motion.div
              className="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div className="sheet-head">
                <span className="sheet-grip" aria-hidden="true" />
                <h2>Filters</h2>
                <button type="button" className="sheet-close" onClick={() => setSheetOpen(false)} aria-label="Close filters">×</button>
              </div>
              <div className="sheet-body">{panel}</div>
              <div className="sheet-foot">
                <button type="button" className="link" onClick={() => setFilters({ ...parseFilters(new URLSearchParams()), sort: filters.sort })}>Clear all</button>
                <button type="button" className="btn btn-primary" onClick={() => setSheetOpen(false)}>
                  Show {items.length.toLocaleString()} items
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </Page>
  );
}

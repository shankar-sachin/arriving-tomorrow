import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Loading, Page } from "../components/Page";
import { ProductGrid } from "../components/ProductGrid";
import type { CardItem } from "../catalog/types";
import { loadSearch, useAsync } from "../lib/catalogApi";

export function searchItems(items: CardItem[], query: string): CardItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return items.filter((i) => {
    const hay = `${i.name} ${i.archetype} ${i.colorName} ${i.colorFamily} ${i.region} ${i.category}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const data = useAsync(loadSearch, "search");
  const results = useMemo(() => (data.status === "ready" ? searchItems(data.data, q) : []), [data, q]);

  return (
    <Page className="search-page">
      <h1 className="page-title">“{q}” <span className="serif">{data.status === "ready" ? `${results.length.toLocaleString()} results` : ""}</span></h1>
      {data.status === "ready" ? <ProductGrid items={results} /> : <Loading label="Searching the warehouse" />}
    </Page>
  );
}

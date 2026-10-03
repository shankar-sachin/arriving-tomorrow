import { useEffect, useState } from "react";
import type { CardItem, CatalogIndex, CatalogItem } from "../catalog/types";

const cache = new Map<string, Promise<unknown>>();

function load<T>(path: string): Promise<T> {
  if (!cache.has(path)) {
    const p = fetch(`${import.meta.env.BASE_URL}catalog/${path}`).then((r) => {
      if (!r.ok) throw new Error(`Failed to load ${path}`);
      return r.json();
    });
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return cache.get(path) as Promise<T>;
}

export const loadIndex = () => load<CatalogIndex>("index.json");
export const loadShard = (region: string, category: string) => load<CatalogItem[]>(`${region}/${category}.json`);
export const loadSearch = () => load<CardItem[]>("search.json");

export type Async<T> = { status: "loading" } | { status: "error"; error: Error } | { status: "ready"; data: T };

/** Tiny data hook. `key` re-triggers the load; `fn` should be stable for a given key. */
export function useAsync<T>(fn: () => Promise<T>, key: string): Async<T> {
  const [state, setState] = useState<{ key: string; value: Async<T> }>({ key, value: { status: "loading" } });
  useEffect(() => {
    let alive = true;
    fn().then(
      (data) => alive && setState({ key, value: { status: "ready", data } }),
      (error: Error) => alive && setState({ key, value: { status: "error", error } }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state.key === key ? state.value : { status: "loading" };
}

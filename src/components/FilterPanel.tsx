import { useState } from "react";
import { PALETTES, REGIONS } from "../catalog/taxonomy";
import type { CardItem, ColorFamily } from "../catalog/types";
import { AUDIENCES, DEAL_THRESHOLD, facetCounts, PATTERN_LABELS, toggle, type Filters } from "../lib/filters";
import { money } from "../lib/format";

// One representative swatch per colour family.
const SWATCH = Object.fromEntries(PALETTES.map((p) => [p.family, p.colors[0]])) as Record<ColorFamily, string>;
const PRICE_PRESETS: Array<[string, number | null, number | null]> = [
  ["Under $100", null, 100],
  ["$100–500", 100, 500],
  ["$500–1,000", 500, 1000],
  ["$1,000+", 1000, null],
];

interface Props {
  items: CardItem[];
  filters: Filters;
  onChange: (next: Filters) => void;
  /** Show the region facet (only on the all-regions shop). */
  showRegions: boolean;
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="facet" open={defaultOpen}>
      <summary>{title}</summary>
      <div className="facet-body">{children}</div>
    </details>
  );
}

function CheckList({ options, selected, onToggle, label = (v) => v, limit = 8 }: {
  options: Array<[string, number]>;
  selected: string[];
  onToggle: (v: string) => void;
  label?: (v: string) => string;
  limit?: number;
}) {
  const [all, setAll] = useState(false);
  // Keep selected options visible even when they'd be cut off.
  const shown = all ? options : options.filter(([v], i) => i < limit || selected.includes(v));
  return (
    <>
      <ul className="checklist">
        {shown.map(([v, n]) => (
          <li key={v}>
            <label className={n === 0 && !selected.includes(v) ? "dim" : ""}>
              <input type="checkbox" checked={selected.includes(v)} onChange={() => onToggle(v)} />
              <span>{label(v)}</span>
              <small>{n.toLocaleString()}</small>
            </label>
          </li>
        ))}
      </ul>
      {options.length > limit && (
        <button type="button" className="link more" onClick={() => setAll(!all)}>
          {all ? "Show fewer" : `Show all ${options.length}`}
        </button>
      )}
    </>
  );
}

export function FilterPanel({ items, filters: f, onChange, showRegions }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });
  const audCounts = new Map(facetCounts(items, f, "aud", (i) => i.audience));
  // Women/Men include unisex pieces, so their counts do too.
  const audCount = (a: string) => (audCounts.get(a as never) ?? 0) + (a === "unisex" ? 0 : audCounts.get("unisex" as never) ?? 0);
  const regionName = (id: string) => REGIONS.find((r) => r.id === id)?.name ?? id;
  const colorCounts = new Map(facetCounts(items, f, "colors", (i) => i.colorFamily));

  return (
    <div className="filters">
      <Section title="Shop for">
        <div className="seg" role="radiogroup" aria-label="Shop for">
          <button type="button" role="radio" aria-checked={!f.aud} className={!f.aud ? "on" : ""} onClick={() => set({ aud: null })}>All</button>
          {AUDIENCES.map(([a, label]) => (
            <button key={a} type="button" role="radio" aria-checked={f.aud === a} className={f.aud === a ? "on" : ""} onClick={() => set({ aud: f.aud === a ? null : a })}>
              {label} <small>{audCount(a).toLocaleString()}</small>
            </button>
          ))}
        </div>
      </Section>

      {showRegions && (
        <Section title="Region">
          <CheckList options={facetCounts(items, f, "regions", (i) => i.region)} selected={f.regions} label={regionName} onToggle={(v) => set({ regions: toggle(f.regions, v as never) })} />
        </Section>
      )}

      <Section title="Garment">
        <CheckList options={facetCounts(items, f, "types", (i) => i.archetype)} selected={f.types} onToggle={(v) => set({ types: toggle(f.types, v) })} />
      </Section>

      <Section title="Colour">
        <div className="swatch-grid" role="group" aria-label="Colour">
          {(Object.keys(SWATCH) as ColorFamily[]).map((c) => {
            const on = f.colors.includes(c);
            const n = colorCounts.get(c) ?? 0;
            return (
              <button key={c} type="button" className={`swatch-opt ${on ? "on" : ""}`} aria-pressed={on} disabled={!n && !on} onClick={() => set({ colors: toggle(f.colors, c) })}>
                <i style={{ background: SWATCH[c] }} />
                <span>{c}</span>
                <small>{n}</small>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Price">
        <div className="presets">
          {PRICE_PRESETS.map(([label, min, max]) => {
            const on = f.min === min && f.max === max;
            return (
              <button key={label} type="button" className={`chip-sm ${on ? "on" : ""}`} aria-pressed={on} onClick={() => set(on ? { min: null, max: null } : { min, max })}>
                {label}
              </button>
            );
          })}
        </div>
        <div className="price-inputs">
          <label>
            <span>Min</span>
            <input type="number" inputMode="numeric" min={0} placeholder="$0" value={f.min ?? ""} onChange={(e) => set({ min: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })} />
          </label>
          <span aria-hidden="true">–</span>
          <label>
            <span>Max</span>
            <input type="number" inputMode="numeric" min={0} placeholder="Any" value={f.max ?? ""} onChange={(e) => set({ max: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })} />
          </label>
        </div>
      </Section>

      <Section title="Fabric" defaultOpen={false}>
        <CheckList options={facetCounts(items, f, "fabrics", (i) => i.fabric)} selected={f.fabrics} onToggle={(v) => set({ fabrics: toggle(f.fabrics, v) })} />
      </Section>

      <Section title="Pattern" defaultOpen={false}>
        <CheckList
          options={facetCounts(items, f, "patterns", (i) => i.pattern)}
          selected={f.patterns}
          label={(v) => PATTERN_LABELS[v as keyof typeof PATTERN_LABELS]}
          onToggle={(v) => set({ patterns: toggle(f.patterns, v as never) })}
        />
      </Section>

      <Section title="Rating & deals">
        <div className="presets">
          {[4, 4.5].map((r) => (
            <button key={r} type="button" className={`chip-sm ${f.rating === r ? "on" : ""}`} aria-pressed={f.rating === r} onClick={() => set({ rating: f.rating === r ? null : r })}>
              ★ {r}+
            </button>
          ))}
          <button type="button" className={`chip-sm ${f.deals ? "on" : ""}`} aria-pressed={f.deals} onClick={() => set({ deals: !f.deals })}>
            {Math.round(DEAL_THRESHOLD * 100)}%+ off
          </button>
        </div>
      </Section>
    </div>
  );
}

/** Removable pills for every active filter. */
export function ActiveFilters({ filters: f, onChange }: { filters: Filters; onChange: (next: Filters) => void }) {
  const pills: Array<[string, () => Filters]> = [];
  if (f.aud) pills.push([AUDIENCES.find(([a]) => a === f.aud)![1], () => ({ ...f, aud: null })]);
  for (const r of f.regions) pills.push([REGIONS.find((x) => x.id === r)?.name ?? r, () => ({ ...f, regions: toggle(f.regions, r) })]);
  for (const t of f.types) pills.push([t, () => ({ ...f, types: toggle(f.types, t) })]);
  for (const c of f.colors) pills.push([c, () => ({ ...f, colors: toggle(f.colors, c) })]);
  for (const x of f.fabrics) pills.push([x, () => ({ ...f, fabrics: toggle(f.fabrics, x) })]);
  for (const p of f.patterns) pills.push([PATTERN_LABELS[p], () => ({ ...f, patterns: toggle(f.patterns, p) })]);
  if (f.min !== null || f.max !== null)
    pills.push([f.min !== null && f.max !== null ? `${money(f.min)}–${money(f.max)}` : f.min !== null ? `${money(f.min)}+` : `Under ${money(f.max!)}`, () => ({ ...f, min: null, max: null })]);
  if (f.rating !== null) pills.push([`★ ${f.rating}+`, () => ({ ...f, rating: null })]);
  if (f.deals) pills.push([`${Math.round(DEAL_THRESHOLD * 100)}%+ off`, () => ({ ...f, deals: false })]);
  if (!pills.length) return null;
  return (
    <div className="active-filters">
      {pills.map(([label, next]) => (
        <button key={label} type="button" className="pill" onClick={() => onChange(next())} aria-label={`Remove filter ${label}`}>
          {label} <span aria-hidden="true">×</span>
        </button>
      ))}
      <button type="button" className="link" onClick={() => onChange({ ...f, aud: null, regions: [], types: [], colors: [], fabrics: [], patterns: [], min: null, max: null, rating: null, deals: false })}>
        Clear all
      </button>
    </div>
  );
}

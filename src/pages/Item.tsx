import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { parseItemId, toCard } from "../catalog/generate";
import { REGIONS } from "../catalog/taxonomy";
import { ProductImage } from "../components/ProductImage";
import { Loading, Page } from "../components/Page";
import { PriceTag, ProductCard, Stars } from "../components/ProductCard";
import { loadShard, useAsync } from "../lib/catalogApi";
import { money } from "../lib/format";
import { useShop } from "../lib/store";
import { isTryable } from "../ar/anchors";
import { TRY_ON_COPY } from "../ar/copy";

export function Item() {
  const { id = "" } = useParams();
  const parsed = parseItemId(id);
  const data = useAsync(() => (parsed ? loadShard(parsed.region, parsed.category) : Promise.reject(new Error("bad id"))), id);
  const add = useShop((s) => s.add);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(0);

  if (data.status === "loading") return <Page><Loading label="Fetching the goods" /></Page>;
  const item = data.status === "ready" ? data.data.find((i) => i.id === id) : undefined;
  if (!item) {
    return (
      <Page className="center">
        <h1>This item never came either.</h1>
        <Link to="/" className="btn btn-primary">Back to the shop</Link>
      </Page>
    );
  }

  const region = REGIONS.find((r) => r.id === item.region)!;
  const category = region.categories.find((c) => c.id === item.category)!;
  const chosen = size ?? (item.sizes.length === 1 ? item.sizes[0] : null);
  const related = (data.status === "ready" ? data.data : []).filter((i) => i.archetype === item.archetype && i.id !== item.id).slice(0, 4);

  const onAdd = () => {
    if (!chosen) return;
    add(toCard(item), chosen);
    setAdded((n) => n + 1);
  };

  return (
    <Page className="item">
      <nav className="crumbs">
        <Link to="/">Home</Link> / <Link to={`/shop/${region.id}`}>{region.name}</Link> / <Link to={`/shop/${region.id}/${category.id}`}>{category.name}</Link>
      </nav>
      <div className="item-layout">
        <motion.div className={`item-stage ${item.photo ? "with-photo" : ""}`} style={{ "--c1": item.photo?.bg ?? item.colors[1], "--c2": item.colors[2] } as React.CSSProperties} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          {!item.photo && <div className="stage-blob" />}
          {item.badge && <span className="badge badge-lg">{item.badge}</span>}
          <ProductImage item={item} hero className="item-art" />
        </motion.div>

        <div className="item-info">
          <span className="eyebrow" style={{ color: region.accent }}>{region.name} · {item.archetype}</span>
          <h1>{item.name}</h1>
          <Stars rating={item.rating} reviews={item.reviews} />
          <span className="review-note">from people still waiting</span>
          <div className="item-price"><PriceTag price={item.price} compareAt={item.compareAt} /></div>
          <p className="blurb">{item.blurb}</p>

          <dl className="specs">
            <div><dt>Fabric</dt><dd>{item.fabric}</dd></div>
            <div><dt>Motif</dt><dd>{item.motif}</dd></div>
            <div><dt>Colour</dt><dd><i className="dot" style={{ background: item.colors[0] }} />{item.colorName}</dd></div>
            <div><dt>For</dt><dd>{item.audience === "unisex" ? "Everyone" : item.audience === "women" ? "Women" : "Men"}</dd></div>
            <div><dt>SKU</dt><dd>{item.id.toUpperCase()}</dd></div>
          </dl>

          <div className="sizes" role="radiogroup" aria-label="Size">
            {item.sizes.map((s) => (
              <button key={s} role="radio" aria-checked={chosen === s} className={`size ${chosen === s ? "on" : ""}`} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className="buy-bar">
            <span className="buy-bar-price">{money(item.price)}</span>
            <motion.button className="btn btn-primary btn-xl" whileTap={{ scale: 0.94 }} disabled={!chosen} onClick={onAdd}>
              {chosen ? "Add to cart (it won't come)" : "Pick a size first"}
            </motion.button>
          </div>
          <AnimatePresence>
            {added > 0 && (
              <motion.div key={added} className="toast" initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
                Added. It's already not on its way. <Link to="/cart">View cart →</Link>
              </motion.div>
            )}
          </AnimatePresence>

          {isTryable(item.silhouette) && (
            <div className="try-on">
              <Link className="btn btn-ghost try-on-btn" to={`/item/${item.id}/try`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
                {TRY_ON_COPY.button}
              </Link>
              <p className="fine try-on-hint">{TRY_ON_COPY.buttonHint}</p>
            </div>
          )}

          <ul className="promises">
            <li><b>Delivery:</b> tomorrow (permanently)</li>
            <li><b>Returns:</b> free, since there's nothing to return</li>
            <li><b>Price at checkout:</b> $0.00 with FREE-CLOTHES</li>
          </ul>

          {item.photoCredit?.source === "ai" && (
            <p className="photo-credit">
              AI-generated product image (<a href={item.photoCredit.licenseUrl} target="_blank" rel="noopener noreferrer">FLUX.1-schnell</a>).
              {" "}Fittingly, the garment doesn't exist either. <Link to="/credits">All credits</Link>
            </p>
          )}
          {item.photoCredit && item.photoCredit.source !== "ai" && (
            <p className="photo-credit">
              Photo: <a href={item.photoCredit.sourceUrl} target="_blank" rel="noopener noreferrer">{item.photoCredit.title}</a>
              {" "}by {item.photoCredit.creator} ·{" "}
              <a href={item.photoCredit.licenseUrl} target="_blank" rel="noopener noreferrer">{item.photoCredit.license}</a>
              {" "}via {({ met: "The Met", commons: "Wikimedia Commons", pexels: "Pexels", cma: "the Cleveland Museum of Art", ai: "FLUX.1-schnell" } as const)[item.photoCredit.source]}.
              {" "}Representative photo; the garment you'll never receive may differ. <Link to="/credits">All credits</Link>
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="related">
          <h2 className="section-title">More <span className="serif">{item.archetype}</span> that won't arrive</h2>
          <div className="grid">{related.map((r, i) => <ProductCard key={r.id} item={r} index={i} />)}</div>
        </section>
      )}
    </Page>
  );
}

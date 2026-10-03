import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { parseItemId, toCard } from "../catalog/generate";
import { REGIONS } from "../catalog/taxonomy";
import { GarmentArt } from "../components/GarmentArt";
import { Loading, Page } from "../components/Page";
import { PriceTag, ProductCard, Stars } from "../components/ProductCard";
import { loadShard, useAsync } from "../lib/catalogApi";
import { useShop } from "../lib/store";

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
        <motion.div className="item-stage" style={{ "--c1": item.colors[1], "--c2": item.colors[2] } as React.CSSProperties} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="stage-blob" />
          {item.badge && <span className="badge badge-lg">{item.badge}</span>}
          <GarmentArt silhouette={item.silhouette} pattern={item.pattern} colors={item.colors} label={item.name} float className="item-art" />
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
            <div><dt>SKU</dt><dd>{item.id.toUpperCase()}</dd></div>
          </dl>

          <div className="sizes" role="radiogroup" aria-label="Size">
            {item.sizes.map((s) => (
              <button key={s} role="radio" aria-checked={chosen === s} className={`size ${chosen === s ? "on" : ""}`} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
          </div>

          <motion.button className="btn btn-primary btn-xl" whileTap={{ scale: 0.94 }} disabled={!chosen} onClick={onAdd}>
            {chosen ? "Add to cart (it won't come)" : "Pick a size first"}
          </motion.button>
          <AnimatePresence>
            {added > 0 && (
              <motion.div key={added} className="toast" initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
                Added. It's already not on its way. <Link to="/cart">View cart →</Link>
              </motion.div>
            )}
          </AnimatePresence>

          <ul className="promises">
            <li><b>Delivery:</b> tomorrow (permanently)</li>
            <li><b>Returns:</b> free, since there's nothing to return</li>
            <li><b>Price at checkout:</b> $0.00 with FREE-CLOTHES</li>
          </ul>
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

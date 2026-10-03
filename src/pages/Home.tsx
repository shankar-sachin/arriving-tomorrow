import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductImage } from "../components/ProductImage";
import { Marquee } from "../components/Marquee";
import { Loading, Page } from "../components/Page";
import { ProductCard } from "../components/ProductCard";
import { loadIndex, useAsync } from "../lib/catalogApi";
import { compact } from "../lib/format";

const TICKER = [
  "0 packages delivered since 2026",
  "Free shipping to nowhere",
  "Coupon FREE-CLOTHES auto-applied",
  "No accounts. No cards. No clothes.",
  "Ships in 3–5 business eternities",
  "Rated 5 stars by people still waiting",
];

const STEPS = [
  { n: "01", title: "Shop like a maniac", body: "Saris, sherwanis, cowboy boots, crinolines. Fill the cart. Then fill it again." },
  { n: "02", title: "Check out for $0.00", body: "We type your details for you. FREE-CLOTHES wipes the total. Confetti happens." },
  { n: "03", title: "Wait. Forever.", body: "Live tracking with a truck that's always five minutes away. Arriving tomorrow, every day." },
];

export function Home() {
  const index = useAsync(loadIndex, "index");

  if (index.status !== "ready") return <Page><Loading /></Page>;
  const { regions, featured, total } = index.data;
  const hero = featured.slice(0, 5);

  return (
    <Page className="home">
      <section className="hero">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
        <div className="hero-copy">
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            The world's least reliable boutique
          </motion.span>
          <h1>
            {["Order", "everything."].map((w, i) => (
              <motion.span key={w} className="word" initial={{ opacity: 0, y: 40, rotate: 4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 200, damping: 18 }}>
                {w}{" "}
              </motion.span>
            ))}
            <br />
            <motion.span className="word serif" initial={{ opacity: 0, y: 40, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.35, type: "spring", stiffness: 200, damping: 18 }}>
              Receive nothing.
            </motion.span>
          </h1>
          <motion.p className="lede" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {total.toLocaleString()} gorgeous pieces from India, America, and classical Europe. Everything's free at checkout,
            and none of it ever shows up. No account, no card, no regrets.
          </motion.p>
          <motion.div className="cta-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Link to={`/shop/${regions[0].id}`} className="btn btn-primary">Start shopping</Link>
            <a href="#how" className="btn btn-ghost">How it (doesn't) work</a>
          </motion.div>
        </div>
        <div className="hero-art" aria-hidden="true">
          {hero.map((item, i) => (
            <motion.div
              key={item.id}
              className={`hero-piece hp-${i}`}
              style={{ background: `${item.colors[1]}` }}
              initial={{ opacity: 0, scale: 0.6, rotate: i % 2 ? 12 : -12 }}
              animate={{ opacity: 1, scale: 1, rotate: [-6, 4, -3, 6, 0][i] }}
              transition={{ delay: 0.2 + i * 0.12, type: "spring", stiffness: 160, damping: 14 }}
              whileHover={{ scale: 1.08, rotate: 0, zIndex: 10 }}
            >
              <ProductImage item={item} hero />
            </motion.div>
          ))}
          <motion.div className="sticker" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: -12 }} transition={{ delay: 1, type: "spring" }}>
            100%<br />OFF
          </motion.div>
        </div>
      </section>

      <Marquee items={TICKER} />

      <section className="stats">
        <div><b>{total.toLocaleString()}</b><span>styles in stock</span></div>
        <div><b>3</b><span>continents of drama</span></div>
        <div><b>$0.00</b><span>average order total</span></div>
        <div><b>0</b><span>deliveries, ever</span></div>
      </section>

      <section className="regions">
        <h2 className="section-title">Shop by <span className="serif">region</span></h2>
        <div className="region-grid">
          {regions.map((r, ri) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: ri * 0.1 }}>
              <Link to={`/shop/${r.id}`} className="region-card" style={{ "--accent": r.accent } as React.CSSProperties}>
                <div className="region-collage">
                  {r.categories.slice(0, 3).map((c, i) => (
                    <div key={c.id} className={`rc rc-${i}`} style={{ background: c.cover.colors[1] }}>
                      <ProductImage item={c.cover} />
                    </div>
                  ))}
                </div>
                <div className="region-info">
                  <h3>{r.name}</h3>
                  <p>{r.tagline}</p>
                  <span className="region-count">{compact(r.count)} pieces · {r.categories.map((c) => c.name).join(" · ")}</span>
                </div>
                <span className="region-arrow">→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="featured">
        <h2 className="section-title">Trending <span className="serif">(in transit forever)</span></h2>
        <div className="grid">
          {featured.map((item, i) => <ProductCard key={item.id} item={item} index={i} />)}
        </div>
      </section>

      <section className="how" id="how">
        <h2 className="section-title">How it <span className="serif">doesn't</span> work</h2>
        <div className="steps">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} className="step" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </Page>
  );
}

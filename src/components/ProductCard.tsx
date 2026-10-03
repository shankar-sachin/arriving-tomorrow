import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { CardItem } from "../catalog/types";
import { compact, money } from "../lib/format";
import { ProductImage } from "./ProductImage";

export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      <span className="stars-fill" style={{ width: `${(rating / 5) * 100}%` }}>★★★★★</span>
      <span className="stars-bg">★★★★★</span>
      {reviews !== undefined && <span className="stars-count">{compact(reviews)}</span>}
    </span>
  );
}

export function PriceTag({ price, compareAt }: { price: number; compareAt: number }) {
  const off = Math.round((1 - price / compareAt) * 100);
  return (
    <span className="price">
      <strong>{money(price)}</strong>
      <s>{money(compareAt)}</s>
      <em>-{off}%</em>
    </span>
  );
}

export function ProductCard({ item, index = 0 }: { item: CardItem; index?: number }) {
  return (
    <motion.article
      className="card"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: Math.min(index % 24, 12) * 0.03 }}
      whileHover={{ y: -6, rotate: index % 2 ? 1.2 : -1.2 }}
    >
      <Link to={`/item/${item.id}`} className="card-link">
        <div className="card-art" style={{ background: item.photo ? item.photo.bg : `${item.colors[1]}55` }}>
          {item.badge && <span className="badge">{item.badge}</span>}
          <ProductImage item={item} />
        </div>
        <div className="card-body">
          <h3>{item.name}</h3>
          <Stars rating={item.rating} reviews={item.reviews} />
          <PriceTag price={item.price} compareAt={item.compareAt} />
        </div>
      </Link>
    </motion.article>
  );
}

import { FormEvent, useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { motion, useAnimationControls } from "framer-motion";
import { REGIONS } from "../catalog/taxonomy";
import { itemCount } from "../lib/pricing";
import { useShop } from "../lib/store";
import { LogoMark } from "./Logo";

export function Header() {
  const cart = useShop((s) => s.cart);
  const pulse = useShop((s) => s.pulse);
  const orders = useShop((s) => s.orders.length);
  const controls = useAnimationControls();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    if (pulse) void controls.start({ scale: [1, 1.45, 0.9, 1.1, 1], rotate: [0, -12, 10, -4, 0], transition: { duration: 0.6 } });
  }, [pulse, controls]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const count = itemCount(cart);

  return (
    <header className="header">
      <Link to="/" className="logo">
        <LogoMark className="logo-mark" />
        <span className="logo-text">Clothes <i>Never</i> Come</span>
      </Link>
      <nav className="nav">
        {REGIONS.map((r) => (
          <NavLink key={r.id} to={`/shop/${r.id}`} style={{ "--accent": r.accent } as React.CSSProperties}>
            {r.name}
          </NavLink>
        ))}
      </nav>
      <form className="search" onSubmit={submit} role="search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 6,000+ things you'll never get" aria-label="Search the catalog" />
      </form>
      <NavLink to="/orders" className="hdr-btn">
        Orders{orders ? <small>{orders}</small> : null}
      </NavLink>
      <Link to="/cart" className="hdr-btn cart-btn" aria-label={`Cart, ${count} items`}>
        Cart
        <motion.span className="cart-count" animate={controls}>{count}</motion.span>
      </Link>
    </header>
  );
}

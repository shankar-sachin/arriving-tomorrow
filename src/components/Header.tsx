import { FormEvent, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, useAnimationControls } from "framer-motion";
import { REGIONS } from "../catalog/taxonomy";
import { itemCount } from "../lib/pricing";
import { useShop } from "../lib/store";
import { LogoMark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/** On small screens, slide the header away while scrolling down and back on scroll up. */
function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setHidden(y > last && y > 160 && window.innerWidth <= 720);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return hidden;
}

export function Header() {
  const cart = useShop((s) => s.cart);
  const pulse = useShop((s) => s.pulse);
  const orders = useShop((s) => s.orders.length);
  const controls = useAnimationControls();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const location = useLocation();
  const hidden = useHideOnScroll();
  const aud = location.pathname === "/shop/all" ? params.get("aud") : null;

  useEffect(() => {
    if (pulse) void controls.start({ scale: [1, 1.45, 0.9, 1.1, 1], rotate: [0, -12, 10, -4, 0], transition: { duration: 0.6 } });
  }, [pulse, controls]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const count = itemCount(cart);

  return (
    <header className={`header ${hidden ? "header-hidden" : ""}`}>
      <Link to="/" className="logo">
        <LogoMark className="logo-mark" />
        <span className="logo-text">arriving <i>tomorrow</i></span>
      </Link>
      <nav className="nav">
        <Link to="/shop/all?aud=women" className={aud === "women" ? "active" : ""}>Women</Link>
        <Link to="/shop/all?aud=men" className={aud === "men" ? "active" : ""}>Men</Link>
        <span className="nav-sep" aria-hidden="true" />
        {REGIONS.map((r) => (
          <NavLink key={r.id} to={`/shop/${r.id}`} style={{ "--accent": r.accent } as React.CSSProperties}>
            {r.name}
          </NavLink>
        ))}
      </nav>
      <form className="search" onSubmit={submit} role="search">
        <input type="search" enterKeyHint="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 6,000+ things you'll never get" aria-label="Search the catalog" />
      </form>
      <ThemeToggle />
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

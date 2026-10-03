import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Home } from "./pages/Home";
import { Item } from "./pages/Item";
import { NotFound } from "./pages/NotFound";
import { OrderTrack } from "./pages/OrderTrack";
import { Orders } from "./pages/Orders";
import { Search } from "./pages/Search";
import { Shop } from "./pages/Shop";

function AnimatedRoutes() {
  const location = useLocation();
  useEffect(() => window.scrollTo({ top: 0 }), [location.pathname]);
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname + location.search}>
        <Route path="/" element={<Home />} />
        <Route path="/shop/:region/:category?" element={<Shop />} />
        <Route path="/item/:id" element={<Item />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderTrack />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Header />
        <AnimatedRoutes />
        <Footer />
      </BrowserRouter>
    </MotionConfig>
  );
}

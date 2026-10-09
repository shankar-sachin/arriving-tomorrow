import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { AchievementToasts } from "./components/AchievementToasts";
import { BottomNav } from "./components/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { InstallBanner } from "./components/InstallBanner";
import { SupportChat } from "./components/SupportChat";
import { Achievements } from "./pages/Achievements";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Credits } from "./pages/Credits";
import { GetApp } from "./pages/GetApp";
import { Gift } from "./pages/Gift";
import { Home } from "./pages/Home";
import { Item } from "./pages/Item";
import { NotFound } from "./pages/NotFound";
import { OrderTrack } from "./pages/OrderTrack";
import { Orders } from "./pages/Orders";
import { Search } from "./pages/Search";
import { Shop } from "./pages/Shop";
import { Loading, Page } from "./components/Page";

const TryOn = lazy(() => import("./pages/TryOn").then((m) => ({ default: m.TryOn })));

export function AppRoutes() {
  const location = useLocation();
  // Braces matter: newer Chrome's scrollTo returns a Promise, and returning it would make
  // React treat the Promise as this effect's cleanup and crash on the next navigation.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  return (
    // Keyed by path so each page remounts (fresh state + entrance animation), while query changes
    // like shop filters or a new search update in place.
    <ErrorBoundary resetKey={location.pathname}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/shop/:region/:category?" element={<Shop />} />
        <Route path="/item/:id" element={<Item />} />
        <Route
          path="/item/:id/try"
          element={
            <Suspense fallback={<Page><Loading label="Warming up the fitting room" /></Page>}>
              <TryOn />
            </Suspense>
          }
        />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderTrack />} />
        <Route path="/gift" element={<Gift />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/app" element={<GetApp />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ErrorBoundary>
          <Header />
          <InstallBanner />
          <AppRoutes />
          <Footer />
          <BottomNav />
          <SupportChat />
          <AchievementToasts />
        </ErrorBoundary>
      </BrowserRouter>
    </MotionConfig>
  );
}

import { Link } from "react-router-dom";
import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong className="footer-logo"><LogoMark size={28} className="footer-mark" /><span>arriving <i>tomorrow</i></span></strong>
        <p>A parody store. No real products, payments, or deliveries. Nothing you enter leaves your browser.</p>
      </div>
      <p className="footer-fine">
        <Link to="/app">Get the app</Link> · <Link to="/achievements">Achievements</Link> · <Link to="/credits">Photo credits</Link> · © 2026 · Shipping policy: no · Returns: nothing to return
      </p>
    </footer>
  );
}

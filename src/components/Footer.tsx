import { Link } from "react-router-dom";
import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong className="footer-logo"><LogoMark size={28} className="footer-mark" /><span>Clothes <i>Never</i> Come</span></strong>
        <p>A parody store. No real products, payments, or deliveries. Nothing you enter leaves your browser.</p>
      </div>
      <p className="footer-fine">
        <Link to="/credits">Photo credits</Link> · © 2026 · Shipping policy: no · Returns: nothing to return
      </p>
    </footer>
  );
}

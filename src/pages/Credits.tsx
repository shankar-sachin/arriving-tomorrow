import { Loading, Page } from "../components/Page";
import type { PhotoManifest } from "../catalog/types";
import { useAsync } from "../lib/catalogApi";

const SOURCE = { met: "The Met", commons: "Wikimedia Commons", pexels: "Pexels", cma: "Cleveland Museum of Art" } as const;
// Loaded on demand so the attribution manifest stays out of the main bundle.
const loadPhotos = () => import("../catalog/photos.json").then((m) => m.default as PhotoManifest);

export function Credits() {
  const data = useAsync(loadPhotos, "photos");
  if (data.status !== "ready") return <Page><Loading label="Gathering credits" /></Page>;
  const groups = Object.entries(data.data).filter(([, list]) => list.length);
  const total = groups.reduce((n, [, l]) => n + l.length, 0);

  return (
    <Page className="credits">
      <h1 className="page-title">Photo <span className="serif">credits</span></h1>
      <p className="lede">
        {total ? `${total.toLocaleString()} photos` : "Photos"} from{" "}
        <a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" target="_blank" rel="noopener noreferrer">The Met Open Access</a> (CC0) and{" "}
        <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> (CC0, public domain, CC BY, CC BY-SA), and the{" "}
        <a href="https://www.clevelandart.org/open-access" target="_blank" rel="noopener noreferrer">Cleveland Museum of Art</a> (CC0), resized for the web.
        They're representative pictures of each garment type, not the made-up products, and none of their creators endorse this very silly store.
      </p>
      {!groups.length && <p className="empty">No photos yet. Everything is still hand-drawn.</p>}
      {groups.map(([archetype, photos]) => (
        <section key={archetype} className="credit-group">
          <h2>{archetype}</h2>
          <ul>
            {photos.map((p) => (
              <li key={p.key}>
                <img src={`${import.meta.env.BASE_URL}${p.src}`} alt="" loading="lazy" width={p.w} height={p.h} style={{ background: p.bg }} />
                <span>
                  <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">{p.title}</a>
                  <small>{p.creator} · <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer">{p.license}</a> · {SOURCE[p.source]}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Page>
  );
}

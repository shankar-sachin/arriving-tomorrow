import { useState } from "react";
import type { CardItem } from "../catalog/types";
import { GarmentArt } from "./GarmentArt";

interface Props {
  item: Pick<CardItem, "name" | "silhouette" | "pattern" | "colors" | "photo">;
  /** Large product-page variant: eager loading, floating art fallback. */
  hero?: boolean;
  className?: string;
}

/**
 * The real photo when there is one, cross-fading in over the SVG drawing. The drawing renders
 * instantly as the placeholder and stays as the fallback if the photo fails to load.
 */
export function ProductImage({ item, hero = false, className = "" }: Props) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  const photo = item.photo && state !== "failed" ? item.photo : null;
  return (
    <div className={`product-image ${photo ? "has-photo" : ""} ${state === "loaded" ? "loaded" : ""} ${className}`} style={photo ? { background: photo.bg } : undefined}>
      {state !== "loaded" && (
        <GarmentArt silhouette={item.silhouette} pattern={item.pattern} colors={item.colors} label={item.name} float={hero} className="product-art" />
      )}
      {photo && (
        <img
          src={`${import.meta.env.BASE_URL}${photo.src}`}
          width={photo.w}
          height={photo.h}
          alt={item.name}
          loading={hero ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
        />
      )}
    </div>
  );
}

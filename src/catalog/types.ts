export type RegionId = "india" | "america" | "europe";

export type Silhouette =
  | "saree"
  | "lehenga"
  | "tunic"
  | "anarkali"
  | "shirt"
  | "jacket"
  | "coat"
  | "vest"
  | "dress"
  | "ballgown"
  | "pants"
  | "skirt"
  | "corset"
  | "hat"
  | "boots"
  | "shoes"
  | "scarf";

export type Pattern =
  | "plain"
  | "stripes"
  | "dots"
  | "checks"
  | "paisley"
  | "brocade"
  | "zigzag"
  | "floral";

export type Audience = "women" | "men" | "unisex";

export type SizeKind = "apparel" | "shoes" | "hat" | "free";

export type ColorFamily =
  | "red"
  | "pink"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "neutral"
  | "black";

/** Everything needed to render a product card. */
export interface CardItem {
  id: string;
  name: string;
  region: RegionId;
  category: string;
  archetype: string;
  audience: Audience;
  fabric: string;
  silhouette: Silhouette;
  pattern: Pattern;
  /** [primary, secondary (pattern), accent] */
  colors: [string, string, string];
  colorName: string;
  colorFamily: ColorFamily;
  price: number;
  compareAt: number;
  rating: number;
  reviews: number;
  badge?: string;
  /** Real product photo, when one has been sourced for this archetype. */
  photo?: { src: string; w: number; h: number; bg: string };
}

export interface CatalogItem extends CardItem {
  motif: string;
  photoCredit?: Pick<Photo, "title" | "creator" | "license" | "licenseUrl" | "sourceUrl" | "source">;
  blurb: string;
  sizes: string[];
  tags: string[];
}

export interface CategoryMeta {
  id: string;
  name: string;
  count: number;
  cover: CardItem;
}

export interface RegionMeta {
  id: RegionId;
  name: string;
  tagline: string;
  accent: string;
  count: number;
  categories: CategoryMeta[];
}

export interface CatalogIndex {
  total: number;
  regions: RegionMeta[];
  featured: CardItem[];
}

/** A real, openly licensed product photo (see scripts/fetch-photos.ts). */
export interface Photo {
  /** Stable source id, e.g. "met:12345" or "commons:678". */
  key: string;
  /** Path relative to the site root, e.g. "photos/sherwani/met-12345.webp". */
  src: string;
  w: number;
  h: number;
  /** Measured garment colour and background colour. */
  color: string;
  bg: string;
  source: "met" | "commons" | "pexels" | "cma";
  title: string;
  creator: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}

/** Archetype name → photos. */
export type PhotoManifest = Record<string, Photo[]>;

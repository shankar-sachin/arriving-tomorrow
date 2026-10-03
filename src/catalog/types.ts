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
}

export interface CatalogItem extends CardItem {
  fabric: string;
  motif: string;
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

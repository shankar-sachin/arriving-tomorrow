import type { ColorFamily, Pattern, RegionId, Silhouette, SizeKind } from "./types";

export interface Archetype {
  name: string;
  silhouette: Silhouette;
  /** Price band in USD. */
  price: [number, number];
  sizes: SizeKind;
  /** Overrides the region's fabric list when set. */
  fabrics?: string[];
}

export interface Category {
  id: string;
  name: string;
  archetypes: Archetype[];
}

export interface Region {
  id: RegionId;
  name: string;
  tagline: string;
  accent: string;
  fabrics: string[];
  motifs: Array<[label: string, pattern: Pattern]>;
  categories: Category[];
}

export interface Palette {
  name: string;
  family: ColorFamily;
  colors: [string, string, string];
}

export const PALETTES: Palette[] = [
  { name: "Saffron", family: "orange", colors: ["#f4a024", "#fff1c9", "#c2185b"] },
  { name: "Marigold", family: "yellow", colors: ["#ffb703", "#fb8500", "#7b2ff7"] },
  { name: "Ruby", family: "red", colors: ["#c1121f", "#ffd166", "#2b2d42"] },
  { name: "Vermilion", family: "red", colors: ["#e63946", "#f1faee", "#1d3557"] },
  { name: "Rani Pink", family: "pink", colors: ["#e0218a", "#ffd6ec", "#ffb703"] },
  { name: "Blush", family: "pink", colors: ["#f8b4c8", "#ffffff", "#9d4edd"] },
  { name: "Bubblegum", family: "pink", colors: ["#ff7eb6", "#fff0f6", "#00b4a6"] },
  { name: "Peacock", family: "blue", colors: ["#006d77", "#83c5be", "#e9c46a"] },
  { name: "Midnight Indigo", family: "blue", colors: ["#1d2a6b", "#8ea8ff", "#f4d35e"] },
  { name: "Sky", family: "blue", colors: ["#7cc6fe", "#ffffff", "#f25c54"] },
  { name: "Cobalt", family: "blue", colors: ["#0047ab", "#bcd4ff", "#ffcb47"] },
  { name: "Denim Wash", family: "blue", colors: ["#3b5b8c", "#a9c1e6", "#d9a441"] },
  { name: "Emerald", family: "green", colors: ["#047857", "#a7f3d0", "#fbbf24"] },
  { name: "Mehndi Green", family: "green", colors: ["#6b8e23", "#e9f5c9", "#b5179e"] },
  { name: "Mint", family: "green", colors: ["#98e2c6", "#ffffff", "#ff6392"] },
  { name: "Sage", family: "green", colors: ["#9caf88", "#f1f5ea", "#7f5539"] },
  { name: "Royal Purple", family: "purple", colors: ["#5a189a", "#e0aaff", "#ffd60a"] },
  { name: "Lavender", family: "purple", colors: ["#b8a1e3", "#f6f0ff", "#ef476f"] },
  { name: "Wine", family: "purple", colors: ["#722f37", "#f2c6c2", "#d4af37"] },
  { name: "Ivory", family: "neutral", colors: ["#f5efe0", "#d4af37", "#8b5e34"] },
  { name: "Champagne", family: "neutral", colors: ["#e8d5b5", "#fff8ec", "#b08968"] },
  { name: "Camel", family: "neutral", colors: ["#c19a6b", "#f3e3c3", "#3d2c1e"] },
  { name: "Charcoal", family: "black", colors: ["#2f3136", "#8d8f96", "#e63946"] },
  { name: "Onyx", family: "black", colors: ["#111111", "#d4af37", "#c1121f"] },
  { name: "Tangerine", family: "orange", colors: ["#ff7b00", "#ffe0b5", "#2a9d8f"] },
  { name: "Coral", family: "orange", colors: ["#ff6f61", "#ffe5e0", "#2ec4b6"] },
  { name: "Turmeric", family: "yellow", colors: ["#e3a008", "#fff5d1", "#9b2226"] },
  { name: "Lemon", family: "yellow", colors: ["#fff275", "#ffffff", "#ff3d7f"] },
  { name: "Teal", family: "green", colors: ["#00b4a6", "#c9fff9", "#ff3d7f"] },
  { name: "Burgundy", family: "red", colors: ["#800020", "#e8c1a0", "#d4af37"] },
];

export const ADJECTIVES = [
  "Heirloom",
  "Royal",
  "Festive",
  "Midsummer",
  "Wedding-Ready",
  "Moonlit",
  "Everyday",
  "Grand",
  "Vintage",
  "Signature",
  "Limited",
  "Handcrafted",
  "Gilded",
  "Breezy",
  "Statement",
  "Classic",
  "Couture",
  "Weekend",
  "Opulent",
  "Dreamy",
];

export const OCCASIONS = [
  "weddings",
  "galas",
  "a perfectly ordinary Tuesday",
  "brunch you will be late to",
  "your nemesis's birthday",
  "festival season",
  "dramatic entrances",
  "staring wistfully out of windows",
  "the opera",
  "a barn dance",
  "the group photo",
  "being the main character",
];

const INDIA_MOTIFS: Region["motifs"] = [
  ["Paisley", "paisley"],
  ["Zari Brocade", "brocade"],
  ["Bandhani Dot", "dots"],
  ["Leheriya Wave", "zigzag"],
  ["Floral Buta", "floral"],
  ["Plain Weave", "plain"],
  ["Temple Border", "stripes"],
  ["Ikat Check", "checks"],
];

const AMERICA_MOTIFS: Region["motifs"] = [
  ["Buffalo Check", "checks"],
  ["Pinstripe", "stripes"],
  ["Polka Dot", "dots"],
  ["Calico Floral", "floral"],
  ["Solid", "plain"],
  ["Chevron", "zigzag"],
  ["Bandana Paisley", "paisley"],
  ["Diamond Quilt", "brocade"],
];

const EUROPE_MOTIFS: Region["motifs"] = [
  ["Damask", "brocade"],
  ["Toile Floral", "floral"],
  ["Regency Stripe", "stripes"],
  ["Solid", "plain"],
  ["Fleur-de-lis", "dots"],
  ["Houndstooth", "checks"],
  ["Baroque Scroll", "paisley"],
  ["Herringbone", "zigzag"],
];

const FOOTWEAR_LEATHER = ["Leather", "Suede", "Embroidered Leather", "Velvet", "Patent Leather"];

export const REGIONS: Region[] = [
  {
    id: "india",
    name: "India",
    tagline: "Silks, zari, and six yards of drama.",
    accent: "#ff3d7f",
    fabrics: [
      "Banarasi Silk",
      "Kanjeevaram Silk",
      "Chanderi",
      "Georgette",
      "Chiffon",
      "Khadi Cotton",
      "Velvet",
      "Raw Silk",
      "Organza",
      "Linen",
    ],
    motifs: INDIA_MOTIFS,
    categories: [
      {
        id: "sarees",
        name: "Sarees",
        archetypes: [
          { name: "Banarasi Saree", silhouette: "saree", price: [180, 900], sizes: "free" },
          { name: "Kanjeevaram Saree", silhouette: "saree", price: [220, 1400], sizes: "free" },
          { name: "Chiffon Saree", silhouette: "saree", price: [60, 240], sizes: "free" },
          { name: "Bandhani Saree", silhouette: "saree", price: [80, 320], sizes: "free" },
          { name: "Paithani Saree", silhouette: "saree", price: [260, 1600], sizes: "free" },
        ],
      },
      {
        id: "lehengas",
        name: "Lehengas",
        archetypes: [
          { name: "Lehenga Choli", silhouette: "lehenga", price: [240, 1200], sizes: "apparel" },
          { name: "Bridal Lehenga", silhouette: "lehenga", price: [900, 4800], sizes: "apparel" },
          { name: "Sharara Set", silhouette: "lehenga", price: [140, 620], sizes: "apparel" },
          { name: "Ghagra", silhouette: "lehenga", price: [90, 380], sizes: "apparel" },
        ],
      },
      {
        id: "kurtas-suits",
        name: "Kurtas & Suits",
        archetypes: [
          { name: "Kurta", silhouette: "tunic", price: [35, 160], sizes: "apparel" },
          { name: "Anarkali", silhouette: "anarkali", price: [120, 640], sizes: "apparel" },
          { name: "Kurti", silhouette: "tunic", price: [25, 90], sizes: "apparel" },
          { name: "Pathani Suit", silhouette: "tunic", price: [70, 220], sizes: "apparel" },
          { name: "Salwar Kameez", silhouette: "tunic", price: [60, 260], sizes: "apparel" },
        ],
      },
      {
        id: "menswear",
        name: "Menswear",
        archetypes: [
          { name: "Sherwani", silhouette: "coat", price: [320, 2200], sizes: "apparel" },
          { name: "Nehru Jacket", silhouette: "vest", price: [60, 240], sizes: "apparel" },
          { name: "Bandhgala", silhouette: "jacket", price: [180, 900], sizes: "apparel" },
          { name: "Dhoti Pants", silhouette: "pants", price: [30, 120], sizes: "apparel" },
          { name: "Achkan", silhouette: "coat", price: [260, 1500], sizes: "apparel" },
        ],
      },
      {
        id: "accessories",
        name: "Accessories",
        archetypes: [
          { name: "Dupatta", silhouette: "scarf", price: [25, 180], sizes: "free" },
          { name: "Mojari", silhouette: "shoes", price: [40, 160], sizes: "shoes", fabrics: FOOTWEAR_LEATHER },
          { name: "Pagdi Turban", silhouette: "hat", price: [45, 300], sizes: "hat" },
          { name: "Kolhapuri Chappal", silhouette: "shoes", price: [30, 110], sizes: "shoes", fabrics: FOOTWEAR_LEATHER },
        ],
      },
    ],
  },
  {
    id: "america",
    name: "America",
    tagline: "Denim, flannel, and big Sunday energy.",
    accent: "#3a86ff",
    fabrics: [
      "Selvedge Denim",
      "Flannel",
      "Cotton Twill",
      "Chambray",
      "Corduroy",
      "Wool Melton",
      "Jersey",
      "Suede",
      "Calico Cotton",
      "Seersucker",
    ],
    motifs: AMERICA_MOTIFS,
    categories: [
      {
        id: "denim",
        name: "Denim",
        archetypes: [
          { name: "Denim Jacket", silhouette: "jacket", price: [70, 260], sizes: "apparel", fabrics: ["Selvedge Denim", "Raw Denim", "Stonewash Denim", "Acid-Wash Denim", "Black Denim"] },
          { name: "Straight-Leg Jeans", silhouette: "pants", price: [50, 220], sizes: "apparel", fabrics: ["Selvedge Denim", "Raw Denim", "Stonewash Denim", "Acid-Wash Denim", "Black Denim"] },
          { name: "Overalls", silhouette: "pants", price: [60, 180], sizes: "apparel" },
          { name: "Denim Skirt", silhouette: "skirt", price: [40, 140], sizes: "apparel", fabrics: ["Selvedge Denim", "Stonewash Denim", "Acid-Wash Denim", "Black Denim"] },
        ],
      },
      {
        id: "western",
        name: "Western",
        archetypes: [
          { name: "Pearl-Snap Shirt", silhouette: "shirt", price: [45, 160], sizes: "apparel" },
          { name: "Prairie Dress", silhouette: "dress", price: [80, 300], sizes: "apparel" },
          { name: "Cowboy Boots", silhouette: "boots", price: [140, 900], sizes: "shoes", fabrics: ["Leather", "Suede", "Ostrich-Print Leather", "Tooled Leather", "Snakeskin-Print Leather"] },
          { name: "Cowboy Hat", silhouette: "hat", price: [60, 480], sizes: "hat", fabrics: ["Felt", "Straw", "Suede", "Beaver Felt", "Palm Leaf"] },
          { name: "Fringe Jacket", silhouette: "jacket", price: [120, 620], sizes: "apparel" },
        ],
      },
      {
        id: "collegiate",
        name: "Collegiate",
        archetypes: [
          { name: "Varsity Jacket", silhouette: "jacket", price: [90, 340], sizes: "apparel" },
          { name: "Letterman Sweater", silhouette: "shirt", price: [60, 180], sizes: "apparel" },
          { name: "Pleated Skirt", silhouette: "skirt", price: [35, 120], sizes: "apparel" },
          { name: "Rugby Shirt", silhouette: "shirt", price: [40, 130], sizes: "apparel" },
        ],
      },
      {
        id: "retro",
        name: "Retro",
        archetypes: [
          { name: "Poodle Skirt", silhouette: "skirt", price: [45, 150], sizes: "apparel" },
          { name: "Swing Dress", silhouette: "dress", price: [60, 210], sizes: "apparel" },
          { name: "Bowling Shirt", silhouette: "shirt", price: [35, 110], sizes: "apparel" },
          { name: "Flannel Shirt", silhouette: "shirt", price: [30, 120], sizes: "apparel" },
          { name: "Hawaiian Shirt", silhouette: "shirt", price: [30, 140], sizes: "apparel" },
        ],
      },
      {
        id: "streetwear",
        name: "Streetwear",
        archetypes: [
          { name: "Hoodie", silhouette: "shirt", price: [45, 220], sizes: "apparel" },
          { name: "Bomber Jacket", silhouette: "jacket", price: [80, 400], sizes: "apparel" },
          { name: "Cargo Pants", silhouette: "pants", price: [50, 200], sizes: "apparel" },
          { name: "High-Top Sneakers", silhouette: "shoes", price: [70, 420], sizes: "shoes", fabrics: ["Canvas", "Leather", "Suede", "Mesh", "Patent Leather"] },
        ],
      },
    ],
  },
  {
    id: "europe",
    name: "Classical Europe",
    tagline: "Corsets, crinolines, and very serious hats.",
    accent: "#7b2ff7",
    fabrics: [
      "Silk Taffeta",
      "Velvet",
      "Brocade",
      "Wool Broadcloth",
      "Muslin",
      "Duchess Satin",
      "Damask Silk",
      "Linen",
      "Chantilly Lace",
      "Tweed",
    ],
    motifs: EUROPE_MOTIFS,
    categories: [
      {
        id: "gowns",
        name: "Gowns",
        archetypes: [
          { name: "Regency Gown", silhouette: "dress", price: [180, 900], sizes: "apparel" },
          { name: "Crinoline Ball Gown", silhouette: "ballgown", price: [600, 4200], sizes: "apparel" },
          { name: "Robe à la Française", silhouette: "ballgown", price: [800, 5200], sizes: "apparel" },
          { name: "Victorian Bustle Gown", silhouette: "ballgown", price: [520, 3600], sizes: "apparel" },
          { name: "Empire-Waist Dress", silhouette: "dress", price: [120, 600], sizes: "apparel" },
        ],
      },
      {
        id: "tailoring",
        name: "Tailoring",
        archetypes: [
          { name: "Frock Coat", silhouette: "coat", price: [260, 1400], sizes: "apparel" },
          { name: "Doublet", silhouette: "jacket", price: [180, 860], sizes: "apparel" },
          { name: "Waistcoat", silhouette: "vest", price: [70, 320], sizes: "apparel" },
          { name: "Tailcoat", silhouette: "coat", price: [300, 1800], sizes: "apparel" },
          { name: "Redingote", silhouette: "coat", price: [240, 1200], sizes: "apparel" },
        ],
      },
      {
        id: "corsetry",
        name: "Corsetry",
        archetypes: [
          { name: "Corset Bodice", silhouette: "corset", price: [90, 520], sizes: "apparel" },
          { name: "Stays", silhouette: "corset", price: [110, 480], sizes: "apparel" },
          { name: "Chemise", silhouette: "dress", price: [40, 160], sizes: "apparel", fabrics: ["Muslin", "Linen", "Cotton Lawn", "Batiste", "Silk Habotai"] },
        ],
      },
      {
        id: "outerwear",
        name: "Outerwear",
        archetypes: [
          { name: "Opera Cloak", silhouette: "coat", price: [200, 1100], sizes: "apparel" },
          { name: "Military Pelisse", silhouette: "jacket", price: [240, 1300], sizes: "apparel" },
          { name: "Hussar Jacket", silhouette: "jacket", price: [220, 1100], sizes: "apparel" },
          { name: "Inverness Cape", silhouette: "coat", price: [180, 800], sizes: "apparel" },
        ],
      },
      {
        id: "accessories",
        name: "Accessories",
        archetypes: [
          { name: "Tricorne Hat", silhouette: "hat", price: [60, 340], sizes: "hat", fabrics: ["Wool Felt", "Beaver Felt", "Velvet", "Brocade", "Silk Plush"] },
          { name: "Poke Bonnet", silhouette: "hat", price: [50, 260], sizes: "hat" },
          { name: "Top Hat", silhouette: "hat", price: [90, 600], sizes: "hat", fabrics: ["Silk Plush", "Beaver Felt", "Wool Felt", "Velvet", "Moleskin"] },
          { name: "Cravat", silhouette: "scarf", price: [25, 140], sizes: "free" },
          { name: "Buckle Shoes", silhouette: "shoes", price: [110, 520], sizes: "shoes", fabrics: FOOTWEAR_LEATHER },
          { name: "Riding Boots", silhouette: "boots", price: [180, 900], sizes: "shoes", fabrics: FOOTWEAR_LEATHER },
        ],
      },
    ],
  },
];

export const SIZE_SETS: Record<SizeKind, string[]> = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  shoes: ["6", "7", "8", "9", "10", "11", "12"],
  hat: ["S/M", "L/XL"],
  free: ["One Size"],
};

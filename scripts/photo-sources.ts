/**
 * Where to look for real photos of each archetype.
 *
 * - `met`: The Met Collection API (CC0). `q` is the search text; an object is accepted only if its
 *   `objectName` contains one of `names` and it lives in a costume/textile department.
 * - `commons`: Wikimedia Commons search queries (only CC0 / public domain / CC BY / CC BY-SA kept).
 * - `pexels`: Pexels search queries, used only when PEXELS_API_KEY is set.
 *
 * Keys must match archetype names in src/catalog/taxonomy.ts (a unit test enforces this).
 */
export interface PhotoSource {
  met?: { q: string; names: string[] };
  commons?: string[];
  pexels?: string[];
}

export const PHOTO_SOURCES: Record<string, PhotoSource> = {
  // ───── India ─────
  "Banarasi Saree": { met: { q: "sari", names: ["sari"] }, commons: ["Banarasi saree", "Banarasi sari"], pexels: ["banarasi saree"] },
  "Kanjeevaram Saree": { met: { q: "sari silk", names: ["sari"] }, commons: ["Kanchipuram silk saree", "Kanjivaram saree"], pexels: ["silk saree"] },
  "Chiffon Saree": { met: { q: "sari", names: ["sari"] }, commons: ["chiffon saree", "georgette saree"], pexels: ["chiffon saree"] },
  "Bandhani Saree": { met: { q: "bandhani", names: ["sari", "odhani", "shawl"] }, commons: ["bandhani saree", "bandhani sari"], pexels: ["bandhani"] },
  "Paithani Saree": { met: { q: "sari", names: ["sari"] }, commons: ["Paithani saree", "Paithani sari"], pexels: ["paithani saree"] },
  "Lehenga Choli": { met: { q: "skirt India", names: ["skirt", "ghagra", "lehenga"] }, commons: ["lehenga choli", "lehenga"], pexels: ["lehenga"] },
  "Bridal Lehenga": { met: { q: "skirt India", names: ["skirt", "ghagra", "lehenga"] }, commons: ["bridal lehenga", "lehenga bridal"], pexels: ["bridal lehenga"] },
  "Sharara Set": { commons: ["sharara", "gharara"], pexels: ["sharara"] },
  Ghagra: { met: { q: "ghagra", names: ["skirt", "ghagra"] }, commons: ["ghagra choli", "ghagra"], pexels: ["ghagra choli"] },
  Kurta: { met: { q: "kurta", names: ["kurta", "tunic", "shirt"] }, commons: ["kurta", "kurta pajama"], pexels: ["kurta"] },
  Anarkali: { met: { q: "angarkha", names: ["angarkha", "jama", "dress"] }, commons: ["anarkali suit", "anarkali dress"], pexels: ["anarkali"] },
  Kurti: { commons: ["kurti", "kurti top"], pexels: ["kurti"] },
  "Pathani Suit": { commons: ["pathani suit", "pathani kurta"], pexels: ["pathani suit"] },
  "Salwar Kameez": { commons: ["salwar kameez", "shalwar kameez"], pexels: ["salwar kameez"] },
  Sherwani: { met: { q: "sherwani", names: ["sherwani", "coat", "jama"] }, commons: ["sherwani"], pexels: ["sherwani"] },
  "Nehru Jacket": { commons: ["Nehru jacket", "Modi jacket"], pexels: ["nehru jacket"] },
  Bandhgala: { commons: ["bandhgala", "jodhpuri suit"], pexels: ["bandhgala"] },
  "Dhoti Pants": { commons: ["dhoti pants", "dhoti"], pexels: ["dhoti"] },
  Achkan: { met: { q: "achkan", names: ["achkan", "coat", "jama"] }, commons: ["achkan"], pexels: ["achkan"] },
  Dupatta: { met: { q: "shawl India", names: ["shawl", "odhani", "dupatta"] }, commons: ["dupatta"], pexels: ["dupatta"] },
  Mojari: { met: { q: "slippers India", names: ["slipper", "shoe"] }, commons: ["mojari", "jutti shoes"], pexels: ["mojari"] },
  "Pagdi Turban": { met: { q: "turban", names: ["turban"] }, commons: ["pagdi", "rajasthani turban", "safa turban"], pexels: ["rajasthani turban"] },
  "Kolhapuri Chappal": { commons: ["Kolhapuri chappal", "kolhapuri sandals"], pexels: ["kolhapuri chappal"] },

  // ───── America ─────
  "Denim Jacket": { met: { q: "denim jacket", names: ["jacket"] }, commons: ["denim jacket", "jean jacket"], pexels: ["denim jacket"] },
  "Straight-Leg Jeans": { met: { q: "jeans", names: ["jeans", "trousers", "pants"] }, commons: ["blue jeans", "jeans trousers"], pexels: ["jeans product"] },
  Overalls: { met: { q: "overalls", names: ["overalls", "jumpsuit"] }, commons: ["denim overalls", "bib overalls"], pexels: ["overalls"] },
  "Denim Skirt": { commons: ["denim skirt", "jean skirt"], pexels: ["denim skirt"] },
  "Pearl-Snap Shirt": { commons: ["western shirt", "pearl snap shirt"], pexels: ["western shirt"] },
  "Prairie Dress": { met: { q: "calico dress", names: ["dress"] }, commons: ["prairie dress", "calico dress"], pexels: ["prairie dress"] },
  "Cowboy Boots": { met: { q: "cowboy boots", names: ["boots"] }, commons: ["cowboy boots", "western boots"], pexels: ["cowboy boots"] },
  "Cowboy Hat": { met: { q: "cowboy hat", names: ["hat"] }, commons: ["cowboy hat", "stetson hat"], pexels: ["cowboy hat"] },
  "Fringe Jacket": { met: { q: "fringe jacket", names: ["jacket"] }, commons: ["fringe jacket", "buckskin jacket"], pexels: ["fringe jacket"] },
  "Varsity Jacket": { commons: ["varsity jacket", "letterman jacket"], pexels: ["varsity jacket"] },
  "Letterman Sweater": { commons: ["letterman sweater", "varsity sweater"], pexels: ["varsity sweater"] },
  "Pleated Skirt": { met: { q: "pleated skirt", names: ["skirt"] }, commons: ["pleated skirt"], pexels: ["pleated skirt"] },
  "Rugby Shirt": { commons: ["rugby shirt", "rugby jersey striped"], pexels: ["rugby shirt"] },
  "Poodle Skirt": { met: { q: "circle skirt", names: ["skirt"] }, commons: ["poodle skirt", "circle skirt"], pexels: ["poodle skirt"] },
  "Swing Dress": { met: { q: "day dress 1950s", names: ["dress", "day dress", "cocktail dress"] }, commons: ["1950s dress", "swing dress"], pexels: ["1950s dress"] },
  "Bowling Shirt": { commons: ["bowling shirt", "camp collar shirt"], pexels: ["bowling shirt"] },
  "Flannel Shirt": { commons: ["flannel shirt", "plaid flannel shirt"], pexels: ["flannel shirt"] },
  "Hawaiian Shirt": { met: { q: "aloha shirt", names: ["shirt"] }, commons: ["Hawaiian shirt", "aloha shirt"], pexels: ["hawaiian shirt"] },
  Hoodie: { commons: ["hoodie", "hooded sweatshirt"], pexels: ["hoodie product"] },
  "Bomber Jacket": { met: { q: "flight jacket", names: ["jacket"] }, commons: ["bomber jacket", "flight jacket"], pexels: ["bomber jacket"] },
  "Cargo Pants": { commons: ["cargo pants", "cargo trousers"], pexels: ["cargo pants"] },
  "High-Top Sneakers": { met: { q: "sneakers", names: ["sneakers", "shoes", "basketball shoes"] }, commons: ["high-top sneakers", "high top shoes"], pexels: ["high top sneakers"] },

  // ───── Classical Europe ─────
  "Regency Gown": { met: { q: "dress 1810", names: ["dress", "evening dress"] }, commons: ["Regency dress", "Regency era gown"], pexels: ["regency dress"] },
  "Crinoline Ball Gown": { met: { q: "ball gown 1860", names: ["ball gown", "evening dress", "dress"] }, commons: ["crinoline dress", "crinoline gown"], pexels: ["ball gown"] },
  "Robe à la Française": { met: { q: "robe a la francaise", names: ["robe à la française", "robe a la francaise", "dress"] }, commons: ["robe à la française"] },
  "Victorian Bustle Gown": { met: { q: "bustle dress 1880", names: ["dress", "ensemble", "afternoon dress"] }, commons: ["bustle dress", "Victorian bustle gown"] },
  "Empire-Waist Dress": { met: { q: "empire waist dress", names: ["dress", "evening dress"] }, commons: ["empire waist dress", "empire silhouette dress"], pexels: ["empire waist dress"] },
  "Frock Coat": { met: { q: "frock coat", names: ["frock coat", "coat"] }, commons: ["frock coat"] },
  Doublet: { met: { q: "doublet", names: ["doublet"] }, commons: ["doublet garment", "doublet 17th century"] },
  Waistcoat: { met: { q: "waistcoat", names: ["waistcoat", "vest"] }, commons: ["waistcoat 18th century", "embroidered waistcoat"], pexels: ["waistcoat"] },
  Tailcoat: { met: { q: "tailcoat", names: ["tailcoat", "coat", "dress coat"] }, commons: ["tailcoat", "tail coat"] },
  Redingote: { met: { q: "redingote", names: ["redingote", "coat"] }, commons: ["redingote"] },
  "Corset Bodice": { met: { q: "corset", names: ["corset"] }, commons: ["corset 19th century", "Victorian corset"], pexels: ["corset"] },
  Stays: { met: { q: "stays", names: ["stays", "corset"] }, commons: ["18th century stays"] },
  Chemise: { met: { q: "chemise", names: ["chemise"] }, commons: ["chemise dress", "chemise a la reine"] },
  "Opera Cloak": { met: { q: "evening cape", names: ["cape", "cloak", "evening cape", "opera cloak", "evening wrap"] }, commons: ["opera cloak", "evening cape"] },
  "Military Pelisse": { met: { q: "pelisse", names: ["pelisse"] }, commons: ["pelisse"] },
  "Hussar Jacket": { met: { q: "hussar", names: ["jacket", "dolman", "pelisse"] }, commons: ["hussar jacket", "hussar dolman"] },
  "Inverness Cape": { met: { q: "inverness cape", names: ["cape", "coat"] }, commons: ["Inverness cape", "Inverness coat"] },
  "Tricorne Hat": { met: { q: "tricorne", names: ["tricorne", "hat", "cocked hat"] }, commons: ["tricorne hat", "tricorn"] },
  "Poke Bonnet": { met: { q: "bonnet", names: ["bonnet"] }, commons: ["poke bonnet", "19th century bonnet"] },
  "Top Hat": { met: { q: "top hat", names: ["top hat", "hat"] }, commons: ["top hat"], pexels: ["top hat"] },
  Cravat: { met: { q: "cravat", names: ["cravat", "neckcloth", "necktie"] }, commons: ["cravat", "ascot tie"] },
  "Buckle Shoes": { met: { q: "shoes buckle 18th century", names: ["shoes", "pair of shoes", "shoe buckles"] }, commons: ["18th century shoes buckle"] },
  "Riding Boots": { met: { q: "riding boots", names: ["boots", "riding boots"] }, commons: ["riding boots", "equestrian boots"], pexels: ["riding boots"] },
};

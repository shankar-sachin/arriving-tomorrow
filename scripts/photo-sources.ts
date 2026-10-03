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
  "Chiffon Saree": { commons: ["chiffon saree", "georgette saree", "printed saree", "saree drape"], pexels: ["chiffon saree"] },
  "Bandhani Saree": { met: { q: "bandhani", names: ["sari", "odhani", "shawl"] }, commons: ["bandhani saree", "bandhani sari"], pexels: ["bandhani"] },
  "Paithani Saree": { met: { q: "sari", names: ["sari"] }, commons: ["Paithani saree", "Paithani sari"], pexels: ["paithani saree"] },
  "Lehenga Choli": { met: { q: "skirt India", names: ["skirt", "ghagra", "lehenga"] }, commons: ["lehenga choli", "lehenga"], pexels: ["lehenga"] },
  "Bridal Lehenga": { met: { q: "skirt India", names: ["skirt", "ghagra", "lehenga"] }, commons: ["bridal lehenga", "lehenga bridal"], pexels: ["bridal lehenga"] },
  "Sharara Set": { commons: ["sharara suit", "gharara dress", "sharara bride", "gharara"], pexels: ["sharara"] },
  Ghagra: { met: { q: "ghagra", names: ["skirt", "ghagra"] }, commons: ["ghagra choli", "ghagra"], pexels: ["ghagra choli"] },
  Kurta: { commons: ["kurta pajama", "cotton kurta", "chikan kurta", "kurta men"], pexels: ["kurta"] },
  Anarkali: { met: { q: "angarkha", names: ["angarkha", "jama", "dress"] }, commons: ["anarkali suit", "anarkali dress"], pexels: ["anarkali"] },
  Kurti: { commons: ["ladies kurti", "kurti fashion", "kurti top women", "short kurta women"], pexels: ["kurti"] },
  "Pathani Suit": { commons: ["pathani kurta", "pathani suit men", "shalwar kameez men", "khan dress"], pexels: ["pathani suit"] },
  "Salwar Kameez": { commons: ["salwar kameez", "shalwar kameez"], pexels: ["salwar kameez"] },
  Sherwani: { commons: ["sherwani", "sherwani groom", "sherwani wedding", "sherwani mannequin"], pexels: ["sherwani"] },
  "Nehru Jacket": { commons: ["Nehru jacket", "Nehru jacket waistcoat", "bandi jacket"], pexels: ["nehru jacket"] },
  Bandhgala: { commons: ["bandhgala suit", "Jodhpuri coat", "bandh gala jacket", "jodhpuri suit"], pexels: ["bandhgala"] },
  "Dhoti Pants": { commons: ["dhoti pants", "dhoti"], pexels: ["dhoti"] },
  Achkan: { commons: ["achkan sherwani", "achkan coat", "Indian achkan"], pexels: ["achkan"] },
  Dupatta: { met: { q: "shawl India", names: ["shawl", "odhani", "dupatta"] }, commons: ["dupatta"], pexels: ["dupatta"] },
  Mojari: { met: { q: "slippers India", names: ["slipper", "shoe"] }, commons: ["mojari", "jutti shoes"], pexels: ["mojari"] },
  "Pagdi Turban": { met: { q: "turban", names: ["turban"] }, commons: ["pagdi", "rajasthani turban", "safa turban"], pexels: ["rajasthani turban"] },
  "Kolhapuri Chappal": { commons: ["Kolhapuri chappal", "kolhapuri sandals"], pexels: ["kolhapuri chappal"] },

  // ───── America ─────
  "Denim Jacket": { met: { q: "denim jacket", names: ["jacket"] }, commons: ["denim jacket", "jean jacket"], pexels: ["denim jacket"] },
  "Straight-Leg Jeans": { commons: ["pair of jeans", "denim jeans folded", "blue denim trousers", "jeans on hanger"], pexels: ["jeans product"] },
  Overalls: { commons: ["denim bib overalls", "dungarees denim", "bib overalls", "carpenter overalls"], pexels: ["overalls"] },
  "Denim Skirt": { commons: ["denim skirt", "jean skirt"], pexels: ["denim skirt"] },
  "Pearl-Snap Shirt": { commons: ["western shirt", "pearl snap shirt"], pexels: ["western shirt"] },
  "Prairie Dress": { met: { q: "calico dress", names: ["dress"] }, commons: ["prairie dress", "calico dress"], pexels: ["prairie dress"] },
  "Cowboy Boots": { met: { q: "cowboy boots", names: ["boots"] }, commons: ["cowboy boots", "western boots"], pexels: ["cowboy boots"] },
  "Cowboy Hat": { met: { q: "cowboy hat", names: ["hat"] }, commons: ["cowboy hat", "stetson hat"], pexels: ["cowboy hat"] },
  "Fringe Jacket": { commons: ["fringed leather jacket", "fringe jacket", "buckskin jacket fringe"], pexels: ["fringe jacket"] },
  "Varsity Jacket": { commons: ["varsity jacket", "letterman jacket"], pexels: ["varsity jacket"] },
  "Letterman Sweater": { commons: ["letterman sweater", "varsity sweater", "letter sweater cardigan"], pexels: ["varsity sweater"] },
  "Pleated Skirt": { met: { q: "pleated skirt", names: ["skirt"] }, commons: ["pleated skirt"], pexels: ["pleated skirt"] },
  "Rugby Shirt": { commons: ["rugby shirt", "rugby jersey striped"], pexels: ["rugby shirt"] },
  "Poodle Skirt": { met: { q: "circle skirt", names: ["skirt"] }, commons: ["poodle skirt", "circle skirt"], pexels: ["poodle skirt"] },
  "Swing Dress": { met: { q: "day dress 1950s", names: ["dress", "day dress", "cocktail dress"] }, commons: ["1950s dress", "swing dress"], pexels: ["1950s dress"] },
  "Bowling Shirt": { commons: ["bowling shirt", "1950s bowling shirt", "camp shirt", "rockabilly shirt"], pexels: ["bowling shirt"] },
  "Flannel Shirt": { commons: ["flannel shirt", "plaid flannel shirt"], pexels: ["flannel shirt"] },
  "Hawaiian Shirt": { met: { q: "aloha shirt", names: ["shirt"] }, commons: ["Hawaiian shirt", "aloha shirt"], pexels: ["hawaiian shirt"] },
  Hoodie: { commons: ["hoodie", "hooded sweatshirt"], pexels: ["hoodie product"] },
  "Bomber Jacket": { met: { q: "flight jacket", names: ["jacket"] }, commons: ["bomber jacket", "flight jacket"], pexels: ["bomber jacket"] },
  "Cargo Pants": { commons: ["cargo pants", "cargo trousers"], pexels: ["cargo pants"] },
  "High-Top Sneakers": { met: { q: "sneakers", names: ["sneakers", "shoes", "basketball shoes"] }, commons: ["high-top sneakers", "high top shoes"], pexels: ["high top sneakers"] },

  // ───── Classical Europe ─────
  "Regency Gown": { commons: ["Regency dress", "1810s gown", "Regency era gown museum", "1800s dress museum"], pexels: ["regency dress"] },
  "Crinoline Ball Gown": { met: { q: "ball gown 1860", names: ["ball gown", "evening dress", "dress"] }, commons: ["crinoline dress", "crinoline gown"], pexels: ["ball gown"] },
  "Robe à la Française": { met: { q: "robe a la francaise", names: ["robe à la française", "robe a la francaise", "dress"] }, commons: ["robe à la française"] },
  "Victorian Bustle Gown": { met: { q: "bustle dress 1880", names: ["dress", "ensemble", "afternoon dress"] }, commons: ["bustle dress", "Victorian bustle gown"] },
  "Empire-Waist Dress": { commons: ["empire waist dress", "1810s dress museum", "empire gown", "Regency dress museum"], pexels: ["empire waist dress"] },
  "Frock Coat": { met: { q: "frock coat", names: ["frock coat", "coat"] }, commons: ["frock coat"] },
  Doublet: { met: { q: "doublet", names: ["doublet"] }, commons: ["doublet garment", "doublet 17th century"] },
  Waistcoat: { met: { q: "waistcoat", names: ["waistcoat", "vest"] }, commons: ["waistcoat 18th century", "embroidered waistcoat"], pexels: ["waistcoat"] },
  Tailcoat: { met: { q: "tailcoat", names: ["tailcoat", "coat", "dress coat"] }, commons: ["tailcoat", "tail coat"] },
  Redingote: { met: { q: "redingote", names: ["redingote", "coat"] }, commons: ["redingote"] },
  "Corset Bodice": { met: { q: "corset", names: ["corset"] }, commons: ["corset 19th century", "Victorian corset"], pexels: ["corset"] },
  Stays: { met: { q: "stays", names: ["stays", "corset"] }, commons: ["18th century stays"] },
  Chemise: { commons: ["chemise a la reine", "1790s chemise dress", "chemise dress museum", "muslin chemise gown"] },
  "Opera Cloak": { met: { q: "evening cape", names: ["cape", "cloak", "evening cape", "opera cloak", "evening wrap"] }, commons: ["opera cloak", "evening cape"] },
  "Military Pelisse": { met: { q: "pelisse", names: ["pelisse"] }, commons: ["pelisse"] },
  "Hussar Jacket": { commons: ["hussar dolman", "hussar jacket", "hussar pelisse uniform", "hussar uniform museum"] },
  "Inverness Cape": { commons: ["Inverness coat", "caped overcoat", "Victorian cape coat", "Inverness cape coat"] },
  "Tricorne Hat": { met: { q: "tricorne", names: ["tricorne", "hat", "cocked hat"] }, commons: ["tricorne hat", "tricorn"] },
  "Poke Bonnet": { commons: ["poke bonnet", "1830s bonnet", "straw bonnet 19th century", "Regency bonnet"] },
  "Top Hat": { met: { q: "top hat", names: ["top hat", "hat"] }, commons: ["top hat"], pexels: ["top hat"] },
  Cravat: { met: { q: "cravat", names: ["cravat", "neckcloth", "necktie"] }, commons: ["cravat", "ascot tie"] },
  "Buckle Shoes": { commons: ["18th century shoes", "buckled shoes museum", "Georgian shoes buckle", "shoe with buckle 1780"] },
  "Riding Boots": { met: { q: "riding boots", names: ["boots", "riding boots"] }, commons: ["riding boots", "equestrian boots"], pexels: ["riding boots"] },
};

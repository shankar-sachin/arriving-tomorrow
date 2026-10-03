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
  /** The Met's CC0 photos mirrored on Commons, matched by filename ("Corset MET C.I.40… .jpg"). */
  metCommons?: string[];
  /** Commons categories: search category titles, keep those containing a `must` term (and no `not` term). */
  cats?: { search: string[]; must: string[]; not?: string[] };
  /** Cleveland Museum of Art Open Access (CC0) searches, limited to textiles and costume. */
  cma?: string[];
  commons?: string[];
  pexels?: string[];
}

export const PHOTO_SOURCES: Record<string, PhotoSource> = {
  // ───── India ─────
  "Banarasi Saree": { metCommons: ["Sari"], cats: { search: ["Banarasi sari", "Banarasi saree"], must: ["banaras", "banarasi"] }, cma: ["sari"], met: { q: "sari", names: ["sari"] }, commons: ["Banarasi saree", "Banarasi sari"], pexels: ["banarasi saree"] },
  "Kanjeevaram Saree": { metCommons: ["Sari"], cats: { search: ["Kanchipuram sari", "Kanchipuram silk"], must: ["kanchipuram", "kanjeevaram", "kanjivaram"] }, cma: ["sari"], met: { q: "sari silk", names: ["sari"] }, commons: ["Kanchipuram silk saree", "Kanjivaram saree"], pexels: ["silk saree"] },
  "Chiffon Saree": { metCommons: ["Sari"], cats: { search: ["Saris", "Sarees"], must: ["sari", "saree"] }, cma: ["sari"], commons: ["chiffon saree", "georgette saree", "printed saree", "saree drape"], pexels: ["chiffon saree"] },
  "Bandhani Saree": { metCommons: ["Sari"], cats: { search: ["Bandhani"], must: ["bandhani", "bandhej"] }, cma: ["tie-dyed sari", "bandhani"], met: { q: "bandhani", names: ["sari", "odhani", "shawl"] }, commons: ["bandhani saree", "bandhani sari"], pexels: ["bandhani"] },
  "Paithani Saree": { metCommons: ["Sari"], cats: { search: ["Paithani"], must: ["paithani"] }, cma: ["sari"], met: { q: "sari", names: ["sari"] }, commons: ["Paithani saree", "Paithani sari"], pexels: ["paithani saree"] },
  "Lehenga Choli": { cats: { search: ["Lehenga", "Lehenga choli"], must: ["lehenga", "lehnga"] }, met: { q: "skirt India", names: ["skirt", "ghagra", "lehenga"] }, commons: ["lehenga choli", "lehenga"], pexels: ["lehenga"] },
  "Bridal Lehenga": { cats: { search: ["Lehenga", "Bridal lehenga"], must: ["lehenga", "lehnga"] }, met: { q: "skirt India", names: ["skirt", "ghagra", "lehenga"] }, commons: ["bridal lehenga", "lehenga bridal"], pexels: ["bridal lehenga"] },
  "Sharara Set": { cats: { search: ["Sharara", "Gharara"], must: ["sharara", "gharara"] }, commons: ["sharara suit", "gharara dress", "sharara bride", "gharara"], pexels: ["sharara"] },
  Ghagra: { metCommons: ["Ghagra"], cats: { search: ["Ghagra", "Ghagra choli", "Chaniya choli"], must: ["ghagra", "chaniya"] }, cma: ["skirt india"], met: { q: "ghagra", names: ["skirt", "ghagra"] }, commons: ["ghagra choli", "ghagra"], pexels: ["ghagra choli"] },
  Kurta: { metCommons: ["Kurta"], cats: { search: ["Kurta", "Kurtas"], must: ["kurta"] }, commons: ["kurta pajama", "cotton kurta", "chikan kurta", "kurta men"], pexels: ["kurta"] },
  Anarkali: { metCommons: ["Angarkha"], cats: { search: ["Anarkali"], must: ["anarkali"] }, met: { q: "angarkha", names: ["angarkha", "jama", "dress"] }, commons: ["anarkali suit", "anarkali dress"], pexels: ["anarkali"] },
  Kurti: { cats: { search: ["Kurti", "Kurtis"], must: ["kurti"], not: ["albin"] }, commons: ["ladies kurti", "kurti fashion", "kurti top women", "short kurta women"], pexels: ["kurti"] },
  "Pathani Suit": { cats: { search: ["Pathani suit", "Shalwar kameez"], must: ["pathani", "shalwar", "salwar"] }, commons: ["pathani kurta", "pathani suit men", "shalwar kameez men", "khan dress"], pexels: ["pathani suit"] },
  "Salwar Kameez": { cats: { search: ["Salwar kameez", "Shalwar kameez"], must: ["salwar", "shalwar"] }, commons: ["salwar kameez", "shalwar kameez"], pexels: ["salwar kameez"] },
  Sherwani: { metCommons: ["Sherwani", "Jama"], cats: { search: ["Sherwani", "Sherwanis"], must: ["sherwani"] }, commons: ["sherwani", "sherwani groom", "sherwani wedding", "sherwani mannequin"], pexels: ["sherwani"] },
  "Nehru Jacket": { cats: { search: ["Nehru jacket", "Nehru jackets"], must: ["nehru jacket"] }, commons: ["Nehru jacket", "Nehru jacket waistcoat", "bandi jacket"], pexels: ["nehru jacket"] },
  Bandhgala: { cats: { search: ["Jodhpuri suit", "Bandhgala"], must: ["jodhpuri", "bandhgala"] }, commons: ["bandhgala suit", "Jodhpuri coat", "bandh gala jacket", "jodhpuri suit"], pexels: ["bandhgala"] },
  "Dhoti Pants": { cats: { search: ["Dhoti", "Dhotis"], must: ["dhoti"] }, commons: ["dhoti pants", "dhoti"], pexels: ["dhoti"] },
  Achkan: { metCommons: ["Achkan"], cats: { search: ["Achkan"], must: ["achkan"] }, commons: ["achkan sherwani", "achkan coat", "Indian achkan"], pexels: ["achkan"] },
  Dupatta: { metCommons: ["Odhani"], cats: { search: ["Dupatta", "Dupattas"], must: ["dupatta"] }, cma: ["odhani"], met: { q: "shawl India", names: ["shawl", "odhani", "dupatta"] }, commons: ["dupatta"], pexels: ["dupatta"] },
  Mojari: { cats: { search: ["Mojari", "Juttis", "Jutti"], must: ["mojari", "jutti"] }, met: { q: "slippers India", names: ["slipper", "shoe"] }, commons: ["mojari", "jutti shoes"], pexels: ["mojari"] },
  "Pagdi Turban": { metCommons: ["Turban"], cats: { search: ["Pagri", "Rajasthani turban", "Turbans of India"], must: ["pagri", "pagdi", "turban"] }, met: { q: "turban", names: ["turban"] }, commons: ["pagdi", "rajasthani turban", "safa turban"], pexels: ["rajasthani turban"] },
  "Kolhapuri Chappal": { cats: { search: ["Kolhapuri chappal"], must: ["kolhapuri"] }, commons: ["Kolhapuri chappal", "kolhapuri sandals"], pexels: ["kolhapuri chappal"] },

  // ───── America ─────
  "Denim Jacket": { metCommons: ["Jean jacket", "Denim jacket"], cats: { search: ["Denim jackets", "Jean jackets"], must: ["denim jacket", "jean jacket"] }, met: { q: "denim jacket", names: ["jacket"] }, commons: ["denim jacket", "jean jacket"], pexels: ["denim jacket"] },
  "Straight-Leg Jeans": { metCommons: ["Jeans"], cats: { search: ["Jeans"], must: ["jeans"], not: ["people", "men in", "women in"] }, commons: ["pair of jeans", "denim jeans folded", "blue denim trousers", "jeans on hanger"], pexels: ["jeans product"] },
  Overalls: { metCommons: ["Overalls"], cats: { search: ["Overalls", "Bib overalls"], must: ["overall"] }, commons: ["denim bib overalls", "dungarees denim", "bib overalls", "carpenter overalls"], pexels: ["overalls"] },
  "Denim Skirt": { cats: { search: ["Denim skirts"], must: ["denim skirt"] }, commons: ["denim skirt", "jean skirt"], pexels: ["denim skirt"] },
  "Pearl-Snap Shirt": { cats: { search: ["Western shirts"], must: ["western shirt"] }, commons: ["western shirt", "pearl snap shirt"], pexels: ["western shirt"] },
  "Prairie Dress": { cats: { search: ["Prairie dresses", "Calico dresses"], must: ["prairie", "calico"] }, met: { q: "calico dress", names: ["dress"] }, commons: ["prairie dress", "calico dress"], pexels: ["prairie dress"] },
  "Cowboy Boots": { metCommons: ["Cowboy boots"], cats: { search: ["Cowboy boots"], must: ["cowboy boot"] }, met: { q: "cowboy boots", names: ["boots"] }, commons: ["cowboy boots", "western boots"], pexels: ["cowboy boots"] },
  "Cowboy Hat": { cats: { search: ["Cowboy hats"], must: ["cowboy hat"], not: ["people", "wearing"] }, met: { q: "cowboy hat", names: ["hat"] }, commons: ["cowboy hat", "stetson hat"], pexels: ["cowboy hat"] },
  "Fringe Jacket": { cats: { search: ["Fringe jackets", "Buckskin jackets"], must: ["fringe", "buckskin"] }, commons: ["fringed leather jacket", "fringe jacket", "buckskin jacket fringe"], pexels: ["fringe jacket"] },
  "Varsity Jacket": { cats: { search: ["Varsity jackets", "Letterman jackets"], must: ["varsity", "letterman"] }, commons: ["varsity jacket", "letterman jacket"], pexels: ["varsity jacket"] },
  "Letterman Sweater": { metCommons: ["Letter sweater"], cats: { search: ["Letter sweaters", "Varsity sweaters"], must: ["letter sweater", "varsity sweater", "letterman"] }, commons: ["letterman sweater", "varsity sweater", "letter sweater cardigan"], pexels: ["varsity sweater"] },
  "Pleated Skirt": { cats: { search: ["Pleated skirts"], must: ["pleated"] }, met: { q: "pleated skirt", names: ["skirt"] }, commons: ["pleated skirt"], pexels: ["pleated skirt"] },
  "Rugby Shirt": { cats: { search: ["Rugby shirts", "Rugby jerseys"], must: ["rugby shirt", "rugby jersey", "rugby union shirts"] }, commons: ["rugby shirt", "rugby jersey striped"], pexels: ["rugby shirt"] },
  "Poodle Skirt": { cats: { search: ["Poodle skirts", "Circle skirts"], must: ["poodle skirt", "circle skirt"] }, met: { q: "circle skirt", names: ["skirt"] }, commons: ["poodle skirt", "circle skirt"], pexels: ["poodle skirt"] },
  "Swing Dress": { metCommons: ["Day dress", "Cocktail dress"], cats: { search: ["1950s dresses", "1950s fashion"], must: ["1950s"] }, met: { q: "day dress 1950s", names: ["dress", "day dress", "cocktail dress"] }, commons: ["1950s dress", "swing dress"], pexels: ["1950s dress"] },
  "Bowling Shirt": { cats: { search: ["Bowling shirts", "Camp shirts"], must: ["bowling shirt", "camp shirt"] }, commons: ["bowling shirt", "1950s bowling shirt", "camp shirt", "rockabilly shirt"], pexels: ["bowling shirt"] },
  "Flannel Shirt": { cats: { search: ["Flannel shirts"], must: ["flannel"] }, commons: ["flannel shirt", "plaid flannel shirt"], pexels: ["flannel shirt"] },
  "Hawaiian Shirt": { metCommons: ["Aloha shirt"], cats: { search: ["Aloha shirts", "Hawaiian shirts"], must: ["aloha shirt", "hawaiian shirt"] }, met: { q: "aloha shirt", names: ["shirt"] }, commons: ["Hawaiian shirt", "aloha shirt"], pexels: ["hawaiian shirt"] },
  Hoodie: { cats: { search: ["Hoodies", "Hooded sweatshirts"], must: ["hoodie", "hooded"] }, commons: ["hoodie", "hooded sweatshirt"], pexels: ["hoodie product"] },
  "Bomber Jacket": { metCommons: ["Flight jacket", "Bomber jacket"], cats: { search: ["Bomber jackets", "Flight jackets"], must: ["bomber jacket", "flight jacket"] }, met: { q: "flight jacket", names: ["jacket"] }, commons: ["bomber jacket", "flight jacket"], pexels: ["bomber jacket"] },
  "Cargo Pants": { cats: { search: ["Cargo pants", "Cargo trousers"], must: ["cargo"] }, commons: ["cargo pants", "cargo trousers"], pexels: ["cargo pants"] },
  "High-Top Sneakers": { metCommons: ["Sneakers"], cats: { search: ["High-top sneakers", "Sneakers"], must: ["sneaker", "high-top"] }, met: { q: "sneakers", names: ["sneakers", "shoes", "basketball shoes"] }, commons: ["high-top sneakers", "high top shoes"], pexels: ["high top sneakers"] },

  // ───── Classical Europe ─────
  "Regency Gown": { metCommons: ["Dress"], cats: { search: ["1810s fashion", "Regency fashion", "1800s fashion"], must: ["1800s", "1810s", "regency"] }, commons: ["Regency dress", "1810s gown", "Regency era gown museum", "1800s dress museum"], pexels: ["regency dress"] },
  "Crinoline Ball Gown": { metCommons: ["Ball gown", "Evening dress"], cats: { search: ["Crinoline dresses", "1860s fashion"], must: ["crinoline", "1850s", "1860s"] }, cma: ["dress"], met: { q: "ball gown 1860", names: ["ball gown", "evening dress", "dress"] }, commons: ["crinoline dress", "crinoline gown"], pexels: ["ball gown"] },
  "Robe à la Française": { metCommons: ["Robe à la Française", "Robe a la Francaise"], cats: { search: ["Robe à la française"], must: ["robe à la française", "robe a la francaise"] }, cma: ["robe a la francaise"], met: { q: "robe a la francaise", names: ["robe à la française", "robe a la francaise", "dress"] }, commons: ["robe à la française"] },
  "Victorian Bustle Gown": { metCommons: ["Afternoon dress", "Visiting dress", "Evening dress"], cats: { search: ["Bustle dresses", "1880s fashion"], must: ["bustle", "1870s", "1880s"] }, met: { q: "bustle dress 1880", names: ["dress", "ensemble", "afternoon dress"] }, commons: ["bustle dress", "Victorian bustle gown"] },
  "Empire-Waist Dress": { metCommons: ["Dress"], cats: { search: ["Empire silhouette", "1800s fashion"], must: ["empire", "1800s"] }, commons: ["empire waist dress", "1810s dress museum", "empire gown", "Regency dress museum"], pexels: ["empire waist dress"] },
  "Frock Coat": { metCommons: ["Frock coat"], cats: { search: ["Frock coats"], must: ["frock coat"] }, met: { q: "frock coat", names: ["frock coat", "coat"] }, commons: ["frock coat"] },
  Doublet: { metCommons: ["Doublet"], cats: { search: ["Doublets"], must: ["doublet"] }, cma: ["doublet"], met: { q: "doublet", names: ["doublet"] }, commons: ["doublet garment", "doublet 17th century"] },
  Waistcoat: { metCommons: ["Waistcoat", "Vest"], cats: { search: ["Waistcoats"], must: ["waistcoat"] }, cma: ["waistcoat"], met: { q: "waistcoat", names: ["waistcoat", "vest"] }, commons: ["waistcoat 18th century", "embroidered waistcoat"], pexels: ["waistcoat"] },
  Tailcoat: { metCommons: ["Tailcoat", "Dress coat"], cats: { search: ["Tailcoats"], must: ["tailcoat", "tail coat"] }, met: { q: "tailcoat", names: ["tailcoat", "coat", "dress coat"] }, commons: ["tailcoat", "tail coat"] },
  Redingote: { metCommons: ["Redingote"], cats: { search: ["Redingotes"], must: ["redingote"] }, met: { q: "redingote", names: ["redingote", "coat"] }, commons: ["redingote"] },
  "Corset Bodice": { metCommons: ["Corset"], cats: { search: ["Corsets"], must: ["corset"] }, cma: ["corset"], met: { q: "corset", names: ["corset"] }, commons: ["corset 19th century", "Victorian corset"], pexels: ["corset"] },
  Stays: { metCommons: ["Stays"], cats: { search: ["Stays (corsetry)", "Stays"], must: ["stays"] }, cma: ["stays"], met: { q: "stays", names: ["stays", "corset"] }, commons: ["18th century stays"] },
  Chemise: { metCommons: ["Chemise"], cats: { search: ["Chemise dresses", "Chemise à la reine"], must: ["chemise"] }, commons: ["chemise a la reine", "1790s chemise dress", "chemise dress museum", "muslin chemise gown"] },
  "Opera Cloak": { metCommons: ["Evening cape", "Opera cloak", "Cape"], cats: { search: ["Opera cloaks", "Evening capes", "Capes (garment)"], must: ["cloak", "cape"], not: ["cape town", "cape cod", "cape verde"] }, met: { q: "evening cape", names: ["cape", "cloak", "evening cape", "opera cloak", "evening wrap"] }, commons: ["opera cloak", "evening cape"] },
  "Military Pelisse": { metCommons: ["Pelisse"], cats: { search: ["Pelisses"], must: ["pelisse"] }, met: { q: "pelisse", names: ["pelisse"] }, commons: ["pelisse"] },
  "Hussar Jacket": { metCommons: ["Dolman"], cats: { search: ["Hussar uniforms", "Dolmans"], must: ["hussar", "dolman"] }, commons: ["hussar dolman", "hussar jacket", "hussar pelisse uniform", "hussar uniform museum"] },
  "Inverness Cape": { metCommons: ["Inverness cape"], cats: { search: ["Inverness capes", "Inverness coats"], must: ["inverness cape", "inverness coat"] }, commons: ["Inverness coat", "caped overcoat", "Victorian cape coat", "Inverness cape coat"] },
  "Tricorne Hat": { metCommons: ["Tricorne", "Cocked hat"], cats: { search: ["Tricornes", "Tricorne hats"], must: ["tricorn"] }, met: { q: "tricorne", names: ["tricorne", "hat", "cocked hat"] }, commons: ["tricorne hat", "tricorn"] },
  "Poke Bonnet": { metCommons: ["Bonnet"], cats: { search: ["Poke bonnets", "Bonnets"], must: ["bonnet"], not: ["car", "vehicle"] }, cma: ["bonnet"], commons: ["poke bonnet", "1830s bonnet", "straw bonnet 19th century", "Regency bonnet"] },
  "Top Hat": { metCommons: ["Top hat"], cats: { search: ["Top hats"], must: ["top hat"], not: ["people", "wearing"] }, met: { q: "top hat", names: ["top hat", "hat"] }, commons: ["top hat"], pexels: ["top hat"] },
  Cravat: { metCommons: ["Cravat"], cats: { search: ["Cravats"], must: ["cravat"] }, met: { q: "cravat", names: ["cravat", "neckcloth", "necktie"] }, commons: ["cravat", "ascot tie"] },
  "Buckle Shoes": { metCommons: ["Shoes"], cats: { search: ["18th-century shoes", "Shoes in museums"], must: ["18th-century shoes", "18th century shoes", "shoes in museums"] }, cma: ["shoes"], commons: ["18th century shoes", "buckled shoes museum", "Georgian shoes buckle", "shoe with buckle 1780"] },
  "Riding Boots": { metCommons: ["Riding boots", "Boots"], cats: { search: ["Riding boots"], must: ["riding boot"] }, met: { q: "riding boots", names: ["boots", "riding boots"] }, commons: ["riding boots", "equestrian boots"], pexels: ["riding boots"] },
};

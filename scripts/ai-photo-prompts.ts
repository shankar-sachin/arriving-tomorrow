/**
 * Build the AI product-photo job list: one studio photo per archetype × colour family.
 *
 *   npm run photos:ai-jobs      → writes scripts/ai-photo-jobs.json
 *
 * scripts/generate_photos.py (run on a Mac with FLUX.1-schnell) reads that file. Prompts describe
 * each garment accurately and always ask for an empty studio display (dress form, ghost mannequin,
 * or stand) so no people are generated.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { REGIONS } from "../src/catalog/taxonomy";
import type { ColorFamily, Silhouette } from "../src/catalog/types";
import { slug } from "./fetch-photos";

/** Accurate one-line descriptions, so the model draws the right garment. */
export const HINTS: Record<string, string> = {
  // India
  "Banarasi Saree": "Banarasi silk saree with dense gold zari brocade, an ornate woven border and a richly patterned pallu",
  "Kanjeevaram Saree": "Kanjeevaram (Kanchipuram) heavy silk saree with a wide contrasting temple-motif border in gold zari",
  "Chiffon Saree": "lightweight sheer chiffon saree with a delicate embroidered border, flowing pleats and pallu",
  "Bandhani Saree": "Bandhani tie-dye saree covered in tiny resist-dyed dots arranged in intricate patterns",
  "Paithani Saree": "Paithani silk saree with a peacock-motif pallu and a broad gold zari border",
  "Lehenga Choli": "lehenga choli: a full flared embroidered ankle-length skirt, a short fitted blouse and a matching dupatta",
  "Bridal Lehenga": "heavily embellished bridal lehenga with dense zardozi embroidery, a voluminous flared skirt, fitted blouse and veil-like dupatta",
  "Sharara Set": "sharara set: a long kurti over wide flared palazzo-style sharara trousers, with a dupatta",
  Ghagra: "Rajasthani ghagra choli: a mirror-work embroidered flared skirt with a short backless blouse",
  Kurta: "classic knee-length cotton kurta tunic with a mandarin collar and a button placket",
  Anarkali: "floor-length Anarkali suit with a fitted bodice flaring into a frock-style skirt, with churidar and dupatta",
  Kurti: "hip-length printed cotton kurti tunic with three-quarter sleeves",
  "Pathani Suit": "Pathani suit: a long loose kurta with a collar and side slits over loose salwar trousers",
  "Salwar Kameez": "salwar kameez: a knee-length kameez tunic over loose gathered salwar trousers, with a dupatta",
  Sherwani: "men's wedding sherwani: a long knee-length embroidered coat with a mandarin collar and buttons, over churidar trousers",
  "Nehru Jacket": "sleeveless men's Nehru jacket (bandi) with a mandarin collar and a single row of buttons",
  Bandhgala: "men's bandhgala (Jodhpuri) suit jacket with a closed high mandarin collar and fitted cut",
  "Dhoti Pants": "draped dhoti trousers with deep pleats, loose and gathered at the front",
  Achkan: "men's achkan: a knee-length fitted coat with a high collar and a row of decorative buttons",
  Dupatta: "long rectangular dupatta stole with embroidered borders and tasselled ends",
  Mojari: "pair of handcrafted mojari (jutti) flat shoes with curled pointed toes and rich embroidery",
  "Pagdi Turban": "tied Rajasthani pagdi turban with neat wrapped folds and a trailing tail",
  "Kolhapuri Chappal": "pair of handmade Kolhapuri leather sandals with a toe ring and braided straps",
  // America
  "Denim Jacket": "classic trucker-style denim jacket with button-flap chest pockets and contrast stitching",
  "Straight-Leg Jeans": "pair of straight-leg five-pocket jeans",
  Overalls: "bib overalls with adjustable shoulder straps, a chest pocket and metal buckles",
  "Denim Skirt": "knee-length A-line denim skirt with a button front",
  "Pearl-Snap Shirt": "Western pearl-snap shirt with pointed yokes, flap pockets and pearlescent snap buttons",
  "Prairie Dress": "ankle-length prairie dress with puffed sleeves, a high ruffled collar and a tiered skirt",
  "Cowboy Boots": "pair of tall Western cowboy boots with a pointed toe, stacked heel and decorative stitched shafts",
  "Cowboy Hat": "Western cowboy hat with a creased crown, curled wide brim and a hat band",
  "Fringe Jacket": "suede Western jacket with long fringe across the yoke and sleeves",
  "Varsity Jacket": "varsity letterman jacket with a wool body, leather sleeves and striped ribbed cuffs and collar, no lettering",
  "Letterman Sweater": "chunky knit letterman cardigan sweater with a shawl collar and striped sleeve, no lettering",
  "Pleated Skirt": "knee-length knife-pleated skirt",
  "Rugby Shirt": "long-sleeve rugby shirt with bold horizontal stripes and a white contrast collar",
  "Poodle Skirt": "1950s felt poodle skirt: a full circle skirt with an applique poodle",
  "Swing Dress": "1950s swing dress with a fitted bodice, cinched waist and full circle skirt",
  "Bowling Shirt": "1950s bowling shirt with a camp collar, short sleeves and contrasting vertical panels",
  "Flannel Shirt": "plaid flannel button-up shirt with chest pockets",
  "Hawaiian Shirt": "short-sleeve Hawaiian aloha shirt with a camp collar and a bold tropical floral print",
  Hoodie: "pullover hoodie sweatshirt with a kangaroo pocket and drawstring hood, no logo",
  "Bomber Jacket": "bomber flight jacket with ribbed cuffs, waistband and collar and a front zip",
  "Cargo Pants": "relaxed cargo trousers with large flap side pockets",
  "High-Top Sneakers": "pair of canvas high-top sneakers with white rubber soles and laces, no logo",
  // Classical Europe
  "Regency Gown": "Regency-era (1810s) high-waisted muslin gown with short puffed sleeves and a straight column skirt",
  "Crinoline Ball Gown": "1860s crinoline ball gown with an off-the-shoulder bodice and an enormous bell-shaped hooped skirt",
  "Robe à la Française": "18th-century robe à la française with Watteau back pleats, a stomacher and wide pannier hips",
  "Victorian Bustle Gown": "1880s Victorian bustle gown with a fitted bodice and a dramatic draped bustle at the back",
  "Empire-Waist Dress": "empire-waist gown with a high waistline just below the bust and a long flowing skirt",
  "Frock Coat": "19th-century men's knee-length frock coat with a fitted waist and lapels",
  Doublet: "Renaissance doublet with a padded fitted front, slashed decorative sleeves and a peplum",
  Waistcoat: "18th-century men's embroidered silk waistcoat with covered buttons and pocket flaps",
  Tailcoat: "Regency-era men's tailcoat cut away at the front with long tails at the back",
  Redingote: "18th-century women's redingote riding coat-dress with wide lapels and a long skirt",
  "Corset Bodice": "Victorian boned corset with front busk and back lacing",
  Stays: "18th-century boned stays (corset) with shoulder straps and tabbed waist",
  Chemise: "white linen chemise dress with a drawstring neckline, flowing sleeves and a sash",
  "Opera Cloak": "full-length 19th-century opera cloak with a hood, satin lining and ornate clasp",
  "Military Pelisse": "Regency-era pelisse coat-dress with military frogging and braid across the bodice",
  "Hussar Jacket": "hussar dolman jacket with rows of horizontal braided frogging and ball buttons",
  "Inverness Cape": "Victorian Inverness coat with a sleeveless body and an attached shoulder cape, in wool tweed",
  "Tricorne Hat": "18th-century tricorne hat with the brim turned up on three sides and gold trim",
  "Poke Bonnet": "1830s poke bonnet with a deep projecting brim, ribbon ties and silk flowers",
  "Top Hat": "Victorian silk top hat with a tall crown and a narrow curled brim",
  Cravat: "Regency silk cravat neckcloth tied in an elegant knot",
  "Buckle Shoes": "pair of 18th-century leather shoes with large square silver buckles and a low heel",
  "Riding Boots": "pair of tall knee-high leather riding boots",
};

/** One evocative colour per family; the family is what products are matched on. */
export const FAMILY_COLOUR: Record<ColorFamily, string> = {
  red: "rich crimson red",
  pink: "vivid rani pink",
  orange: "warm saffron orange",
  yellow: "golden marigold yellow",
  green: "deep emerald green",
  blue: "royal blue",
  purple: "deep royal purple",
  neutral: "ivory and champagne",
  black: "black",
};

const DISPLAY: Record<Silhouette, string> = {
  saree: "worn-style drape on a headless dress form: neat front pleats at the waist, the decorated pallu falling over the left shoulder",
  lehenga: "displayed on a headless dress form",
  anarkali: "displayed on a headless dress form",
  tunic: "displayed on an invisible ghost mannequin",
  shirt: "displayed on an invisible ghost mannequin",
  jacket: "displayed on an invisible ghost mannequin",
  coat: "displayed on an invisible ghost mannequin, full length",
  vest: "displayed on an invisible ghost mannequin",
  dress: "displayed on a headless dress form",
  ballgown: "displayed on a headless dress form, full skirt visible",
  pants: "displayed on an invisible ghost mannequin, full length",
  skirt: "displayed on a headless dress form",
  corset: "displayed on a headless dress form",
  hat: "on a simple display stand, three-quarter view",
  boots: "standing upright, three-quarter view",
  shoes: "three-quarter view, side by side",
  scarf: "artfully draped over a simple display stand",
};

const STYLE =
  "Soft even studio lighting, seamless warm off-white backdrop, centered, full length: the entire item from top to hem in frame with space around it, " +
  "crisp fabric texture, photorealistic catalogue photography. Empty display, nobody wearing it. " +
  "The display is plain matte white and completely bare apart from the garment. No text, no logos.";

export interface AiJob {
  /** Photo key, also the file stem. */
  key: string;
  archetype: string;
  family: ColorFamily;
  prompt: string;
  seed: number;
  /** Output path relative to the repo root. */
  out: string;
}

const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7) % 2_000_000_000;

export function buildJobs(): AiJob[] {
  const jobs: AiJob[] = [];
  for (const region of REGIONS)
    for (const category of region.categories)
      for (const arch of category.archetypes)
        for (const [family, colour] of Object.entries(FAMILY_COLOUR) as Array<[ColorFamily, string]>) {
          const key = `ai:${slug(arch.name)}--${family}`;
          jobs.push({
            key,
            archetype: arch.name,
            family,
            seed: hash(key),
            out: `public/photos/ai/${slug(arch.name)}/${family}.webp`,
            prompt: `Professional e-commerce product photograph of a ${colour} ${HINTS[arch.name]}, ${DISPLAY[arch.silhouette]}. ${STYLE}`,
          });
        }
  return jobs;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const jobs = buildJobs();
  const out = join(dirname(fileURLToPath(import.meta.url)), "ai-photo-jobs.json");
  writeFileSync(out, JSON.stringify(jobs, null, 1) + "\n");
  console.log(`${jobs.length} jobs → scripts/ai-photo-jobs.json`);
}

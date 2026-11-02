export const locales = ["sq", "en", "it", "tr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "sq";
export const localeCookie = "bluzeta-locale";

export const categoryTree = {
  clothes: [
    "tops",
    "shirts",
    "dresses",
    "skirts",
    "jeans",
    "pants",
    "outerwear",
    "shoes",
    "bags",
    "sportwear",
    "kids",
    "underwear",
  ],
  computers: [
    "laptops",
    "desktops",
    "monitors",
    "keyboards",
    "mice",
    "components",
    "printers",
    "storage",
    "networking",
  ],
  phones: [
    "smartphones",
    "tablets",
    "smartwatches",
    "headphones",
    "chargers",
    "cases",
  ],
  books: [
    "fiction",
    "nonfiction",
    "textbooks",
    "comics",
    "children",
    "languages",
    "magazines",
  ],
  furniture: [
    "sofas",
    "tables",
    "chairs",
    "beds",
    "storage",
    "desks",
    "lighting",
    "outdoor",
  ],
  accessories: [
    "jewelry",
    "watches",
    "sunglasses",
    "hats",
    "belts",
    "wallets",
    "hair",
    "other",
  ],
  cards: ["pokemon", "yugioh", "magic", "sport_cards", "other"],
  sports: ["fitness", "football", "cycling", "outdoor", "racket", "water"],
  home: ["kitchen", "appliances", "decor", "garden", "textiles"],
  music: ["guitars", "keys", "drums", "audio", "vinyl", "dj"],
  toys: [
    "video_games",
    "board_games",
    "figures",
    "construction",
    "dolls",
    "baby",
  ],
} as const;

export const categories = [
  "clothes",
  "computers",
  "phones",
  "books",
  "furniture",
  "accessories",
  "cards",
  "sports",
  "home",
  "music",
  "toys",
] as const;
export type Category = (typeof categories)[number];
export type Subcategory<C extends Category = Category> =
  (typeof categoryTree)[C][number];

export const colors = [
  "black",
  "white",
  "gray",
  "beige",
  "brown",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "gold",
  "silver",
  "multicolor",
] as const;
export type Color = (typeof colors)[number];

export const colorSwatches: Record<Color, string> = {
  black: "#111218",
  white: "#f6f1e8",
  gray: "#8a8680",
  beige: "#d9c7a5",
  brown: "#6b4423",
  red: "#c43c3c",
  orange: "#e06a2c",
  yellow: "#e2b53a",
  green: "#3d8f5b",
  blue: "#1e4eff",
  purple: "#6f4db0",
  pink: "#e07aa8",
  gold: "#c6a34a",
  silver: "#c5c8ce",
  multicolor:
    "conic-gradient(from 90deg, #c43c3c, #e2b53a, #3d8f5b, #1e4eff, #6f4db0, #c43c3c)",
};

export const genders = ["women", "men", "unisex", "kids"] as const;
export type Gender = (typeof genders)[number];

export const conditions = ["new", "like_new", "used", "worn"] as const;
export type Condition = (typeof conditions)[number];

export const sizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "One size",
] as const;

export const legacyCategoryMap: Record<
  string,
  { category: Category; subcategory: string }
> = {
  tops: { category: "clothes", subcategory: "tops" },
  shirts: { category: "clothes", subcategory: "shirts" },
  dresses: { category: "clothes", subcategory: "dresses" },
  skirts: { category: "clothes", subcategory: "skirts" },
  jeans: { category: "clothes", subcategory: "jeans" },
  pants: { category: "clothes", subcategory: "pants" },
  outerwear: { category: "clothes", subcategory: "outerwear" },
  shoes: { category: "clothes", subcategory: "shoes" },
  bags: { category: "clothes", subcategory: "bags" },
  accessories: { category: "accessories", subcategory: "other" },
  sport: { category: "clothes", subcategory: "sportwear" },
  kids: { category: "clothes", subcategory: "kids" },
};

export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value);
}

export function isColor(value: string): value is Color {
  return (colors as readonly string[]).includes(value);
}

export function isCondition(value: string): value is Condition {
  return (conditions as readonly string[]).includes(value);
}

export function getSubcategories(category: string): readonly string[] {
  if (!isCategory(category)) return [];
  return categoryTree[category];
}

export function isSubcategory(category: string, subcategory: string) {
  return getSubcategories(category).includes(subcategory);
}

export function normalizeTaxonomy(category: string, subcategory?: string | null) {
  if (isCategory(category)) {
    return {
      category,
      subcategory: subcategory || getSubcategories(category)[0] || "",
    };
  }
  const mapped = legacyCategoryMap[category];
  if (mapped) return mapped;
  return { category, subcategory: subcategory || "" };
}

export const neighborhoods = [
  { id: "qender", lat: 41.3275, lng: 19.8187 },
  { id: "blloku", lat: 41.3218, lng: 19.8165 },
  { id: "komuna", lat: 41.3182, lng: 19.8042 },
  { id: "dhjetori", lat: 41.327, lng: 19.801 },
  { id: "pazari", lat: 41.3306, lng: 19.8234 },
  { id: "lapraka", lat: 41.3412, lng: 19.794 },
  { id: "donbosko", lat: 41.3378, lng: 19.8082 },
  { id: "astir", lat: 41.3348, lng: 19.7754 },
  { id: "kombinat", lat: 41.3072, lng: 19.7631 },
  { id: "yzberisht", lat: 41.321, lng: 19.7704 },
  { id: "kashar", lat: 41.346, lng: 19.721 },
  { id: "kinostudio", lat: 41.3424, lng: 19.835 },
  { id: "alidemi", lat: 41.3252, lng: 19.8452 },
  { id: "allias", lat: 41.3354, lng: 19.8506 },
  { id: "sauk", lat: 41.3004, lng: 19.8508 },
  { id: "student", lat: 41.3142, lng: 19.8044 },
  { id: "fresku", lat: 41.355, lng: 19.86 },
  { id: "selita", lat: 41.3102, lng: 19.7904 },
  { id: "liqezi", lat: 41.3156, lng: 19.849 },
  { id: "medrese", lat: 41.3184, lng: 19.8358 },
] as const;

export type NeighborhoodId = (typeof neighborhoods)[number]["id"];

export function getNeighborhood(id: string) {
  return neighborhoods.find((n) => n.id === id) ?? neighborhoods[0];
}

export const reportReasons = [
  "spam",
  "prohibited",
  "fake",
  "offensive",
  "other",
] as const;

export type ReportReason = (typeof reportReasons)[number];

export function isReportReason(value: string): value is ReportReason {
  return reportReasons.includes(value as ReportReason);
}

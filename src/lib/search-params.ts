import {
  getSubcategories,
  isCategory,
  isColor,
  isCondition,
  isSubcategory,
} from "@/lib/constants";

export type SortId = "newest" | "cheapest" | "liked" | "near";

export type ListingFilters = {
  q?: string;
  categories: string[];
  subcategories: string[];
  colors: string[];
  conditions: string[];
  minPrice?: number;
  maxPrice?: number;
  sort: SortId;
};

export const emptyFilters: ListingFilters = {
  categories: [],
  subcategories: [],
  colors: [],
  conditions: [],
  sort: "newest",
};

type ParamValue = string | string[] | undefined;
type SearchLike = {
  get: (name: string) => string | null;
  toString?: () => string;
};

export function parseList(value: ParamValue) {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return [...new Set(raw.split(",").map((part) => part.trim()).filter(Boolean))];
}

function first(value: ParamValue) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePrice(value: ParamValue) {
  const n = Number(first(value));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

export function filtersFromParams(
  params: Record<string, ParamValue> | SearchLike,
): ListingFilters {
  const read = (key: string): ParamValue => {
    if ("get" in params && typeof params.get === "function") {
      return params.get(key) ?? undefined;
    }
    return (params as Record<string, ParamValue>)[key];
  };

  const categoryValues = parseList(read("category")).filter(isCategory);
  const subcategoryValues = parseList(read("subcategory")).filter((id) =>
    categoryValues.length
      ? categoryValues.some((category) => isSubcategory(category, id))
      : true,
  );
  const colorValues = parseList(read("color")).filter(isColor);
  const conditionValues = parseList(read("condition")).filter(isCondition);
  const sortRaw = first(read("sort"));
  const sort: SortId =
    sortRaw === "cheapest" ||
    sortRaw === "liked" ||
    sortRaw === "near" ||
    sortRaw === "newest"
      ? sortRaw
      : "newest";
  const q = first(read("q"))?.trim() || undefined;
  const minPrice = parsePrice(read("minPrice"));
  const maxPrice = parsePrice(read("maxPrice"));

  return {
    q,
    categories: categoryValues,
    subcategories: subcategoryValues,
    colors: colorValues,
    conditions: conditionValues,
    minPrice,
    maxPrice:
      minPrice != null && maxPrice != null && maxPrice < minPrice
        ? minPrice
        : maxPrice,
    sort,
  };
}

export function filtersToParams(filters: ListingFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categories.length) {
    params.set("category", filters.categories.join(","));
  }
  if (filters.subcategories.length) {
    params.set("subcategory", filters.subcategories.join(","));
  }
  if (filters.colors.length) params.set("color", filters.colors.join(","));
  if (filters.conditions.length) {
    params.set("condition", filters.conditions.join(","));
  }
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  return params;
}

export function browseHref(filters: ListingFilters) {
  const q = filtersToParams(filters).toString();
  return q ? `/browse?${q}` : "/browse";
}

export function countActiveFilters(filters: ListingFilters) {
  return (
    filters.categories.length +
    filters.subcategories.length +
    filters.colors.length +
    filters.conditions.length +
    (filters.minPrice != null ? 1 : 0) +
    (filters.maxPrice != null ? 1 : 0)
  );
}

export function selectedSubcategoriesFor(
  selectedCategories: string[],
  subcategories: string[],
) {
  if (selectedCategories.length === 0) return [];
  const allowed = new Set(
    selectedCategories.flatMap((category) => [...getSubcategories(category)]),
  );
  return subcategories.filter((id) => allowed.has(id));
}

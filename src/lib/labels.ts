import { isCategory, isColor, normalizeTaxonomy } from "@/lib/constants";
import type { Messages } from "@/lib/i18n/messages";

export function categoryLabel(t: Messages, category: string) {
  const { category: id } = normalizeTaxonomy(category);
  if (isCategory(id)) return t.categories[id];
  return category;
}

export function subcategoryLabel(
  t: Messages,
  category: string,
  subcategory: string,
) {
  const normalized = normalizeTaxonomy(category, subcategory);
  if (!isCategory(normalized.category)) return subcategory;
  const group = t.subcategories[normalized.category];
  const id = normalized.subcategory as keyof typeof group;
  return group[id] ?? subcategory;
}

export function colorLabel(t: Messages, color: string) {
  if (isColor(color)) return t.colors[color];
  return color;
}

export function listingMeta(
  t: Messages,
  item: {
    category: string;
    subcategory: string;
    color?: string;
  },
) {
  const category = categoryLabel(t, item.category);
  const subcategory = subcategoryLabel(t, item.category, item.subcategory);
  return {
    category,
    subcategory,
    color: item.color ? colorLabel(t, item.color) : "",
  };
}

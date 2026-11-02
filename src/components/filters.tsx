"use client";

import { Funnel } from "lucide-react";
import Link from "next/link";
import { isSubcategory } from "@/lib/constants";
import { categoryLabel, colorLabel, subcategoryLabel } from "@/lib/labels";
import type { Messages } from "@/lib/i18n/messages";
import { OPEN_FILTERS_EVENT } from "@/lib/filter-events";
import {
  browseHref,
  countActiveFilters,
  selectedSubcategoriesFor,
  type ListingFilters,
} from "@/lib/search-params";

export function Filters({
  t,
  current,
}: {
  t: Messages;
  current: ListingFilters;
}) {
  const active = countActiveFilters(current);
  const sorts = [
    ["newest", t.newest],
    ["cheapest", t.cheapest],
    ["liked", t.mostLiked],
    ["near", t.nearest],
  ] as const;

  const chips = [
    ...current.categories.map((id) => {
      const categories = current.categories.filter((item) => item !== id);
      return {
        key: `c-${id}`,
        label: categoryLabel(t, id),
        href: browseHref({
          ...current,
          categories,
          subcategories: selectedSubcategoriesFor(
            categories,
            current.subcategories,
          ),
        }),
      };
    }),
    ...current.subcategories.map((id) => {
      const category =
        current.categories.find((item) => isSubcategory(item, id)) ??
        current.categories[0];
      return {
        key: `s-${id}`,
        label: category ? subcategoryLabel(t, category, id) : id,
        href: browseHref({
          ...current,
          subcategories: current.subcategories.filter((item) => item !== id),
        }),
      };
    }),
    ...current.colors.map((id) => ({
      key: `color-${id}`,
      label: colorLabel(t, id),
      href: browseHref({
        ...current,
        colors: current.colors.filter((item) => item !== id),
      }),
    })),
    ...current.conditions.map((id) => ({
      key: `cond-${id}`,
      label: t.conditions[id as keyof typeof t.conditions] ?? id,
      href: browseHref({
        ...current,
        conditions: current.conditions.filter((item) => item !== id),
      }),
    })),
    ...(current.minPrice != null
      ? [
          {
            key: "min",
            label: `${t.minPrice} ${current.minPrice}`,
            href: browseHref({ ...current, minPrice: undefined }),
          },
        ]
      : []),
    ...(current.maxPrice != null
      ? [
          {
            key: "max",
            label: `${t.maxPrice} ${current.maxPrice}`,
            href: browseHref({ ...current, maxPrice: undefined }),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="chip gap-1.5"
          data-active={active > 0}
          onClick={() =>
            window.dispatchEvent(new Event(OPEN_FILTERS_EVENT))
          }
        >
          <Funnel size={14} strokeWidth={2} />
          {t.filters}
          {active > 0 ? ` · ${active}` : ""}
        </button>
        {sorts.map(([id, label]) => (
          <Link
            key={id}
            href={browseHref({ ...current, sort: id })}
            className="chip"
            data-active={current.sort === id}
          >
            {label}
          </Link>
        ))}
      </div>
      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Link key={chip.key} href={chip.href} className="chip" data-active>
              {chip.label}
              <span aria-hidden className="ml-1 text-muted">
                ×
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

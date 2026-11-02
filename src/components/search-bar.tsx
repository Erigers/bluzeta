"use client";

import { Funnel } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FilterSheet } from "@/components/filter-sheet";
import { OPEN_FILTERS_EVENT } from "@/lib/filter-events";
import { useT } from "@/components/i18n-provider";
import {
  countActiveFilters,
  filtersFromParams,
  filtersToParams,
} from "@/lib/search-params";

export function SearchBar() {
  const { t } = useT();
  const searchParams = useSearchParams();
  const current = useMemo(
    () => filtersFromParams(searchParams),
    [searchParams],
  );
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(current.q ?? "");
  const active = countActiveFilters(current);
  const hidden = filtersToParams({ ...current, q: undefined });

  useEffect(() => {
    setQ(current.q ?? "");
  }, [current.q]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_FILTERS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_FILTERS_EVENT, onOpen);
  }, []);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <form action="/browse" className="min-w-0 flex-1">
        {Array.from(hidden.entries()).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <input
          name="q"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="w-full rounded-full border border-line bg-card px-4 py-2.5 text-sm outline-none focus:border-blue"
        />
      </form>
      <button
        type="button"
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-card"
        aria-label={t.openFilters}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Funnel size={18} strokeWidth={1.75} />
        {active > 0 ? (
          <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-tangerine px-1 text-[10px] font-semibold text-white">
            {active}
          </span>
        ) : null}
      </button>
      <FilterSheet
        open={open}
        onClose={() => setOpen(false)}
        current={{ ...current, q: q.trim() || undefined }}
      />
    </div>
  );
}

export function SearchBarFallback() {
  const { t } = useT();
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="min-w-0 flex-1">
        <input
          placeholder={t.searchPlaceholder}
          className="w-full rounded-full border border-line bg-card px-4 py-2.5 text-sm outline-none"
          disabled
        />
      </div>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-card">
        <Funnel size={18} strokeWidth={1.75} />
      </span>
    </div>
  );
}

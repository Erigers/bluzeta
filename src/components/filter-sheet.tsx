"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/components/i18n-provider";
import {
  categories,
  colors,
  colorSwatches,
  conditions,
  getSubcategories,
  isCategory,
} from "@/lib/constants";
import { categoryLabel, colorLabel, subcategoryLabel } from "@/lib/labels";
import {
  browseHref,
  selectedSubcategoriesFor,
  type ListingFilters,
} from "@/lib/search-params";

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="chip"
      data-active={active}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function FilterSheet({
  open,
  onClose,
  current,
}: {
  open: boolean;
  onClose: () => void;
  current: ListingFilters;
}) {
  const { t } = useT();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [draft, setDraft] = useState(current);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setDraft(current);
  }, [open, current]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  const subcategoryGroups = useMemo(
    () =>
      draft.categories.filter(isCategory).map((category) => ({
        category,
        items: getSubcategories(category),
      })),
    [draft.categories],
  );

  function setCategories(next: string[]) {
    setDraft((prev) => ({
      ...prev,
      categories: next,
      subcategories: selectedSubcategoriesFor(next, prev.subcategories),
    }));
  }

  function apply() {
    router.push(browseHref({ ...draft, q: current.q, sort: current.sort }));
    onClose();
  }

  function clear() {
    setDraft({
      ...current,
      categories: [],
      subcategories: [],
      colors: [],
      conditions: [],
      minPrice: undefined,
      maxPrice: undefined,
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label={t.closeFilters}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-x-0 bottom-0 flex max-h-[92dvh] w-full flex-col rounded-t-3xl border border-line bg-[var(--bg)] shadow-[0_-18px_40px_rgba(16,18,24,0.12)] transition-transform duration-300 ease-out md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:max-h-none md:w-[min(28rem,100%)] md:rounded-none md:border-l md:border-t-0 md:shadow-[-18px_0_40px_rgba(16,18,24,0.12)] [.dark_&]:shadow-[0_-18px_40px_rgba(0,0,0,0.45)] ${
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p
            id={titleId}
            className="font-[family-name:var(--font-display)] text-2xl"
          >
            {t.filters}
          </p>
          <button
            ref={closeRef}
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-line"
            aria-label={t.closeFilters}
            onClick={onClose}
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              {t.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((id) => (
                <Chip
                  key={id}
                  active={draft.categories.includes(id)}
                  onClick={() =>
                    setCategories(toggleValue(draft.categories, id))
                  }
                >
                  {categoryLabel(t, id)}
                </Chip>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              {t.subcategory}
            </h3>
            {subcategoryGroups.length === 0 ? (
              <p className="text-sm text-muted">{t.pickCategoryFirst}</p>
            ) : (
              subcategoryGroups.map((group) => (
                <div key={group.category} className="space-y-2">
                  {draft.categories.length > 1 ? (
                    <p className="text-sm font-medium">
                      {categoryLabel(t, group.category)}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((id) => (
                      <Chip
                        key={`${group.category}-${id}`}
                        active={draft.subcategories.includes(id)}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            subcategories: toggleValue(prev.subcategories, id),
                          }))
                        }
                      >
                        {subcategoryLabel(t, group.category, id)}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              {t.color}
            </h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((id) => (
                <Chip
                  key={id}
                  active={draft.colors.includes(id)}
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      colors: toggleValue(prev.colors, id),
                    }))
                  }
                >
                  <span
                    className="mr-2 inline-block h-3 w-3 rounded-full border border-line"
                    style={{ background: colorSwatches[id] }}
                    aria-hidden
                  />
                  {colorLabel(t, id)}
                </Chip>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              {t.condition}
            </h3>
            <div className="flex flex-wrap gap-2">
              {conditions.map((id) => (
                <Chip
                  key={id}
                  active={draft.conditions.includes(id)}
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      conditions: toggleValue(prev.conditions, id),
                    }))
                  }
                >
                  {t.conditions[id]}
                </Chip>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              {t.price} ({t.lek})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="field">
                <span>{t.minPrice}</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  inputMode="numeric"
                  value={draft.minPrice ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    const amount = Number(value);
                    setDraft((prev) => ({
                      ...prev,
                      minPrice:
                        value === "" || !Number.isFinite(amount)
                          ? undefined
                          : amount,
                    }));
                  }}
                />
              </label>
              <label className="field">
                <span>{t.maxPrice}</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  inputMode="numeric"
                  value={draft.maxPrice ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    const amount = Number(value);
                    setDraft((prev) => ({
                      ...prev,
                      maxPrice:
                        value === "" || !Number.isFinite(amount)
                          ? undefined
                          : amount,
                    }));
                  }}
                />
              </label>
            </div>
          </section>
        </div>

        <div className="flex gap-3 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" className="btn btn-ghost flex-1" onClick={clear}>
            {t.clearFilters}
          </button>
          <button type="button" className="btn btn-tangerine flex-1" onClick={apply}>
            {t.applyFilters}
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

"use client";

import { useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useT } from "@/components/i18n-provider";
import {
  categories,
  colors,
  conditions,
  genders,
  getSubcategories,
  sizes,
} from "@/lib/constants";
import { categoryLabel, colorLabel, subcategoryLabel } from "@/lib/labels";
import { createListingAction } from "@/lib/actions";

export function SellForm() {
  const { t } = useT();
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [category, setCategory] = useState<(typeof categories)[number]>("clothes");
  const subcategories = useMemo(() => getSubcategories(category), [category]);
  const [subcategory, setSubcategory] = useState(subcategories[0] ?? "");
  const isClothes = category === "clothes";

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const uploaded: string[] = [];
    for (const file of Array.from(files).slice(0, 6)) {
      const blob = await upload(`listings/${crypto.randomUUID()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      uploaded.push(blob.url);
    }
    setImages((prev) => [...prev, ...uploaded].slice(0, 6));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (images.length === 0) {
      setError(t.required);
      return;
    }
    setPending(true);
    const form = new FormData(e.currentTarget);
    form.set("images", images.join(","));
    const result = await createListingAction(form);
    if (result?.error) setError(t.errorGeneric);
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <label className="field">
        <span>{t.photos}</span>
        <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {images.map((src) => (
            <img key={src} src={src} alt="" className="h-28 w-full rounded-xl object-cover" />
          ))}
        </div>
      </label>
      <label className="field">
        <span>{t.title}</span>
        <input name="title" required maxLength={80} />
      </label>
      <label className="field">
        <span>{t.description}</span>
        <textarea name="description" required rows={5} maxLength={1200} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field">
          <span>{t.category}</span>
          <select
            name="category"
            required
            value={category}
            onChange={(event) => {
              const next = event.target.value as (typeof categories)[number];
              setCategory(next);
              setSubcategory(getSubcategories(next)[0] ?? "");
            }}
          >
            {categories.map((id) => (
              <option key={id} value={id}>
                {categoryLabel(t, id)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t.subcategory}</span>
          <select
            name="subcategory"
            required
            value={subcategory}
            onChange={(event) => setSubcategory(event.target.value)}
          >
            {subcategories.map((id) => (
              <option key={id} value={id}>
                {subcategoryLabel(t, category, id)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t.color}</span>
          <select name="color" required defaultValue="black">
            {colors.map((id) => (
              <option key={id} value={id}>
                {colorLabel(t, id)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t.condition}</span>
          <select name="condition" required defaultValue="like_new">
            {conditions.map((id) => (
              <option key={id} value={id}>
                {t.conditions[id]}
              </option>
            ))}
          </select>
        </label>
        {isClothes ? (
          <>
            <label className="field">
              <span>{t.gender}</span>
              <select name="gender" required defaultValue="women">
                {genders.map((id) => (
                  <option key={id} value={id}>
                    {t.genders[id]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t.size}</span>
              <select name="size" required defaultValue="M">
                {sizes.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}
      </div>
      <label className="field">
        <span>{t.price} ({t.lek})</span>
        <input name="priceAll" type="number" min="100" step="50" required />
      </label>
      {error ? <p className="text-sm text-tangerine">{error}</p> : null}
      <button className="btn btn-tangerine" disabled={pending}>
        {pending ? t.publishing : t.publish}
      </button>
    </form>
  );
}

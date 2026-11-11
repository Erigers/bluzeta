"use client";

import { useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";
import { FeaturedPhotoEditor } from "@/components/featured-photo-editor";
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
  const [originals, setOriginals] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<(typeof categories)[number]>("clothes");
  const subcategories = useMemo(() => getSubcategories(category), [category]);
  const [subcategory, setSubcategory] = useState(subcategories[0] ?? "");
  const isClothes = category === "clothes";
  const featuredUrl = images[featuredIndex] ?? null;
  const featuredSource = originals[featuredIndex] ?? featuredUrl;

  async function onFiles(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      const room = Math.max(0, 6 - images.length);
      for (const file of Array.from(files).slice(0, room)) {
        const blob = await upload(
          `listings/${crypto.randomUUID()}-${file.name}`,
          file,
          {
            access: "public",
            handleUploadUrl: "/api/upload",
          },
        );
        uploaded.push(blob.url);
      }
      setImages((prev) => {
        const next = [...prev, ...uploaded].slice(0, 6);
        if (prev.length === 0) setFeaturedIndex(0);
        return next;
      });
      setOriginals((prev) => [...prev, ...uploaded].slice(0, 6));
    } catch {
      setError(t.errorGeneric);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setOriginals((prev) => prev.filter((_, i) => i !== index));
    setFeaturedIndex((current) => {
      const nextLength = images.length - 1;
      if (nextLength <= 0) return 0;
      if (index === current) return 0;
      if (index < current) return current - 1;
      return Math.min(current, nextLength - 1);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (images.length === 0) {
      setError(t.required);
      return;
    }
    setPending(true);
    const ordered = [
      images[featuredIndex],
      ...images.filter((_, index) => index !== featuredIndex),
    ].filter(Boolean);
    const form = new FormData(e.currentTarget);
    form.set("images", ordered.join(","));
    const result = await createListingAction(form);
    if (result?.error) setError(t.errorGeneric);
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="field">
        <span>{t.photos}</span>
        <p className="text-sm text-muted">{t.featuredPhotoHint}</p>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading || images.length >= 6}
          onChange={(e) => onFiles(e.target.files)}
        />
        {uploading ? (
          <p className="mt-2 text-sm text-muted">{t.photoUploading}</p>
        ) : null}
        <div className="mt-2 grid grid-cols-3 gap-2">
          {images.map((src, index) => {
            const isFeatured = index === featuredIndex;
            return (
              <div key={`${src}-${index}`} className="relative">
                <button
                  type="button"
                  className={`block w-full overflow-hidden rounded-xl border-2 ${
                    isFeatured ? "border-blue" : "border-transparent"
                  }`}
                  onClick={() => setFeaturedIndex(index)}
                  aria-pressed={isFeatured}
                  aria-label={
                    isFeatured ? t.featuredPhoto : t.setFeaturedPhoto
                  }
                >
                  <img
                    src={src}
                    alt=""
                    className="h-28 w-full object-cover"
                  />
                </button>
                {isFeatured ? (
                  <span className="absolute top-2 left-2 rounded-full bg-blue px-2 py-0.5 text-[11px] font-semibold text-white">
                    {t.featuredPhoto}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-card/90 text-sm"
                  aria-label={t.removePhoto}
                  onClick={() => removeImage(index)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {featuredSource ? (
        <FeaturedPhotoEditor
          sourceUrl={featuredSource}
          onApplied={(url) => {
            setImages((prev) =>
              prev.map((src, index) =>
                index === featuredIndex ? url : src,
              ),
            );
          }}
        />
      ) : null}

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
        <span>
          {t.price} ({t.lek})
        </span>
        <input name="priceAll" type="number" min="100" step="50" required />
      </label>
      {error ? <p className="text-sm text-tangerine">{error}</p> : null}
      <button className="btn btn-tangerine" disabled={pending || uploading}>
        {pending ? t.publishing : t.publish}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { useT } from "@/components/i18n-provider";
import {
  compositeOnColor,
  fetchImageBlob,
  removePhotoBackground,
  sceneColor,
  type ScenePreset,
} from "@/lib/photo-edit";

type Props = {
  sourceUrl: string;
  onApplied: (url: string) => void;
};

export function FeaturedPhotoEditor({ sourceUrl, onApplied }: Props) {
  const { t } = useT();
  const [pending, start] = useTransition();
  const [preset, setPreset] = useState<ScenePreset>("white");
  const [customColor, setCustomColor] = useState("#dbe4ff");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const cutoutRef = useRef<Blob | null>(null);
  const cutoutForRef = useRef<string | null>(null);

  useEffect(() => {
    cutoutRef.current = null;
    cutoutForRef.current = null;
    setPreviewUrl(null);
    setError("");
    setProgress("");
  }, [sourceUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function applyScene() {
    setError("");
    start(async () => {
      try {
        setProgress(t.photoEditPreparing);
        let cutout = cutoutRef.current;
        if (!cutout || cutoutForRef.current !== sourceUrl) {
          setProgress(t.photoEditRemoving);
          const original = await fetchImageBlob(sourceUrl);
          cutout = await removePhotoBackground(original);
          cutoutRef.current = cutout;
          cutoutForRef.current = sourceUrl;
        }
        if (!cutout) throw new Error("cutout_missing");
        setProgress(t.photoEditCompositing);
        const composed = await compositeOnColor(
          cutout,
          sceneColor(preset, customColor),
        );
        const localPreview = URL.createObjectURL(composed);
        setPreviewUrl((prev) => {
          if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
          return localPreview;
        });
        setProgress(t.photoEditUploading);
        const uploaded = await upload(
          `listings/${crypto.randomUUID()}-featured.jpg`,
          composed,
          {
            access: "public",
            handleUploadUrl: "/api/upload",
            contentType: "image/jpeg",
          },
        );
        onApplied(uploaded.url);
        setProgress("");
      } catch {
        setError(t.photoEditError);
        setProgress("");
      }
    });
  }

  return (
    <div className="mt-4 grid gap-3 rounded-2xl border border-line bg-card p-4">
      <div>
        <p className="font-medium">{t.photoEditTitle}</p>
        <p className="mt-1 text-sm text-muted">{t.photoEditBody}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["white", t.photoEditWhite],
            ["beige", t.photoEditBeige],
            ["custom", t.photoEditCustom],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="chip"
            data-active={preset === id ? "true" : "false"}
            onClick={() => setPreset(id)}
            disabled={pending}
          >
            <span
              className="size-3 rounded-full border border-line"
              style={{
                background:
                  id === "custom" ? customColor : sceneColor(id, customColor),
              }}
              aria-hidden
            />
            {label}
          </button>
        ))}
      </div>

      {preset === "custom" ? (
        <label className="field max-w-xs">
          <span>{t.photoEditPickColor}</span>
          <input
            type="color"
            value={customColor}
            onChange={(event) => setCustomColor(event.target.value)}
            disabled={pending}
          />
        </label>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs tracking-wide text-muted uppercase">
            {t.photoEditOriginal}
          </p>
          <img
            src={sourceUrl}
            alt=""
            className="h-40 w-full rounded-xl object-cover"
          />
        </div>
        <div>
          <p className="mb-2 text-xs tracking-wide text-muted uppercase">
            {t.photoEditPreview}
          </p>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-40 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="grid h-40 place-items-center rounded-xl border border-dashed border-line text-sm text-muted">
              {t.photoEditPreviewEmpty}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted">{t.photoEditDisclosure}</p>

      {progress ? <p className="text-sm text-blue">{progress}</p> : null}
      {error ? <p className="text-sm text-tangerine">{error}</p> : null}

      <button
        type="button"
        className="btn btn-blue justify-self-start !py-2 text-sm"
        disabled={pending}
        onClick={applyScene}
      >
        {pending ? t.photoEditWorking : t.photoEditApply}
      </button>
    </div>
  );
}

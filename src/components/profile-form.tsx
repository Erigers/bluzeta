"use client";

import { useState } from "react";
import { useT } from "@/components/i18n-provider";
import { MenuIcon } from "@/components/menu-icon";
import { ScoreSlider } from "@/components/score-slider";
import { neighborhoods } from "@/lib/constants";
import { saveProfileAction } from "@/lib/actions";
import { parseSocials, type SocialKind } from "@/lib/socials";

const SOCIAL_FIELDS: { name: SocialKind; placeholder: string }[] = [
  { name: "instagram", placeholder: "@user or instagram.com/user" },
  { name: "facebook", placeholder: "facebook.com/user" },
  { name: "tiktok", placeholder: "@user or tiktok.com/@user" },
  { name: "whatsapp", placeholder: "+355 69..." },
];

const INVALID_MESSAGE = {
  instagram: "invalidInstagram",
  facebook: "invalidFacebook",
  tiktok: "invalidTiktok",
  whatsapp: "invalidWhatsapp",
} as const;

export function ProfileForm({
  initial,
}: {
  initial?: {
    neighborhoodId?: string;
    communicationScore?: number | null;
    trustScore?: number | null;
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    whatsapp?: string | null;
  };
}) {
  const { t } = useT();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SocialKind, string>>>({});
  const [pending, setPending] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [communicationScore, setCommunicationScore] = useState(
    initial?.communicationScore ?? 0,
  );

  function messageFor(kind: SocialKind) {
    return t[INVALID_MESSAGE[kind]];
  }

  function readSocials(form: HTMLFormElement) {
    const data = new FormData(form);
    return parseSocials({
      instagram: String(data.get("instagram") || ""),
      facebook: String(data.get("facebook") || ""),
      tiktok: String(data.get("tiktok") || ""),
      whatsapp: String(data.get("whatsapp") || ""),
    });
  }

  function showFieldErrors(fields: SocialKind[]) {
    const next: Partial<Record<SocialKind, string>> = {};
    for (const kind of fields) next[kind] = messageFor(kind);
    setFieldErrors(next);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = readSocials(form);
    if (parsed.invalid.length) {
      showFieldErrors(parsed.invalid);
      setError("");
      return;
    }
    if (parsed.empty) {
      setFieldErrors({});
      setError(t.atLeastOneSocial);
      return;
    }
    setFieldErrors({});
    setError("");
    setPending(true);
    const result = await saveProfileAction(new FormData(form));
    if (result?.error === "social") setError(t.atLeastOneSocial);
    else if (result?.error === "invalid") showFieldErrors(result.fields);
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <label className="field">
        <span>{t.neighborhood}</span>
        <select name="neighborhoodId" defaultValue={initial?.neighborhoodId ?? "blloku"} required>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {t.neighborhoods[n.id]}
            </option>
          ))}
        </select>
      </label>
      <div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            navigator.geolocation.getCurrentPosition((pos) => {
              setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
          }}
        >
          {t.useMyLocation}
        </button>
        <p className="mt-2 text-sm text-muted">{t.locationHint}</p>
      </div>
      {coords ? (
        <>
          <input type="hidden" name="lat" value={coords.lat} />
          <input type="hidden" name="lng" value={coords.lng} />
        </>
      ) : null}
      <fieldset className="grid gap-4 rounded-2xl border border-line p-4">
        <legend className="px-1 font-medium">{t.publicScores}</legend>
        <p className="text-sm text-muted">{t.communicationScoreHint}</p>
        <ScoreSlider
          icon="communication"
          label={t.communicationScore}
          name="communicationScore"
          value={communicationScore}
          max={10000}
          step={50}
          onChange={setCommunicationScore}
          formatValue={(value) => value.toLocaleString()}
        />
        <ScoreSlider
          icon="trust"
          label={t.trustScore}
          value={initial?.trustScore ?? 0}
          max={10}
          step={0.1}
          readOnly
          formatValue={(value) =>
            Number.isInteger(value) ? String(value) : value.toFixed(1)
          }
        />
        <p className="text-sm text-muted">{t.trustScoreHint}</p>
      </fieldset>
      <fieldset className="grid gap-4">
        <legend className="font-medium">{t.socials}</legend>
        <p className="text-sm text-muted">{t.socialsHint}</p>
        {SOCIAL_FIELDS.map((field) => {
          const fieldError = fieldErrors[field.name];
          return (
            <label key={field.name} className="field">
              <span className="flex items-center gap-2 text-sm text-foreground">
                <MenuIcon name={field.name} size={28} className="size-7" />
                {t[field.name]}
              </span>
              <input
                name={field.name}
                defaultValue={initial?.[field.name] ?? ""}
                placeholder={field.placeholder}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? `${field.name}-error` : undefined}
                onBlur={(e) => {
                  const raw = e.currentTarget.value;
                  if (!raw.trim()) {
                    setFieldErrors((current) => {
                      if (!current[field.name]) return current;
                      const next = { ...current };
                      delete next[field.name];
                      return next;
                    });
                    return;
                  }
                  const parsed = readSocials(e.currentTarget.form!);
                  setFieldErrors((current) => {
                    if (parsed.invalid.includes(field.name)) {
                      return { ...current, [field.name]: messageFor(field.name) };
                    }
                    if (!current[field.name]) return current;
                    const next = { ...current };
                    delete next[field.name];
                    return next;
                  });
                }}
              />
              {fieldError ? (
                <p id={`${field.name}-error`} className="text-sm text-tangerine">
                  {fieldError}
                </p>
              ) : null}
            </label>
          );
        })}
      </fieldset>
      {error ? <p className="text-sm text-tangerine">{error}</p> : null}
      <button className="btn btn-tangerine" disabled={pending}>
        {pending ? t.checkingSocials : t.save}
      </button>
    </form>
  );
}

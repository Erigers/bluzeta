"use client";

import { useState } from "react";
import { useT } from "@/components/i18n-provider";
import { neighborhoods } from "@/lib/constants";
import { saveProfileAction } from "@/lib/actions";

export function ProfileForm({
  initial,
}: {
  initial?: {
    neighborhoodId?: string;
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    whatsapp?: string | null;
  };
}) {
  const { t } = useT();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const result = await saveProfileAction(new FormData(e.currentTarget));
    if (result?.error === "social") setError(t.atLeastOneSocial);
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
      <fieldset className="grid gap-4">
        <legend className="font-medium">{t.socials}</legend>
        <label className="field">
          <span>{t.instagram}</span>
          <input name="instagram" defaultValue={initial?.instagram ?? ""} placeholder="@user" />
        </label>
        <label className="field">
          <span>{t.facebook}</span>
          <input name="facebook" defaultValue={initial?.facebook ?? ""} />
        </label>
        <label className="field">
          <span>{t.tiktok}</span>
          <input name="tiktok" defaultValue={initial?.tiktok ?? ""} placeholder="@user" />
        </label>
        <label className="field">
          <span>{t.whatsapp}</span>
          <input name="whatsapp" defaultValue={initial?.whatsapp ?? ""} placeholder="+355..." />
        </label>
      </fieldset>
      {error ? <p className="text-sm text-tangerine">{error}</p> : null}
      <button className="btn btn-tangerine" disabled={pending}>
        {pending ? t.saving : t.save}
      </button>
    </form>
  );
}

"use client";

import { localeCookie, locales, type Locale } from "@/lib/constants";
import { useT } from "@/components/i18n-provider";

const labels: Record<Locale, string> = {
  sq: "Shqip",
  en: "English",
  it: "Italiano",
  tr: "Türkçe",
};

export function LanguageMenu() {
  const { locale, t } = useT();

  function setLocale(next: Locale) {
    document.cookie = `${localeCookie}=${next}; path=/; max-age=31536000`;
    window.location.reload();
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t.language}</span>
      <select
        className="appearance-none rounded-full border border-line bg-card px-3 py-2 pr-8 text-sm"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {labels[code]}
          </option>
        ))}
      </select>
    </label>
  );
}

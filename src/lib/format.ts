import type { Locale } from "@/lib/constants";
import type { Messages } from "@/lib/i18n/messages";

export function formatPrice(value: number) {
  return new Intl.NumberFormat("sq-AL").format(value);
}

export function formatWhen(date: Date, locale: Locale) {
  const tag =
    locale === "en"
      ? "en-GB"
      : locale === "it"
        ? "it-IT"
        : locale === "tr"
          ? "tr-TR"
          : "sq-AL";
  return new Intl.DateTimeFormat(tag, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function listingStatusLabel(t: Messages, status: string) {
  if (status === "sold") return t.sold;
  if (status === "removed") return t.removed;
  return t.active;
}

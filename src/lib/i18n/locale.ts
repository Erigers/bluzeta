import { cookies } from "next/headers";
import { defaultLocale, localeCookie, locales, type Locale } from "@/lib/constants";
import { getMessages, type Messages } from "@/lib/i18n/messages";

export function parseLocale(value: string | undefined | null): Locale {
  if (value && locales.includes(value as Locale)) return value as Locale;
  return defaultLocale;
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get(localeCookie)?.value);
}

export async function getT(): Promise<{ locale: Locale; t: Messages }> {
  const locale = await getLocale();
  return { locale, t: getMessages(locale) };
}

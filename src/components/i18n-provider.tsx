"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/constants";
import type { Messages } from "@/lib/i18n/messages";

const I18nContext = createContext<{ locale: Locale; t: Messages } | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx;
}

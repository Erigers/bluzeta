"use client";

import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/components/i18n-provider";
import type { Locale } from "@/lib/constants";
import type { Messages } from "@/lib/i18n/messages";

export function Providers({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider locale={locale} messages={messages}>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}

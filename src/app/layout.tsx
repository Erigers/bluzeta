import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import { BottomNav } from "@/components/bottom-nav";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/locale";
import { getViewer } from "@/lib/session";
import "./globals.css";

const display = localFont({
  src: "../fonts/Runtime-Regular.woff",
  variable: "--font-display",
  display: "swap",
  weight: "400",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bluzeta.vercel.app"),
  title: "bluzeta — bli dhe shit në Tiranë",
  description:
    "Bli dhe shit në Tiranë. Takim me cash. Vendndodhja dhe rrjetet sociale mbeten private.",
  applicationName: "bluzeta",
  openGraph: {
    type: "website",
    locale: "sq_AL",
    siteName: "bluzeta",
    title: "bluzeta — bli dhe shit në Tiranë",
    description:
      "Bli dhe shit në Tiranë. Takim me cash. Vendndodhja dhe rrjetet sociale mbeten private.",
  },
  twitter: {
    card: "summary_large_image",
    title: "bluzeta — bli dhe shit në Tiranë",
    description:
      "Bli dhe shit në Tiranë. Takim me cash. Vendndodhja dhe rrjetet sociale mbeten private.",
  },
  appleWebApp: {
    title: "bluzeta",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const t = getMessages(locale);
  const viewer = await getViewer();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full overflow-x-visible overflow-y-visible bg-background text-foreground antialiased">
        <Providers locale={locale} messages={t}>
          <Header signedIn={Boolean(viewer)} />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-12">
            {children}
          </main>
          <SiteFooter t={t} />
          <BottomNav signedIn={Boolean(viewer)} />
        </Providers>
      </body>
    </html>
  );
}

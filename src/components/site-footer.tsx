import Link from "next/link";
import { Logo } from "@/components/logo";
import { categories } from "@/lib/constants";
import type { Messages } from "@/lib/i18n/messages";

export function SiteFooter({ t }: { t: Messages }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] md:gap-16 md:py-16">
        <div>
          <Link href="/" className="text-2xl">
            <Logo />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t.tagline}</p>
          <p className="mt-8 text-sm text-foreground">{t.madeIn}</p>
        </div>

        <nav aria-label={t.footerCategories}>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            {t.footerCategories}
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            {categories.map((id) => (
              <li key={id}>
                <Link
                  href={`/browse?category=${id}`}
                  className="text-sm text-foreground/80 transition-colors hover:text-tangerine"
                >
                  {t.categories[id]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 pb-28 text-sm text-muted sm:flex-row sm:items-center sm:justify-between md:pb-5">
          <span>
            © {year} {t.brand}
          </span>
          <span>{t.footerPrivacy}</span>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LanguageMenu } from "@/components/language-menu";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useT } from "@/components/i18n-provider";

export function NavDrawer({ signedIn }: { signedIn: boolean }) {
  const { t } = useT();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const links = signedIn
    ? [
        { href: "/browse", label: t.browse },
        { href: "/garden", label: t.garden },
        { href: "/likes", label: t.likes },
        { href: "/inbox", label: t.inbox },
        { href: "/sell", label: t.sell, primary: true },
        { href: "/profile", label: t.profile },
      ]
    : [
        { href: "/browse", label: t.browse },
        { href: "/garden", label: t.garden },
        { href: "/sign-in", label: t.signIn },
        { href: "/sign-up", label: t.signUp, primary: true },
      ];

  return (
    <>
      <button
        type="button"
        className="group grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line bg-card"
        aria-label={t.menu}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen(true)}
      >
        <span className="flex h-6 w-8 flex-col justify-center gap-[7px] transition-[gap] duration-200 group-hover:gap-2.5" aria-hidden>
          <span className="block h-[2.5px] w-full rounded-full bg-current" />
          <span className="ml-auto block h-[2.5px] w-[72%] rounded-full bg-current" />
        </span>
      </button>

      {mounted
        ? createPortal(
            <div
              className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
              aria-hidden={!open}
            >
              <button
                type="button"
                tabIndex={open ? 0 : -1}
                className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
                  open ? "opacity-100" : "opacity-0"
                }`}
                aria-label={t.closeMenu}
                onClick={() => setOpen(false)}
              />
              <aside
                id="site-menu"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={`absolute inset-y-0 right-0 flex h-dvh w-[min(22rem,100%)] flex-col border-l border-line bg-[var(--bg)] shadow-[-18px_0_40px_rgba(16,18,24,0.12)] transition-transform duration-300 ease-out [.dark_&]:shadow-[-18px_0_40px_rgba(0,0,0,0.45)] ${
                  open ? "translate-x-0" : "translate-x-full"
                }`}
              >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p
              id={titleId}
              className="font-[family-name:var(--font-display)] text-2xl"
            >
              {t.menu}
            </p>
            <button
              ref={closeRef}
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-line"
              aria-label={t.closeMenu}
              onClick={() => setOpen(false)}
            >
              <X size={20} strokeWidth={1.75} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-6">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-3 py-3 text-lg ${
                  item.primary
                    ? "btn btn-tangerine mt-2 justify-start !rounded-2xl"
                    : path === item.href
                      ? "bg-blue-soft text-blue"
                      : "hover:bg-card"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {signedIn ? (
              <div className="mt-4 px-1">
                <SignOutButton />
              </div>
            ) : null}
          </nav>

          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
            <LanguageMenu />
            <ThemeToggle />
          </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

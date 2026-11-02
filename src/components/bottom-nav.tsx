"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useT } from "@/components/i18n-provider";
import { MenuIcon, type MenuIconName } from "@/components/menu-icon";

export function BottomNav({ signedIn }: { signedIn: boolean }) {
  const { t } = useT();
  const path = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => setShow(true), []);
  if (!show) return null;

  const items: {
    href: string;
    label: string;
    icon: MenuIconName;
    primary?: boolean;
  }[] = [
    { href: "/browse", label: t.browse, icon: "explorer" },
    { href: "/likes", label: t.likes, icon: "heart" },
    {
      href: signedIn ? "/sell" : "/sign-up",
      label: t.sell,
      icon: signedIn ? "bag" : "plus",
      primary: true,
    },
    { href: "/inbox", label: t.inbox, icon: "chat-bubble" },
    { href: "/profile", label: t.profile, icon: "boy" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5 px-2 py-2 text-[11px]">
        {items.map((item) => {
          const active = path === item.href;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1 ${
                  item.primary
                    ? "font-semibold text-tangerine"
                    : active
                      ? "text-blue"
                      : "text-muted"
                }`}
              >
                <MenuIcon name={item.icon} size={28} className="size-7" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

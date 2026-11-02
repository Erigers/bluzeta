"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useT } from "@/components/i18n-provider";
import { MenuIcon } from "@/components/menu-icon";

export function ThemeToggle() {
  const { t } = useT();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="grid h-11 w-11 place-items-center rounded-full border border-line"
      onClick={() => mounted && setTheme(next)}
      aria-label={t.theme}
      suppressHydrationWarning
    >
      {mounted ? (
        <MenuIcon
          name={theme === "dark" ? "sun" : "moon"}
          size={28}
          className="size-7"
        />
      ) : (
        <span className="size-7" />
      )}
    </button>
  );
}

"use client";

import { useT } from "@/components/i18n-provider";
import { MenuIcon } from "@/components/menu-icon";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const { t } = useT();
  return (
    <button
      className="btn btn-ghost w-full justify-start gap-3"
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/";
      }}
    >
      <MenuIcon name="back" size={32} className="size-8" />
      {t.signOut}
    </button>
  );
}

"use client";

import { useT } from "@/components/i18n-provider";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const { t } = useT();
  return (
    <button
      className="btn btn-ghost"
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/";
      }}
    >
      {t.signOut}
    </button>
  );
}

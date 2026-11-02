"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n-provider";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const { t } = useT();
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const email = String(new FormData(e.currentTarget).get("email") || "");
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setPending(false);
    if (result.error) {
      setError(t.errorGeneric);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto grid w-full max-w-md gap-4 text-center">
        <p className="text-muted">{t.resetEmailSent}</p>
        <Link className="text-blue" href="/sign-in">
          {t.backToSignIn}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid w-full max-w-md gap-4">
      <label className="field">
        <span>{t.email}</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      {error ? <p className="text-sm text-tangerine">{error}</p> : null}
      <button className="btn btn-tangerine" disabled={pending}>
        {pending ? t.sendingReset : t.sendResetLink}
      </button>
      <p className="text-center text-sm text-muted">
        <Link className="text-blue" href="/sign-in">
          {t.backToSignIn}
        </Link>
      </p>
    </form>
  );
}

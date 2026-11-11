"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n-provider";
import { requestPasswordResetAction } from "@/lib/password-reset";

type Outcome = "sent" | "not_found" | "error" | null;

export function ForgotPasswordForm() {
  const { t } = useT();
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOutcome(null);
    setPending(true);
    const email = String(new FormData(e.currentTarget).get("email") || "");
    const result = await requestPasswordResetAction(email);
    setPending(false);
    setOutcome(result.status);
  }

  if (outcome === "sent") {
    return (
      <div className="mx-auto grid w-full max-w-md gap-4 text-center">
        <p className="text-muted">{t.resetEmailSent}</p>
        <Link className="text-blue" href="/sign-in">
          {t.backToSignIn}
        </Link>
      </div>
    );
  }

  if (outcome === "not_found") {
    return (
      <div className="mx-auto grid w-full max-w-md gap-4 text-center">
        <p className="text-muted">{t.resetAccountMissing}</p>
        <Link className="btn btn-tangerine" href="/sign-up">
          {t.signUp}
        </Link>
        <Link className="text-blue" href="/forgot-password">
          {t.tryAnotherEmail}
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
      {outcome === "error" ? (
        <p className="text-sm text-tangerine">{t.resetEmailFailed}</p>
      ) : null}
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

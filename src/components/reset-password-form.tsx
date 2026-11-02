"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const invalidLink = searchParams.get("error") === "INVALID_TOKEN" || !token;
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("newPassword") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    setError("");
    setPending(true);
    const result = await authClient.resetPassword({
      newPassword,
      token,
    });
    setPending(false);
    if (result.error) {
      setError(t.invalidResetLink);
      return;
    }
    router.replace("/sign-in");
  }

  if (invalidLink) {
    return (
      <div className="mx-auto grid w-full max-w-md gap-4 text-center">
        <p className="text-sm text-tangerine">{t.invalidResetLink}</p>
        <Link className="text-blue" href="/forgot-password">
          {t.forgotPassword}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid w-full max-w-md gap-4">
      <label className="field">
        <span>{t.newPassword}</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label className="field">
        <span>{t.confirmPassword}</span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      {error ? <p className="text-sm text-tangerine">{error}</p> : null}
      <button className="btn btn-tangerine" disabled={pending}>
        {pending ? t.saving : t.resetPassword}
      </button>
    </form>
  );
}

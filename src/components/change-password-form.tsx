"use client";

import { useState } from "react";
import { useT } from "@/components/i18n-provider";
import { authClient } from "@/lib/auth-client";

export function ChangePasswordForm() {
  const { t } = useT();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") || "");
    const newPassword = String(data.get("newPassword") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");
    if (newPassword !== confirmPassword) {
      setSuccess("");
      setError(t.passwordMismatch);
      return;
    }
    setError("");
    setSuccess("");
    setPending(true);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (result.error) {
      setError(t.invalidCredentials);
      return;
    }
    form.reset();
    setSuccess(t.passwordChanged);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <h2 className="font-medium">{t.changePassword}</h2>
      <label className="field">
        <span>{t.currentPassword}</span>
        <input
          name="currentPassword"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
        />
      </label>
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
      {success ? <p className="text-sm text-muted">{success}</p> : null}
      <button className="btn btn-ghost" disabled={pending}>
        {pending ? t.saving : t.changePassword}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n-provider";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { t } = useT();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "");
    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/onboarding",
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: "/",
          });
    setPending(false);
    if (result.error) {
      setError(mode === "sign-in" ? t.invalidCredentials : t.errorGeneric);
      return;
    }
    window.location.href = mode === "sign-up" ? "/onboarding" : "/";
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid w-full max-w-md gap-4">
      {mode === "sign-up" ? (
        <label className="field">
          <span>{t.name}</span>
          <input name="name" required autoComplete="name" />
        </label>
      ) : null}
      <label className="field">
        <span>{t.email}</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="field">
        <span>{t.password}</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
        />
      </label>
      {error ? <p className="text-sm text-tangerine">{error}</p> : null}
      <button className="btn btn-tangerine" disabled={pending}>
        {mode === "sign-up" ? t.signUp : t.signIn}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "sign-up" ? t.hasAccount : t.noAccount}{" "}
        <Link className="text-blue" href={mode === "sign-up" ? "/sign-in" : "/sign-up"}>
          {mode === "sign-up" ? t.signIn : t.signUp}
        </Link>
      </p>
    </form>
  );
}

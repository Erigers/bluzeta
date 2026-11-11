"use client";

import { useState } from "react";
import Link from "next/link";
import { TurnstileField } from "@/components/turnstile-field";
import { useT } from "@/components/i18n-provider";
import { submitContactAction } from "@/lib/contact";

export function ContactForm({ siteKey }: { siteKey: string }) {
  const { t } = useT();
  const [token, setToken] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "invalid" | "bot" | "error">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setStatus("idle");
    const formData = new FormData(e.currentTarget);
    formData.set("cf-turnstile-response", token);
    const result = await submitContactAction(formData);
    setPending(false);
    setStatus(result.status);
  }

  if (status === "sent") {
    return (
      <div className="mx-auto grid w-full max-w-lg gap-4 text-center">
        <p className="text-muted">{t.contactSent}</p>
        <Link className="text-blue" href="/">
          {t.brand}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid w-full max-w-lg gap-4">
      <label className="field">
        <span>{t.contactName}</span>
        <input name="name" type="text" required minLength={2} autoComplete="name" />
      </label>
      <label className="field">
        <span>{t.email}</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="field">
        <span>{t.contactTopic}</span>
        <select name="topic" required defaultValue="feature">
          <option value="feature">{t.contactTopicFeature}</option>
          <option value="issue">{t.contactTopicIssue}</option>
          <option value="collab">{t.contactTopicCollab}</option>
          <option value="other">{t.contactTopicOther}</option>
        </select>
      </label>
      <label className="field">
        <span>{t.contactMessage}</span>
        <textarea name="message" required minLength={10} rows={6} />
      </label>
      <TurnstileField siteKey={siteKey} onToken={setToken} />
      {status === "invalid" ? (
        <p className="text-sm text-tangerine">{t.contactInvalid}</p>
      ) : null}
      {status === "bot" ? (
        <p className="text-sm text-tangerine">{t.contactBotFailed}</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-tangerine">{t.contactFailed}</p>
      ) : null}
      <button className="btn btn-tangerine" disabled={pending || !token}>
        {pending ? t.contactSending : t.contactSend}
      </button>
    </form>
  );
}

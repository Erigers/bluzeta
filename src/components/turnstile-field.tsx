"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";
import { useTheme } from "next-themes";

export function TurnstileField({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const ref = useRef<TurnstileInstance | null>(null);
  const { resolvedTheme } = useTheme();

  if (!siteKey) return null;

  return (
    <Turnstile
      ref={ref}
      siteKey={siteKey}
      options={{
        theme: resolvedTheme === "dark" ? "dark" : "light",
        size: "flexible",
      }}
      onSuccess={onToken}
      onExpire={() => onToken("")}
      onError={() => onToken("")}
    />
  );
}

const TEST_SECRET = "1x0000000000000000000000000000000AA";

export function turnstileSiteKey() {
  return (
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    (process.env.NODE_ENV !== "production"
      ? "1x00000000000000000000AA"
      : "")
  );
}

export async function verifyTurnstileToken(token: string | null | undefined) {
  const secret =
    process.env.TURNSTILE_SECRET_KEY ||
    (process.env.NODE_ENV !== "production" ? TEST_SECRET : "");

  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is not set");
  }
  if (!token) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
  );

  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

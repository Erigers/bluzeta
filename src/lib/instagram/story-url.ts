import { createHmac, timingSafeEqual } from "crypto";

function appBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3010"
  ).replace(/\/$/, "");
}

function signingSecret() {
  return (
    process.env.CRON_SECRET ||
    process.env.INSTAGRAM_ACCESS_TOKEN ||
    process.env.BETTER_AUTH_SECRET ||
    ""
  );
}

export function createStoryMediaUrl(
  listingId: string,
  options?: { ttlSeconds?: number },
) {
  const secret = signingSecret();
  if (!secret) {
    throw new Error("Missing signing secret for story media URL");
  }
  const exp = Math.floor(Date.now() / 1000) + (options?.ttlSeconds ?? 60 * 60);
  const sig = createHmac("sha256", secret)
    .update(`${listingId}:${exp}`)
    .digest("hex");
  const url = new URL(`/api/instagram/story-media/${listingId}`, appBaseUrl());
  url.searchParams.set("exp", String(exp));
  url.searchParams.set("sig", sig);
  return url.toString();
}

export function verifyStoryMediaUrl(
  listingId: string,
  expRaw: string | null,
  sigRaw: string | null,
) {
  const secret = signingSecret();
  if (!secret || !expRaw || !sigRaw) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const expected = createHmac("sha256", secret)
    .update(`${listingId}:${exp}`)
    .digest("hex");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(sigRaw);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

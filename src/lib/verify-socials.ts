import type { ParsedSocials, SocialKind } from "@/lib/socials";

const TIMEOUT_MS = 6000;
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/** false = confirmed missing, true = confirmed real, null = could not tell */
type Existence = boolean | null;

export async function verifySocials(values: ParsedSocials): Promise<SocialKind[]> {
  const checks: Promise<SocialKind | null>[] = [];
  if (values.instagram) {
    checks.push(rejectIfMissing("instagram", verifyInstagram(values.instagram)));
  }
  if (values.tiktok) {
    checks.push(rejectIfMissing("tiktok", verifyTiktok(values.tiktok)));
  }
  const missing = await Promise.all(checks);
  return missing.filter((kind): kind is SocialKind => kind !== null);
}

async function rejectIfMissing(kind: SocialKind, check: Promise<Existence>) {
  return (await check) === false ? kind : null;
}

async function verifyTiktok(handle: string): Promise<Existence> {
  try {
    const url = `https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@${handle}`)}`;
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
    if (res.ok) return true;
    if (res.status === 400 || res.status === 404) return false;
    return null;
  } catch {
    return null;
  }
}

async function verifyInstagram(handle: string): Promise<Existence> {
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          Accept: "application/json",
          "User-Agent": BROWSER_UA,
          "x-ig-app-id": "936619743392459",
        },
      },
    );
    if (res.status === 404) return false;
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: { user?: { username?: string } | null };
    };
    if (data.data?.user?.username) return true;
    if (data.data && data.data.user == null) return false;
    return null;
  } catch {
    return null;
  }
}

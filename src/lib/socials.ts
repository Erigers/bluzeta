export type SocialKind = "instagram" | "facebook" | "tiktok" | "whatsapp";

export type ParsedSocials = {
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  whatsapp: string | null;
};

const IG_RESERVED = new Set([
  "p",
  "reel",
  "reels",
  "stories",
  "explore",
  "accounts",
  "direct",
  "legal",
  "about",
  "share",
  "tv",
]);

const FB_RESERVED = new Set([
  "share",
  "watch",
  "events",
  "groups",
  "pages",
  "login",
  "privacy",
  "help",
  "marketplace",
  "reels",
  "stories",
  "photos",
  "videos",
  "people",
  "public",
  "bookmarks",
  "settings",
  "ads",
  "business",
  "developers",
  "policies",
  "checkpoint",
  "recover",
  "permalink.php",
  "photo.php",
  "profile.php",
]);

export function parseInstagram(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  const hosted = parseHostedPath(value, ["instagram.com"]);
  if (hosted) {
    const segment = hosted.segment.toLowerCase();
    if (!segment || IG_RESERVED.has(segment)) return null;
    return validInstagramHandle(hosted.segment);
  }
  if (looksLikeUrl(value)) return null;
  return validInstagramHandle(stripAt(value));
}

export function parseFacebook(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  const hosted = parseHostedPath(value, ["facebook.com", "fb.com"]);
  if (hosted) {
    const id = hosted.url.searchParams.get("id");
    if (hosted.segment.toLowerCase() === "profile.php" && id) {
      return validFacebookId(id);
    }
    const segment = hosted.segment.toLowerCase();
    if (!segment || FB_RESERVED.has(segment)) return null;
    return validFacebookHandle(hosted.segment);
  }
  if (looksLikeUrl(value)) return null;
  return validFacebookHandle(stripAt(value)) ?? validFacebookId(value);
}

export function parseTiktok(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  const hosted = parseHostedPath(value, ["tiktok.com"]);
  if (hosted) {
    const segment = stripAt(hosted.segment);
    if (!segment || segment.toLowerCase() === "video" || segment.toLowerCase() === "t") {
      return null;
    }
    return validTiktokHandle(segment);
  }
  if (looksLikeUrl(value)) return null;
  return validTiktokHandle(stripAt(value));
}

export function parseWhatsapp(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  const hosted = parseHostedPath(value, ["wa.me", "whatsapp.com"]);
  if (hosted) {
    const phoneParam = hosted.url.searchParams.get("phone");
    if (phoneParam) return toE164(phoneParam);
    if (hosted.host === "wa.me" || hosted.host.endsWith(".wa.me")) {
      return toE164(hosted.segment);
    }
    return null;
  }
  if (looksLikeUrl(value)) return null;
  return toE164(value);
}

export function parseSocials(input: {
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
}): { values: ParsedSocials; invalid: SocialKind[]; empty: boolean } {
  const fields = [
    ["instagram", input.instagram, parseInstagram],
    ["facebook", input.facebook, parseFacebook],
    ["tiktok", input.tiktok, parseTiktok],
    ["whatsapp", input.whatsapp, parseWhatsapp],
  ] as const;

  const values: ParsedSocials = {
    instagram: null,
    facebook: null,
    tiktok: null,
    whatsapp: null,
  };
  const invalid: SocialKind[] = [];

  for (const [kind, raw, parse] of fields) {
    if (!raw.trim()) continue;
    const parsed = parse(raw);
    if (parsed) values[kind] = parsed;
    else invalid.push(kind);
  }

  return {
    values,
    invalid,
    empty: !values.instagram && !values.facebook && !values.tiktok && !values.whatsapp,
  };
}

export function instagramUrl(handle: string) {
  return `https://instagram.com/${handle}`;
}

export function facebookUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^\d+$/.test(value)) return `https://facebook.com/profile.php?id=${value}`;
  return `https://facebook.com/${value}`;
}

export function tiktokUrl(handle: string) {
  return `https://tiktok.com/@${handle}`;
}

export function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

function stripAt(value: string) {
  return value.trim().replace(/^@+/, "");
}

function looksLikeUrl(value: string) {
  return /^(https?:)?\/\//i.test(value) || value.includes("/") || value.includes("?");
}

function hostAliases(host: string) {
  return [host, `www.${host}`, `m.${host}`, `web.${host}`, `api.${host}`];
}

function parseHostedPath(value: string, hosts: string[]) {
  const lower = value.toLowerCase();
  const candidate = /^(https?:)?\/\//i.test(value)
    ? value.replace(/^\/\//, "https://")
    : hosts.some((host) =>
        hostAliases(host).some(
          (name) => lower === name || lower.startsWith(`${name}/`) || lower.startsWith(`${name}?`),
        ),
      )
      ? `https://${value}`
      : null;
  if (!candidate) return null;
  try {
    const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (!hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
      return null;
    }
    const segment = decodeURIComponent(url.pathname.split("/").filter(Boolean)[0] ?? "");
    return { url, host, segment };
  } catch {
    return null;
  }
}

function validInstagramHandle(value: string) {
  const handle = stripAt(value);
  if (!/^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/.test(handle)) return null;
  if (handle.startsWith(".")) return null;
  return handle;
}

function validTiktokHandle(value: string) {
  const handle = stripAt(value);
  if (!/^[a-zA-Z0-9._]{2,24}$/.test(handle)) return null;
  return handle;
}

function validFacebookHandle(value: string) {
  const handle = stripAt(value);
  if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9.]{3,50}$/.test(handle)) return null;
  return handle;
}

function validFacebookId(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!/^\d{6,16}$/.test(digits)) return null;
  return digits;
}

function toE164(raw: string) {
  const compact = raw.trim().replace(/[()\s-]/g, "");
  let digits = compact.replace(/\D/g, "");
  if (!digits) return null;
  if (compact.startsWith("00")) digits = compact.slice(2).replace(/\D/g, "");
  if (digits.startsWith("06") && digits.length === 10) digits = `355${digits.slice(1)}`;
  if (!/^[1-9]\d{7,14}$/.test(digits)) return null;
  return `+${digits}`;
}

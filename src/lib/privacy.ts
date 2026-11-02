export type PublicSocials = {
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  whatsapp: string | null;
};

export function publicSocials(row: PublicSocials | null | undefined): PublicSocials {
  return {
    instagram: row?.instagram || null,
    facebook: row?.facebook || null,
    tiktok: row?.tiktok || null,
    whatsapp: row?.whatsapp || null,
  };
}

export function normalizeHandle(value: string) {
  return value.trim().replace(/^@/, "");
}

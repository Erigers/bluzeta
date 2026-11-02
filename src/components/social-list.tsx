"use client";

import { useT } from "@/components/i18n-provider";

export function SocialList({
  socials,
}: {
  socials: {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    whatsapp: string | null;
  } | null;
}) {
  const { t } = useT();
  if (!socials) return null;
  const items = [
    socials.instagram
      ? { label: t.instagram, href: `https://instagram.com/${socials.instagram}`, value: `@${socials.instagram}` }
      : null,
    socials.facebook
      ? { label: t.facebook, href: socials.facebook.startsWith("http") ? socials.facebook : `https://facebook.com/${socials.facebook}`, value: socials.facebook }
      : null,
    socials.tiktok
      ? { label: t.tiktok, href: `https://tiktok.com/@${socials.tiktok}`, value: `@${socials.tiktok}` }
      : null,
    socials.whatsapp
      ? { label: t.whatsapp, href: `https://wa.me/${socials.whatsapp.replace(/\D/g, "")}`, value: socials.whatsapp }
      : null,
  ].filter(Boolean) as { label: string; href: string; value: string }[];

  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item.label}>
          <a className="text-blue underline-offset-2 hover:underline" href={item.href} target="_blank" rel="noreferrer">
            {item.label}: {item.value}
          </a>
        </li>
      ))}
    </ul>
  );
}

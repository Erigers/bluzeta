"use client";

import { useT } from "@/components/i18n-provider";
import { MenuIcon, type MenuIconName } from "@/components/menu-icon";
import { facebookUrl, instagramUrl, tiktokUrl, whatsappUrl } from "@/lib/socials";

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
      ? {
          icon: "instagram" as const,
          label: t.instagram,
          href: instagramUrl(socials.instagram),
          value: `@${socials.instagram}`,
        }
      : null,
    socials.facebook
      ? {
          icon: "facebook" as const,
          label: t.facebook,
          href: facebookUrl(socials.facebook),
          value: socials.facebook,
        }
      : null,
    socials.tiktok
      ? {
          icon: "tiktok" as const,
          label: t.tiktok,
          href: tiktokUrl(socials.tiktok),
          value: `@${socials.tiktok}`,
        }
      : null,
    socials.whatsapp
      ? {
          icon: "whatsapp" as const,
          label: t.whatsapp,
          href: whatsappUrl(socials.whatsapp),
          value: socials.whatsapp,
        }
      : null,
  ].filter(Boolean) as {
    icon: MenuIconName;
    label: string;
    href: string;
    value: string;
  }[];

  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item.label}>
          <a
            className="inline-flex items-center gap-2 text-blue underline-offset-2 hover:underline"
            href={item.href}
            target="_blank"
            rel="noreferrer"
          >
            <MenuIcon name={item.icon} size={28} className="size-7" />
            {item.label}: {item.value}
          </a>
        </li>
      ))}
    </ul>
  );
}

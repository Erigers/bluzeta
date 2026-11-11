"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n-provider";

export function AdminNav({ pending }: { pending: number }) {
  const { t } = useT();
  const path = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      <Link href="/admin" className="chip" data-active={path === "/admin"}>
        {t.adminProducts}
      </Link>
      <Link
        href="/admin/reports"
        className="chip"
        data-active={path === "/admin/reports"}
      >
        {t.adminReports}
        {pending > 0 ? (
          <span className="rounded-full bg-tangerine px-2 py-0.5 text-xs text-white">
            {pending}
          </span>
        ) : null}
      </Link>
      <Link
        href="/admin/instagram"
        className="chip"
        data-active={path === "/admin/instagram"}
      >
        {t.adminInstagram}
      </Link>
    </nav>
  );
}

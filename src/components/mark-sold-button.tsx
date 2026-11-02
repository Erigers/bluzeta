"use client";

import { useT } from "@/components/i18n-provider";
import { markSoldAction } from "@/lib/actions";

export function MarkSoldButton({ listingId }: { listingId: string }) {
  const { t } = useT();
  return (
    <form action={markSoldAction.bind(null, listingId)}>
      <button className="mt-2 text-sm text-blue underline">{t.markSold}</button>
    </form>
  );
}

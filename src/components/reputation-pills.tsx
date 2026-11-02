"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import type { BuyerReputation, ThumbRating } from "@/lib/data";

export function ReputationPills({
  reputation,
}: {
  reputation: BuyerReputation;
}) {
  const { t } = useT();
  if (reputation.up === 0 && reputation.down === 0) return null;
  return (
    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
      <span className="inline-flex items-center gap-1">
        <ThumbsUp className="size-3.5" aria-hidden />
        {reputation.up} {t.thumbsUpCount}
      </span>
      <span className="inline-flex items-center gap-1">
        <ThumbsDown className="size-3.5" aria-hidden />
        {reputation.down} {t.thumbsDownCount}
      </span>
    </p>
  );
}

export function ThumbLabel({ rating }: { rating: ThumbRating }) {
  const { t } = useT();
  const Icon = rating === "up" ? ThumbsUp : ThumbsDown;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium">
      <Icon className="size-3.5" aria-hidden />
      {rating === "up" ? t.thumbsUp : t.thumbsDown}
    </span>
  );
}

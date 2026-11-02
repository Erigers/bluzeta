import Image from "next/image";
import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { MockupBadge } from "@/components/mockup-badge";
import type { PublicListing } from "@/lib/data";
import type { Messages } from "@/lib/i18n/messages";
import { subcategoryLabel } from "@/lib/labels";

function formatPrice(value: number) {
  return new Intl.NumberFormat("sq-AL").format(value);
}

export function ListingCard({
  item,
  t,
  signedIn,
}: {
  item: PublicListing;
  t: Messages;
  signedIn: boolean;
}) {
  const image = item.images[0];
  return (
    <article className="listing-card">
      <Link href={`/item/${item.id}`} className="block">
        <div className="card-media relative aspect-[4/5]">
          {image ? (
            <Image
              src={image}
              alt={item.title}
              width={800}
              height={1000}
              className="h-full w-full object-cover"
            />
          ) : null}
          {item.isMockup ? <MockupBadge label={t.mockup} /> : null}
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <Link href={`/item/${item.id}`} className="font-medium leading-tight">
            {item.title}
          </Link>
          <p className="mt-1 text-sm text-muted">
            {t.conditions[item.condition as keyof typeof t.conditions]}
            {" · "}
            {subcategoryLabel(t, item.category, item.subcategory)}
            {item.size ? ` · ${item.size}` : ""}
          </p>
        </div>
        <LikeButton
          listingId={item.id}
          liked={item.liked}
          count={item.likesCount}
          signedIn={signedIn}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <strong>
          {formatPrice(item.priceAll)} {t.lek}
        </strong>
        <span className="text-blue">
          {item.distanceLabel ?? (signedIn ? "—" : t.signInForDistance)}
        </span>
      </div>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyerInterestCard } from "@/components/buyer-interest-card";
import { ConfirmAction } from "@/components/confirm-action";
import { InterestedButton } from "@/components/interested-button";
import { LikeButton } from "@/components/like-button";
import { MockupBadge } from "@/components/mockup-badge";
import { ReportForm } from "@/components/report-form";
import { removeProductAction } from "@/lib/actions";
import { getPublicListing } from "@/lib/data";
import { listingStatusLabel } from "@/lib/format";
import { getT } from "@/lib/i18n/locale";
import { categoryLabel, colorLabel, subcategoryLabel } from "@/lib/labels";
import { getViewer } from "@/lib/session";

function formatPrice(value: number) {
  return new Intl.NumberFormat("sq-AL").format(value);
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, locale } = await getT();
  const viewer = await getViewer();
  const item = await getPublicListing(id, {
    viewerId: viewer?.user.id,
    viewerCoords: viewer?.profile
      ? { lat: viewer.profile.lat, lng: viewer.profile.lng }
      : null,
    locale,
    asAdmin: viewer?.isAdmin,
  });
  if (!item) notFound();

  return (
    <article className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-3">
        {item.images.map((src, index) => (
          <div key={src} className="card-media relative overflow-hidden">
            <Image
              src={src}
              alt={item.title}
              width={1200}
              height={1500}
              className="h-auto w-full object-cover"
              priority={index === 0}
            />
            {item.isMockup && index === 0 ? (
              <MockupBadge label={t.mockup} />
            ) : null}
          </div>
        ))}
      </div>
      <div className="md:sticky md:top-24 md:self-start">
        <p className="text-sm uppercase tracking-widest text-blue">
          {categoryLabel(t, item.category)} ·{" "}
          {subcategoryLabel(t, item.category, item.subcategory)}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          {item.title}
        </h1>
        <p className="mt-3 text-2xl font-semibold">
          {formatPrice(item.priceAll)} {t.lek}
        </p>
        <p className="mt-3 text-sm">
          {t.seller}:{" "}
          <Link href={`/user/${item.sellerId}`} className="text-blue">
            {item.sellerName}
          </Link>
          {item.sellerBanned ? (
            <span className="ml-2 chip">{t.adminBanned}</span>
          ) : null}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {item.status !== "active" ? (
            <span className="chip" data-active="true">
              {listingStatusLabel(t, item.status)}
            </span>
          ) : null}
          {item.isMockup ? (
            <span className="chip" data-active="true">
              {t.mockup}
            </span>
          ) : null}
          <span className="chip" data-active="true">
            {t.conditions[item.condition as keyof typeof t.conditions]}
          </span>
          {item.color ? (
            <span className="chip">{colorLabel(t, item.color)}</span>
          ) : null}
          {item.size ? (
            <span className="chip">
              {t.size} {item.size}
            </span>
          ) : null}
          {item.category === "clothes" && item.gender ? (
            <span className="chip">
              {t.genders[item.gender as keyof typeof t.genders]}
            </span>
          ) : null}
          <span className="chip">
            {item.distanceLabel ?? t.signInForDistance}
          </span>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <LikeButton
            listingId={item.id}
            liked={item.liked}
            count={item.likesCount}
            signedIn={Boolean(viewer)}
          />
          <span className="text-sm text-muted">
            {item.likesCount} {t.likesCount}
          </span>
        </div>
        <div className="mt-6">
          <InterestedButton
            listingId={item.id}
            signedIn={Boolean(viewer)}
            onboarded={Boolean(viewer?.onboarded)}
            isOwner={item.isOwner}
            initialStatus={item.myInterest}
            sold={item.status === "sold"}
          />
        </div>
        {item.isOwner ? (
          <section className="mt-6 rounded-2xl border border-line p-5">
            <h2 className="font-semibold">{t.incoming}</h2>
            <p className="mt-1 text-sm text-muted">{t.contactToDecide}</p>
            {item.interests.length === 0 ? (
              <p className="mt-3 text-sm text-muted">{t.noIncoming}</p>
            ) : (
              item.interests.map((buyer) => (
                <BuyerInterestCard
                  key={buyer.id}
                  buyer={buyer}
                  canSelect={
                    !item.interests.some((row) => row.status === "accepted") &&
                    buyer.status === "pending"
                  }
                />
              ))
            )}
          </section>
        ) : (
          <p className="mt-3 text-sm text-muted">{t.hiddenUntilAccept}</p>
        )}
        <section className="mt-8 rounded-2xl border border-line p-5">
          <h2 className="font-semibold">{t.description}</h2>
          <p className="mt-2 whitespace-pre-wrap text-muted">{item.description}</p>
        </section>
        <section className="mt-4 rounded-2xl bg-tangerine-soft p-5">
          <h2 className="font-semibold">{t.meetupCash}</h2>
          <p className="mt-2 text-sm">{t.meetupBody}</p>
        </section>
        {viewer?.isAdmin && item.status !== "removed" ? (
          <div className="mt-4">
            <ConfirmAction
              action={removeProductAction.bind(null, item.id)}
              label={t.adminRemoveProduct}
              confirm={t.adminRemoveConfirm}
              className="btn btn-ghost w-full"
            />
          </div>
        ) : null}
        {!item.isOwner && item.myInterest ? (
          <ReportForm
            userId={item.sellerId}
            listingId={item.id}
            signedIn={Boolean(viewer)}
            onboarded={Boolean(viewer?.onboarded)}
            label={t.reportSeller}
          />
        ) : null}
        {!item.isOwner ? (
          <ReportForm
            listingId={item.id}
            signedIn={Boolean(viewer)}
            onboarded={Boolean(viewer?.onboarded)}
          />
        ) : null}
      </div>
    </article>
  );
}

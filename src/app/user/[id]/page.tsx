import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/confirm-action";
import { ListingCard } from "@/components/listing-card";
import { ProfileScores } from "@/components/profile-scores";
import { ReportForm } from "@/components/report-form";
import { banUserAction, unbanUserAction } from "@/lib/actions";
import { getPublicSeller } from "@/lib/data";
import { getT } from "@/lib/i18n/locale";
import { getViewer } from "@/lib/session";

export default async function PublicUserPage({
  params,
}: PageProps<"/user/[id]">) {
  const { id } = await params;
  const { t, locale } = await getT();
  const viewer = await getViewer();
  const isAdmin = Boolean(viewer?.isAdmin);
  const seller = await getPublicSeller(id, {
    viewerId: viewer?.user.id,
    viewerCoords: viewer?.profile
      ? { lat: viewer.profile.lat, lng: viewer.profile.lng }
      : null,
    locale,
    asAdmin: isAdmin,
  });
  if (!seller) notFound();

  const isSelf = viewer?.user.id === seller.id;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-blue">{t.seller}</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl">
            {seller.name}
          </h1>
          {seller.banned ? (
            <p className="mt-3">
              <span className="chip" data-active="true">
                {t.adminBanned}
              </span>
            </p>
          ) : null}
        </div>
        {isAdmin && !isSelf ? (
          seller.banned ? (
            <ConfirmAction
              action={unbanUserAction.bind(null, seller.id)}
              label={t.adminUnbanUser}
              confirm={t.adminUnbanUser}
              className="btn btn-ghost"
            />
          ) : (
            <ConfirmAction
              action={banUserAction.bind(null, seller.id)}
              label={t.adminBanUser}
              confirm={t.adminBanConfirm}
              className="btn btn-tangerine"
            />
          )
        ) : null}
      </header>

      <ProfileScores
        communicationScore={seller.communicationScore}
        trustScore={seller.trustScore}
      />

      {seller.banned && !isAdmin ? (
        <p className="text-muted">{t.bannedBody}</p>
      ) : (
        <section>
          <h2 className="text-xl font-semibold">{t.publicListings}</h2>
          {seller.listings.length === 0 ? (
            <p className="mt-4 text-muted">{t.noPublicListings}</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {seller.listings.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  t={t}
                  signedIn={Boolean(viewer)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {isSelf ? (
        <Link href="/profile" className="text-sm text-blue">
          {t.editProfile}
        </Link>
      ) : (
        <ReportForm
          userId={seller.id}
          signedIn={Boolean(viewer)}
          onboarded={Boolean(viewer?.onboarded)}
        />
      )}
    </div>
  );
}

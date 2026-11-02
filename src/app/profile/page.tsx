import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MarkSoldButton } from "@/components/mark-sold-button";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ProfileForm } from "@/components/profile-form";
import { SignOutButton } from "@/components/sign-out-button";
import { ThumbLabel } from "@/components/reputation-pills";
import { getMyListings, getReceivedFeedback, getTrustScores } from "@/lib/data";
import { getT } from "@/lib/i18n/locale";
import { getViewer } from "@/lib/session";

export default async function ProfilePage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  const { t } = await getT();
  const [listings, feedback, trustScores] = await Promise.all([
    getMyListings(viewer.user.id),
    getReceivedFeedback(viewer.user.id),
    getTrustScores([viewer.user.id]),
  ]);
  const trustScore = trustScores.get(viewer.user.id) ?? 0;

  return (
    <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
      <section>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">{t.profile}</h1>
        <p className="mt-2 text-muted">{viewer.user.name}</p>
        <p className="mt-4 text-sm text-muted">{t.privacyBody}</p>
        <div className="mt-6">
          <ProfileForm
            initial={{
              ...(viewer.profile ?? {}),
              trustScore,
            }}
          />
        </div>
        <div className="mt-8 border-t border-line pt-8">
          <h2 className="font-medium">{t.yourFeedback}</h2>
          {feedback.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t.noFeedback}</p>
          ) : (
            <ul className="mt-3 grid gap-3">
              {feedback.map((row) => (
                <li key={`${row.listingId}-${row.ratedAt?.toISOString() ?? row.listingTitle}`} className="rounded-xl border border-line p-3">
                  <ThumbLabel rating={row.rating} />
                  <p className="mt-1 text-sm text-muted">
                    <Link href={`/item/${row.listingId}`}>{row.listingTitle}</Link>
                  </p>
                  {row.feedback ? (
                    <p className="mt-2 text-sm">{row.feedback}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-8 border-t border-line pt-8">
          <ChangePasswordForm />
        </div>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">{t.yourListings}</h2>
        {listings.length === 0 ? (
          <p className="mt-4 text-muted">{t.emptySell}</p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {listings.map((item) => (
              <li key={item.id} className="flex gap-4 rounded-2xl border border-line p-3">
                {item.images[0] ? (
                  <Image
                    src={item.images[0]}
                    alt=""
                    width={72}
                    height={90}
                    className="h-[90px] w-[72px] rounded-xl object-cover"
                  />
                ) : null}
                <div className="flex-1">
                  <Link href={`/item/${item.id}`} className="font-medium">
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {item.status === "sold" ? t.sold : t.active} · {item.likesCount} {t.likesCount}
                    {item.isMockup ? ` · ${t.mockup}` : ""}
                  </p>
                  {item.status !== "sold" ? <MarkSoldButton listingId={item.id} /> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

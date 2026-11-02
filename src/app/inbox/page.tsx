import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BuyerInterestCard } from "@/components/buyer-interest-card";
import { RateSellerForm } from "@/components/rate-seller-form";
import { ReportForm } from "@/components/report-form";
import { SocialList } from "@/components/social-list";
import { ThumbLabel } from "@/components/reputation-pills";
import { TradeGuide } from "@/components/trade-guide";
import { VerifyTradeForm } from "@/components/verify-trade-form";
import { getInbox } from "@/lib/actions";
import { getT } from "@/lib/i18n/locale";
import { getViewer } from "@/lib/session";

export default async function InboxPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  if (!viewer.onboarded) redirect("/onboarding");
  const { t } = await getT();
  const data = await getInbox();

  const showGuide =
    data.incoming.some((group) => group.hasChosen) ||
    data.sent.some((row) => row.status === "accepted");

  return (
    <div className="space-y-10">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">{t.inbox}</h1>
      {showGuide ? <TradeGuide /> : null}
      <section>
        <h2 className="text-xl font-semibold">{t.incoming}</h2>
        {data.incoming.length === 0 ? (
          <p className="mt-3 text-muted">{t.noIncoming}</p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {data.incoming.map((group) => (
              <li key={group.listingId} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex gap-4">
                  {group.listingImage ? (
                    <Image
                      src={group.listingImage}
                      alt=""
                      width={72}
                      height={90}
                      className="h-[90px] w-[72px] rounded-xl object-cover"
                    />
                  ) : null}
                  <div className="flex-1">
                    <Link href={`/item/${group.listingId}`} className="font-medium">
                      {group.listingTitle}
                    </Link>
                    <p className="text-sm text-muted">
                      {group.buyers.length} {t.interestedPeople}
                    </p>
                    <p className="mt-2 text-sm text-muted">{t.contactToDecide}</p>
                  </div>
                </div>
                {group.buyers.map((buyer) => (
                  <BuyerInterestCard
                    key={buyer.id}
                    buyer={buyer}
                    canSelect={!group.hasChosen && buyer.status === "pending"}
                  />
                ))}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold">{t.sent}</h2>
        {data.sent.length === 0 ? (
          <p className="mt-3 text-muted">{t.noSent}</p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {data.sent.map((row) => (
              <li key={row.id} className="rounded-2xl border border-line bg-card p-4">
                <Link href={`/item/${row.listingId}`} className="font-medium">
                  {row.listingTitle}
                </Link>
                <p className="text-sm text-muted">
                  {row.status === "accepted"
                    ? t.sellerChoseYou
                    : row.status === "declined"
                      ? t.interestDeclined
                      : t.pending}
                </p>
                {row.socials ? (
                  <div className="mt-3">
                    <p className="text-sm font-medium">{t.sellerSocials}</p>
                    <SocialList socials={row.socials} />
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted">{t.hiddenUntilAccept}</p>
                )}
                {row.rating ? (
                  <div className="mt-3">
                    <ThumbLabel rating={row.rating} />
                    {row.feedback ? (
                      <p className="mt-1 text-sm text-muted">{row.feedback}</p>
                    ) : null}
                  </div>
                ) : null}
                {row.status === "accepted" ? (
                  <>
                    <VerifyTradeForm
                      id={row.id}
                      role="buyer"
                      myVerified={Boolean(row.buyerVerifiedAt)}
                      otherVerified={Boolean(row.sellerVerifiedAt)}
                    />
                    {row.buyerVerifiedAt ? (
                      <RateSellerForm
                        id={row.id}
                        trustScore={row.sellerTrustScore}
                        feedback={row.sellerFeedback}
                      />
                    ) : null}
                  </>
                ) : null}
                <ReportForm
                  userId={row.sellerId}
                  listingId={row.listingId}
                  signedIn
                  onboarded
                  label={t.reportSeller}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

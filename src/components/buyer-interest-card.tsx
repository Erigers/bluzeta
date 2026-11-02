"use client";

import { InboxActions } from "@/components/inbox-actions";
import { ProfileScores } from "@/components/profile-scores";
import { RateBuyerForm } from "@/components/rate-buyer-form";
import { ReportForm } from "@/components/report-form";
import { ReputationPills } from "@/components/reputation-pills";
import { SocialList } from "@/components/social-list";
import { TradeGuide } from "@/components/trade-guide";
import { VerifyTradeForm } from "@/components/verify-trade-form";
import { useT } from "@/components/i18n-provider";
import type { IncomingInterest } from "@/lib/data";

export function BuyerInterestCard({
  buyer,
  canSelect,
}: {
  buyer: IncomingInterest;
  canSelect: boolean;
}) {
  const { t } = useT();
  return (
    <div className="mt-3 rounded-xl border border-line p-3">
      <p className="font-medium">{buyer.buyerName}</p>
      <ReputationPills reputation={buyer.reputation} />
      {buyer.reputation.comments.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-sm text-muted">
          {buyer.reputation.comments.map((comment, index) => (
            <li key={`${comment.rating}-${index}`}>“{comment.text}”</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3">
        <ProfileScores
          communicationScore={buyer.communicationScore}
          trustScore={buyer.trustScore}
        />
      </div>
      <p className="mt-3 text-sm font-medium">{t.buyerSocials}</p>
      <SocialList socials={buyer.socials} />
      {buyer.status === "pending" ? (
        canSelect ? (
          <div className="mt-3">
            <InboxActions id={buyer.id} status={buyer.status} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">{t.pending}</p>
        )
      ) : null}
      {buyer.status === "accepted" ? (
        <>
          <p className="mt-3 text-sm font-medium text-blue">{t.chosen}</p>
          <div className="mt-3">
            <TradeGuide variant="compact" />
          </div>
          <VerifyTradeForm
            id={buyer.id}
            role="seller"
            myVerified={Boolean(buyer.sellerVerifiedAt)}
            otherVerified={Boolean(buyer.buyerVerifiedAt)}
          />
          {buyer.sellerVerifiedAt ? (
            <RateBuyerForm
              id={buyer.id}
              rating={buyer.rating}
              feedback={buyer.feedback}
              trustScore={buyer.buyerTrustScore}
            />
          ) : null}
        </>
      ) : null}
      {buyer.status === "declined" ? (
        <p className="mt-3 text-sm text-muted">{t.declined}</p>
      ) : null}
      <ReportForm
        userId={buyer.buyerId}
        listingId={buyer.listingId}
        signedIn
        onboarded
        label={t.reportBuyer}
      />
    </div>
  );
}

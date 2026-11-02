"use client";

import { useState, useTransition } from "react";
import { useT } from "@/components/i18n-provider";
import { verifyTradeAction } from "@/lib/actions";

export function VerifyTradeForm({
  id,
  role,
  myVerified,
  otherVerified,
}: {
  id: string;
  role: "buyer" | "seller";
  myVerified: boolean;
  otherVerified: boolean;
}) {
  const { t } = useT();
  const [pending, start] = useTransition();
  const [verified, setVerified] = useState(myVerified);
  const bothDone = verified && otherVerified;

  if (bothDone) {
    return (
      <p className="mt-3 rounded-xl bg-blue-soft/60 p-3 text-sm font-medium text-blue">
        {t.tradeVerifiedBoth}
      </p>
    );
  }

  if (verified) {
    return (
      <p className="mt-3 rounded-xl border border-line p-3 text-sm text-muted">
        {t.tradeVerifiedWaiting}
      </p>
    );
  }

  return (
    <div className="mt-3 grid gap-2 rounded-xl border border-line p-3">
      <p className="text-sm font-medium">{t.verifyTrade}</p>
      <p className="text-sm text-muted">
        {role === "seller" ? t.verifyTradeSellerBody : t.verifyTradeBuyerBody}
      </p>
      <button
        type="button"
        className="btn btn-tangerine !py-2 text-sm"
        disabled={pending}
        onClick={() => {
          start(async () => {
            const result = await verifyTradeAction(id);
            if ("ok" in result) setVerified(true);
          });
        }}
      >
        {pending ? t.saving : t.verifyTradeAction}
      </button>
    </div>
  );
}

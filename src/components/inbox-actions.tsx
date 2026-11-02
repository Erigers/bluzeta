"use client";

import { useTransition } from "react";
import { useT } from "@/components/i18n-provider";
import { decideInterestAction } from "@/lib/actions";

export function InboxActions({ id, status }: { id: string; status: string }) {
  const { t } = useT();
  const [pending, start] = useTransition();
  if (status !== "pending") {
    return (
      <p className="text-sm text-muted">
        {status === "accepted" ? t.accepted : t.declined}
      </p>
    );
  }
  return (
    <div className="flex gap-2">
      <button
        className="btn btn-blue !py-2 text-sm"
        disabled={pending}
        onClick={() => start(() => { void decideInterestAction(id, "accepted"); })}
      >
        {t.selectBuyer}
      </button>
      <button
        className="btn btn-ghost !py-2 text-sm"
        disabled={pending}
        onClick={() => start(() => { void decideInterestAction(id, "declined"); })}
      >
        {t.decline}
      </button>
    </div>
  );
}

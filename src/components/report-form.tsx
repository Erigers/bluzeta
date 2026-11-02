"use client";

import { useState, useTransition } from "react";
import { useT } from "@/components/i18n-provider";
import { reportReasons } from "@/lib/constants";
import {
  reportListingAction,
  reportUserAction,
} from "@/lib/actions";

export function ReportForm({
  listingId,
  userId,
  signedIn,
  onboarded,
  label,
}: {
  listingId?: string;
  userId?: string;
  signedIn: boolean;
  onboarded: boolean;
  label?: string;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<"sent" | "already" | null>(null);
  const [pending, start] = useTransition();

  if (!signedIn) return null;

  const title = userId ? (label ?? t.reportUser) : t.reportListing;

  return (
    <div className="mt-4">
      {done ? (
        <p className="text-sm text-muted">
          {done === "already" ? t.reportAlready : t.reportSent}
        </p>
      ) : open ? (
        <form
          className="grid gap-3 rounded-2xl border border-line p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            start(async () => {
              const result = userId
                ? await reportUserAction(userId, formData, listingId)
                : listingId
                  ? await reportListingAction(listingId, formData)
                  : { error: "invalid" as const };
              if ("ok" in result) {
                setDone(result.already ? "already" : "sent");
                setOpen(false);
              }
            });
          }}
        >
          <p className="font-medium">{title}</p>
          <label className="field">
            <span>{t.reportReason}</span>
            <select name="reason" required defaultValue="spam">
              {reportReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {t.reportReasons[reason]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t.reportDetails}</span>
            <textarea name="details" rows={3} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="btn btn-tangerine"
              disabled={!onboarded || pending}
            >
              {pending ? t.saving : t.reportSubmit}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              {t.cancel}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="text-sm text-muted underline"
          onClick={() => setOpen(true)}
        >
          {label ?? t.report}
        </button>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useT } from "@/components/i18n-provider";
import { expressInterestAction } from "@/lib/actions";

export function InterestedButton({
  listingId,
  signedIn,
  onboarded,
  isOwner,
  initialStatus,
}: {
  listingId: string;
  signedIn: boolean;
  onboarded: boolean;
  isOwner: boolean;
  initialStatus: string | null;
}) {
  const { t } = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(initialStatus);

  if (isOwner) {
    return <p className="text-sm text-muted">{t.ownListing}</p>;
  }

  if (status) {
    return (
      <p className="rounded-full bg-blue-soft px-4 py-3 text-center font-medium text-blue">
        {status === "pending" ? t.interestSent : t.alreadyInterested}
      </p>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-tangerine w-full"
      disabled={pending}
      onClick={() => {
        if (!signedIn) {
          router.push("/sign-in");
          return;
        }
        if (!onboarded) {
          router.push("/onboarding");
          return;
        }
        start(async () => {
          const result = await expressInterestAction(listingId);
          if ("ok" in result) setStatus("pending");
        });
      }}
    >
      {t.interested}
    </button>
  );
}

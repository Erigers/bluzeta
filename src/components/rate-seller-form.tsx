"use client";

import { useState, useTransition } from "react";
import { ScoreSlider } from "@/components/score-slider";
import { useT } from "@/components/i18n-provider";
import { rateSellerAction } from "@/lib/actions";

export function RateSellerForm({
  id,
  trustScore,
  feedback,
}: {
  id: string;
  trustScore: number | null;
  feedback: string | null;
}) {
  const { t } = useT();
  const [pending, start] = useTransition();
  const [score, setScore] = useState(trustScore ?? 8);
  const [comment, setComment] = useState(feedback ?? "");
  const [saved, setSaved] = useState(trustScore != null);

  if (saved || trustScore != null) {
    return (
      <div className="mt-3 rounded-xl bg-blue-soft/60 p-3">
        <p className="text-sm font-medium">{t.feedbackSaved}</p>
        <div className="mt-3">
          <ScoreSlider
            icon="trust"
            label={t.trustScore}
            value={trustScore ?? score}
            max={10}
            readOnly
          />
        </div>
        {feedback || comment ? (
          <p className="mt-2 text-sm text-muted">{feedback || comment}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="mt-3 grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await rateSellerAction(id, score, comment);
          if ("ok" in result) setSaved(true);
        });
      }}
    >
      <p className="text-sm font-medium">{t.rateSeller}</p>
      <p className="text-sm text-muted">{t.rateSellerBody}</p>
      <ScoreSlider
        icon="trust"
        label={t.trustScore}
        value={score}
        max={10}
        onChange={setScore}
      />
      <label className="field">
        <span>{t.feedbackLabel}</span>
        <textarea
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t.feedbackPlaceholder}
        />
      </label>
      <button className="btn btn-blue !py-2 text-sm" disabled={pending}>
        {pending ? t.saving : t.sendFeedback}
      </button>
    </form>
  );
}

"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState, useTransition } from "react";
import { useT } from "@/components/i18n-provider";
import { ScoreSlider } from "@/components/score-slider";
import { ThumbLabel } from "@/components/reputation-pills";
import { rateBuyerAction } from "@/lib/actions";
import type { ThumbRating } from "@/lib/data";

export function RateBuyerForm({
  id,
  rating,
  feedback,
  trustScore,
}: {
  id: string;
  rating: ThumbRating | null;
  feedback: string | null;
  trustScore: number | null;
}) {
  const { t } = useT();
  const [pending, start] = useTransition();
  const [choice, setChoice] = useState<ThumbRating | null>(rating);
  const [score, setScore] = useState(trustScore ?? 8);
  const [comment, setComment] = useState(feedback ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedTrust, setSavedTrust] = useState(trustScore != null);

  const complete = Boolean((rating || choice) && (trustScore != null || savedTrust));
  if (complete) {
    const shown = rating ?? choice;
    return (
      <div className="mt-3 rounded-xl bg-blue-soft/60 p-3">
        <p className="text-sm font-medium">{t.feedbackSaved}</p>
        {shown ? (
          <div className="mt-1">
            <ThumbLabel rating={shown} />
          </div>
        ) : null}
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
        const nextChoice = choice ?? rating;
        if (!nextChoice) return;
        if (nextChoice === "down" && !comment.trim() && !feedback) {
          setError(t.feedbackRequired);
          return;
        }
        start(async () => {
          const result = await rateBuyerAction(
            id,
            nextChoice,
            comment || feedback || "",
            score,
          );
          if ("error" in result && result.error === "feedback") {
            setError(t.feedbackRequired);
            return;
          }
          if ("ok" in result) {
            setSavedTrust(true);
            setError(null);
          }
        });
      }}
    >
      <p className="text-sm font-medium">{t.rateBuyer}</p>
      <p className="text-sm text-muted">{t.rateBuyerBody}</p>
      {rating ? (
        <ThumbLabel rating={rating} />
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn btn-ghost !py-2 text-sm ${choice === "up" ? "!border-blue !text-blue" : ""}`}
            aria-pressed={choice === "up"}
            onClick={() => {
              setChoice("up");
              setError(null);
            }}
          >
            <ThumbsUp className="size-4" aria-hidden />
            {t.thumbsUp}
          </button>
          <button
            type="button"
            className={`btn btn-ghost !py-2 text-sm ${choice === "down" ? "!border-tangerine !text-tangerine" : ""}`}
            aria-pressed={choice === "down"}
            onClick={() => {
              setChoice("down");
              setError(null);
            }}
          >
            <ThumbsDown className="size-4" aria-hidden />
            {t.thumbsDown}
          </button>
        </div>
      )}
      <ScoreSlider
        icon="trust"
        label={t.trustScore}
        value={score}
        max={10}
        onChange={setScore}
      />
      {!feedback ? (
        <label className="field">
          <span>{t.feedbackLabel}</span>
          <textarea
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={t.feedbackPlaceholder}
          />
        </label>
      ) : (
        <p className="text-sm text-muted">{feedback}</p>
      )}
      {error ? <p className="text-sm text-tangerine">{error}</p> : null}
      <button
        className="btn btn-blue !py-2 text-sm"
        disabled={pending || !(choice || rating)}
      >
        {pending ? t.saving : t.sendFeedback}
      </button>
    </form>
  );
}

"use client";

import { ScoreSlider } from "@/components/score-slider";
import { useT } from "@/components/i18n-provider";

export function ProfileScores({
  communicationScore,
  trustScore,
}: {
  communicationScore: number;
  trustScore: number;
}) {
  const { t } = useT();
  return (
    <div className="grid gap-5 rounded-2xl border border-line bg-card p-4">
      <ScoreSlider
        icon="communication"
        label={t.communicationScore}
        value={communicationScore}
        max={10000}
        readOnly
        formatValue={(value) => value.toLocaleString()}
      />
      <ScoreSlider
        icon="trust"
        label={t.trustScore}
        value={trustScore}
        max={10}
        step={0.1}
        readOnly
        formatValue={(value) =>
          Number.isInteger(value) ? String(value) : value.toFixed(1)
        }
      />
    </div>
  );
}

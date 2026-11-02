"use client";

import { useT } from "@/components/i18n-provider";

export function TradeGuide({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const { t } = useT();
  const steps = [
    { title: t.tradeStep1Title, body: t.tradeStep1Body },
    { title: t.tradeStep2Title, body: t.tradeStep2Body },
    { title: t.tradeStep3Title, body: t.tradeStep3Body },
    { title: t.tradeStep4Title, body: t.tradeStep4Body },
  ];

  return (
    <section
      className={`rounded-2xl border border-line bg-blue-soft/40 ${
        variant === "compact" ? "p-3" : "p-5"
      }`}
    >
      <h2
        className={`font-semibold ${variant === "compact" ? "text-base" : "text-lg"}`}
      >
        {t.tradeGuideTitle}
      </h2>
      <p className="mt-1 text-sm text-muted">{t.tradeGuideIntro}</p>
      <ol className="mt-4 grid gap-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span
              className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-blue text-xs font-semibold text-white"
              aria-hidden
            >
              {index + 1}
            </span>
            <div>
              <p className="font-medium">{step.title}</p>
              <p className="mt-0.5 text-sm text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

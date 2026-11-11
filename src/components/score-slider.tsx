"use client";

import { MenuIcon, type MenuIconName } from "@/components/menu-icon";

export function ScoreSlider({
  icon,
  label,
  value,
  max,
  min = 0,
  step = 1,
  name,
  readOnly = false,
  onChange,
  formatValue,
}: {
  icon: MenuIconName;
  label: string;
  value: number;
  max: number;
  min?: number;
  step?: number;
  name?: string;
  readOnly?: boolean;
  onChange?: (value: number) => void;
  formatValue?: (value: number) => string;
}) {
  const safe = Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : min;
  const shown = formatValue ? formatValue(safe) : String(safe);
  const percent = max === min ? 0 : ((safe - min) / (max - min)) * 100;

  return (
    <div className={`score-slider ${readOnly ? "score-slider--readonly" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 text-sm font-medium">
          <span className="score-slider__icon">
            <MenuIcon name={icon} size={34} className="size-8" />
          </span>
          {label}
        </span>
        <span className="score-slider__value tabular-nums">
          {shown}
          <span className="score-slider__max">
            {" "}
            / {formatValue ? formatValue(max) : max}
          </span>
        </span>
      </div>
      <div className="score-slider__track-wrap">
        <div className="score-slider__rail" aria-hidden />
        <div
          className="score-slider__fill"
          style={{ width: `${percent}%` }}
          aria-hidden
        />
        <input
          type="range"
          className="score-range"
          name={name}
          min={min}
          max={max}
          step={step}
          value={safe}
          disabled={readOnly}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={safe}
          onChange={
            readOnly || !onChange
              ? undefined
              : (event) => onChange(Number(event.currentTarget.value))
          }
        />
      </div>
    </div>
  );
}

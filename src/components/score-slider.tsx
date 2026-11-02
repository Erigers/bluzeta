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
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <MenuIcon name={icon} size={28} className="size-7" />
          {label}
        </span>
        <span className="tabular-nums text-sm text-muted">
          {shown}
          <span className="text-muted/70"> / {formatValue ? formatValue(max) : max}</span>
        </span>
      </div>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-[7px] left-0 right-0 rounded-full bg-line"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-[7px] left-0 rounded-full bg-blue"
          style={{ width: `${percent}%` }}
          aria-hidden
        />
        <input
          type="range"
          className="score-range relative z-10 w-full"
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
          aria-readonly={readOnly || undefined}
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

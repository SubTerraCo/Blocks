"use client";

import { SlideToggle } from "./slide-toggle";

export interface HourFormat24FieldProps {
  value: boolean;
  onChange: (use24Hour: boolean) => void;
}

/** N-0032 · 24-hour time format for timeline + clock picker. */
export function HourFormat24Field({ value, onChange }: HourFormat24FieldProps) {
  return (
    <div
      className="flex items-center justify-between gap-3"
      data-testid="hour-format-24-field"
    >
      <div>
        <p className="text-sm font-medium text-text-primary">24-Hour Time</p>
        <p className="text-xs text-text-muted">
          Timeline labels and event clock use 24-hour format when enabled
        </p>
      </div>
      <SlideToggle
        checked={value}
        onChange={onChange}
        data-testid="hour-format-24-toggle"
        aria-label="24-hour time format"
      />
    </div>
  );
}

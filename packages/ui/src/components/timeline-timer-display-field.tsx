"use client";

import type { TimelineTimerDisplayMode } from "@blocks/core";
import { cn } from "../lib/utils";

export interface TimelineTimerDisplayFieldProps {
  value: TimelineTimerDisplayMode;
  onChange: (mode: TimelineTimerDisplayMode) => void;
  className?: string;
}

export function TimelineTimerDisplayField({
  value,
  onChange,
  className,
}: TimelineTimerDisplayFieldProps) {
  return (
    <div className={cn("space-y-2", className)} data-testid="timeline-timer-display-setting">
      <label className="text-sm font-medium text-text-primary" htmlFor="timeline-timer-display">
        Timeline tracking clock
      </label>
      <p className="text-xs text-text-muted">
        On active timeline task cards, show elapsed time or time remaining until the estimated
        duration ends.
      </p>
      <select
        id="timeline-timer-display"
        data-testid="timeline-timer-display-select"
        value={value}
        onChange={(e) => onChange(e.target.value as TimelineTimerDisplayMode)}
        className="w-full rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-magenta focus:outline-none"
      >
        <option value="elapsed">Count up (elapsed)</option>
        <option value="remaining">Count down (remaining)</option>
      </select>
    </div>
  );
}

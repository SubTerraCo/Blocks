"use client";

import { cn } from "../lib/utils";

export interface TimelineSnapDelayFieldProps {
  value: number;
  onChange: (seconds: number) => void;
  className?: string;
}

const SNAP_DELAY_OPTIONS = [
  0, 5, 10, 15, 20, 30, 45, 60, 90, 120,
] as const;

export function TimelineSnapDelayField({
  value,
  onChange,
  className,
}: TimelineSnapDelayFieldProps) {
  return (
    <div className={cn("space-y-2", className)} data-testid="timeline-snap-delay-setting">
      <label className="text-sm font-medium text-text-primary" htmlFor="timeline-snap-delay">
        Timeline snap delay
      </label>
      <p className="text-xs text-text-muted">
        After you scroll the timeline, wait this long before smoothly recentering on the current
        time. <strong>0</strong> keeps your scroll position until you leave and return to
        Timeline.
      </p>
      <select
        id="timeline-snap-delay"
        data-testid="timeline-snap-delay-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-magenta focus:outline-none"
      >
        {SNAP_DELAY_OPTIONS.map((sec) => (
          <option key={sec} value={sec}>
            {sec === 0 ? "Off (manual scroll sticks)" : `${sec} seconds`}
          </option>
        ))}
      </select>
    </div>
  );
}

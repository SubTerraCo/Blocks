"use client";

import {
  TIMELINE_NOW_BAR_MAX_RATIO,
  TIMELINE_NOW_BAR_MIN_RATIO,
  TIMELINE_NOW_BAR_SNAP_POINTS,
  softSnapTimelineNowBarRatio,
} from "@blocks/core";
import { cn } from "../lib/utils";

export interface TimelineNowBarOffsetFieldProps {
  value: number;
  onChange: (ratio: number) => void;
  className?: string;
}

const SNAP_LABELS: Record<string, string> = {
  "0.3333333333333333": "⅓ top",
  "0.5": "Center",
  "0.6666666666666666": "⅓ bottom",
};

function ratioLabel(ratio: number): string {
  const key = String(ratio);
  if (SNAP_LABELS[key]) return SNAP_LABELS[key];
  if (ratio <= 0.26) return "¼ top";
  if (ratio >= 0.74) return "¼ bottom";
  return `${Math.round(ratio * 100)}%`;
}

export function TimelineNowBarOffsetField({
  value,
  onChange,
  className,
}: TimelineNowBarOffsetFieldProps) {
  const snapped = softSnapTimelineNowBarRatio(value);

  return (
    <div className={cn("space-y-3", className)} data-testid="timeline-now-bar-offset-setting">
      <div>
        <label
          className="text-sm font-medium text-text-primary"
          htmlFor="timeline-now-bar-offset"
        >
          Now-bar position
        </label>
        <p className="mt-1 text-xs text-text-muted">
          Where the current-time line sits in the timeline viewport. Snap-back keeps this
          offset when recentering.
        </p>
      </div>

      <input
        id="timeline-now-bar-offset"
        type="range"
        data-testid="timeline-now-bar-offset-slider"
        min={TIMELINE_NOW_BAR_MIN_RATIO}
        max={TIMELINE_NOW_BAR_MAX_RATIO}
        step={0.01}
        value={value}
        onChange={(e) => onChange(softSnapTimelineNowBarRatio(Number(e.target.value)))}
        className="w-full accent-accent-magenta"
      />

      <div className="flex justify-between text-[10px] text-text-muted">
        <span>¼ top</span>
        {TIMELINE_NOW_BAR_SNAP_POINTS.map((p) => (
          <span key={p}>{ratioLabel(p)}</span>
        ))}
        <span>¼ bottom</span>
      </div>

      <p className="text-xs text-text-secondary" data-testid="timeline-now-bar-offset-value">
        Current: <strong>{ratioLabel(snapped)}</strong>
      </p>
    </div>
  );
}

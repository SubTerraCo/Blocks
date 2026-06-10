"use client";

import { CalendarPlus } from "lucide-react";
import { cn } from "../lib/utils";
import {
  TIMELINE_BOTTOM_ACTION_BTN,
  TIMELINE_BOTTOM_ACTION_FIXED,
} from "../lib/timeline-bottom-actions";

export interface TimelineScheduleFabProps {
  doingCount: number;
  onSchedule: () => void;
  isScheduling?: boolean;
  className?: string;
  /** fixed = bottom-right row with view toggle; absolute = inside timeline viewport */
  variant?: "fixed" | "absolute";
}

/** B-0008: schedule doing tasks — accent square, bottom-right */
export function TimelineScheduleFab({
  doingCount,
  onSchedule,
  isScheduling = false,
  className,
  variant = "fixed",
}: TimelineScheduleFabProps) {
  if (doingCount <= 0) return null;

  const label = isScheduling
    ? "Scheduling doing tasks"
    : `Schedule ${doingCount} doing task${doingCount > 1 ? "s" : ""}`;

  return (
    <button
      type="button"
      data-testid="timeline-schedule-fab"
      disabled={isScheduling}
      aria-label={label}
      title={label}
      onClick={() => void onSchedule()}
      className={cn(
        variant === "fixed"
          ? cn(TIMELINE_BOTTOM_ACTION_FIXED, "right-4")
          : "absolute bottom-4 right-4 z-30",
        TIMELINE_BOTTOM_ACTION_BTN,
        className,
      )}
    >
      <CalendarPlus className="h-5 w-5 shrink-0" />
    </button>
  );
}

"use client";

import { Calendar, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import {
  TIMELINE_BOTTOM_ACTION_BTN,
  TIMELINE_BOTTOM_ACTION_FIXED,
} from "../lib/timeline-bottom-actions";
import type { TimelineViewMode } from "../hooks/use-timeline-view-mode";

export interface TimelineViewToggleProps {
  mode: TimelineViewMode;
  onToggle: () => void;
  className?: string;
}

export function TimelineViewToggle({ mode, onToggle, className }: TimelineViewToggleProps) {
  const isCalendar = mode === "calendar";

  return (
    <button
      type="button"
      data-testid="timeline-view-toggle"
      aria-label={isCalendar ? "Switch to timeline view" : "Switch to calendar view"}
      title={isCalendar ? "Timeline" : "Calendar"}
      onClick={onToggle}
      className={cn(TIMELINE_BOTTOM_ACTION_FIXED, "left-4", TIMELINE_BOTTOM_ACTION_BTN, className)}
    >
      {isCalendar ? <Clock className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
    </button>
  );
}

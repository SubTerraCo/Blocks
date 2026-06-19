"use client";

import { isSameCalendarDay, type WeekStartsOn } from "@blocks/core";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

/** Calendar gutter width — matches Month/Today column in week strip (N-0042). */
export const CALENDAR_GUTTER_CLASS = "w-10 shrink-0";

export interface TimelineWeekStripProps {
  days: Date[];
  selectedDay: Date;
  /** Fractional cell index for scroll-synced sliding indicator (0–6) */
  selectionOffset?: number;
  /** When true, indicator tracks scroll without CSS transition */
  isScrollTransitioning?: boolean;
  weekStartsOn?: WeekStartsOn;
  onSelectDay: (day: Date) => void;
  onJumpToToday?: () => void;
  /** N-0034 · Left gutter: month abbrev stacked above Today */
  gutter?: { monthAbbrev: string };
  className?: string;
}

export function TimelineWeekStrip({
  days,
  selectedDay,
  selectionOffset,
  isScrollTransitioning = false,
  onSelectDay,
  onJumpToToday,
  gutter,
  className,
}: TimelineWeekStripProps) {
  const today = new Date();
  const rowRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({ cellWidth: 0, step: 0 });

  const effectiveOffset =
    selectionOffset ??
    Math.max(
      0,
      days.findIndex((day) => isSameCalendarDay(day, selectedDay)),
    );

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const measure = () => {
      const first = row.querySelector<HTMLElement>("[data-week-day-cell]");
      if (!first) return;
      const cellWidth = first.offsetWidth;
      const gap = parseFloat(getComputedStyle(row).columnGap || getComputedStyle(row).gap || "0");
      setMetrics({ cellWidth, step: cellWidth + gap });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [days.length]);

  const showIndicator = metrics.step > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-border-default bg-bg-secondary px-2 py-2",
        className,
      )}
      data-testid="timeline-week-strip"
      data-scroll-transitioning={isScrollTransitioning ? "true" : "false"}
      data-selection-offset={effectiveOffset.toFixed(3)}
    >
      {gutter && onJumpToToday ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 border-r border-border-default/60 pr-2",
            CALENDAR_GUTTER_CLASS,
          )}
          data-testid="calendar-strip-gutter"
        >
          <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
            {gutter.monthAbbrev}
          </span>
          <button
            type="button"
            data-testid="timeline-jump-today"
            onClick={onJumpToToday}
            className="rounded px-1 py-0.5 text-[10px] font-semibold text-accent-magenta hover:bg-bg-tertiary"
          >
            Today
          </button>
        </div>
      ) : (
        onJumpToToday && (
          <button
            type="button"
            data-testid="timeline-jump-today"
            onClick={onJumpToToday}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-accent-magenta hover:bg-bg-tertiary"
          >
            Today
          </button>
        )
      )}
      <div ref={rowRef} className="relative flex flex-1 gap-1">
        {showIndicator && (
          <div
            data-testid="timeline-week-strip-indicator"
            className={cn(
              "pointer-events-none absolute bottom-0 top-0 z-0 rounded-lg bg-accent-magenta",
              !isScrollTransitioning && "transition-transform duration-200 ease-out",
            )}
            style={{
              width: metrics.cellWidth,
              transform: `translateX(${effectiveOffset * metrics.step}px)`,
            }}
          />
        )}
        {days.map((day) => {
          const isToday = isSameCalendarDay(day, today);
          const isSelected = isSameCalendarDay(day, selectedDay);
          const label = day.toLocaleDateString(undefined, { weekday: "short" });
          const dateNum = day.getDate();

          return (
            <button
              key={day.toISOString()}
              type="button"
              data-week-day-cell
              data-testid={`timeline-week-day-${day.getDay()}`}
              onClick={() => onSelectDay(day)}
              className={cn(
                "relative z-10 flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-1.5 text-xs transition-colors",
                isSelected && !showIndicator
                  ? "bg-accent-magenta text-white"
                  : isToday
                    ? "text-accent-magenta"
                    : "text-text-secondary hover:bg-bg-tertiary/60",
                isSelected && showIndicator && "text-white",
              )}
            >
              <span className="font-medium">{label}</span>
              <span className="text-sm font-semibold">{dateNum}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

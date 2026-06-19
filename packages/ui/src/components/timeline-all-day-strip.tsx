"use client";

import type { Task } from "@blocks/core";
import { getAllDayUserEventsForDay } from "@blocks/core";
import { cn, getPriorityColor } from "../lib/utils";

export interface TimelineAllDayStripProps {
  tasks: Task[];
  day: Date;
  onTaskPress?: (task: Task) => void;
  className?: string;
}

/** N-0026: sticky all-day user events for a calendar day on the timeline. */
export function TimelineAllDayStrip({
  tasks,
  day,
  onTaskPress,
  className,
}: TimelineAllDayStripProps) {
  const events = getAllDayUserEventsForDay(tasks, day);
  if (events.length === 0) return null;

  return (
    <div
      className={cn(
        "sticky top-10 z-[15] border-b border-border-default bg-bg-secondary/95 px-2 py-1.5 backdrop-blur",
        className,
      )}
      data-testid="timeline-all-day-strip"
      data-day={day.toISOString()}
    >
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
        All day
      </div>
      <div className="flex flex-wrap gap-1">
        {events.map((task) => (
          <button
            key={task.id}
            type="button"
            data-testid={`timeline-all-day-event-${task.id}`}
            onClick={() => onTaskPress?.(task)}
            className="flex max-w-full items-center gap-1 rounded-md border border-border-default bg-bg-tertiary/80 px-2 py-1 text-left text-xs font-semibold text-text-primary hover:bg-bg-tertiary"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            />
            <span className="truncate">{task.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

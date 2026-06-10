"use client";

import { useMemo, useState } from "react";
import type { Task } from "@blocks/core";
import {
  formatDayKey,
  formatMonthTitle,
  getCalendarMonthGrid,
  getOrderedWeekDays,
  getTasksDueOnDay,
  isSameCalendarDay,
  isSameMonth,
  WEEK_DAY_LABELS,
  type WeekStartsOn,
} from "@blocks/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getPriorityColor } from "../lib/utils";

export interface DueDateCalendarProps {
  tasks: Task[];
  weekStartsOn?: WeekStartsOn;
  onTaskPress?: (task: Task) => void;
  className?: string;
}

const MAX_TASKS_PER_CELL = 3;

export function DueDateCalendar({
  tasks,
  weekStartsOn = "monday",
  onTaskPress,
  className,
}: DueDateCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(today));

  const weeks = useMemo(
    () => getCalendarMonthGrid(monthAnchor, weekStartsOn),
    [monthAnchor, weekStartsOn],
  );

  const weekDayHeaders = getOrderedWeekDays(weekStartsOn);

  const shiftMonth = (delta: number) => {
    setMonthAnchor((current) => {
      const next = new Date(current);
      next.setMonth(next.getMonth() + delta);
      return startOfMonth(next);
    });
  };

  return (
    <div
      className={cn("flex h-full flex-col bg-bg-primary", className)}
      data-testid="due-date-calendar"
    >
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <button
          type="button"
          data-testid="calendar-prev-month"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="rounded-lg p-2 text-text-secondary hover:bg-bg-secondary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-text-primary" data-testid="calendar-month-title">
          {formatMonthTitle(monthAnchor)}
        </h2>
        <button
          type="button"
          data-testid="calendar-next-month"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="rounded-lg p-2 text-text-secondary hover:bg-bg-secondary"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-border-default bg-bg-secondary px-2 py-2 text-center text-xs font-medium text-text-secondary">
        {weekDayHeaders.map((key) => (
          <span key={key}>{WEEK_DAY_LABELS[key]}</span>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-28 pt-2">
        <div className="grid grid-cols-7 gap-1">
          {weeks.flatMap((week) =>
            week.map((day) => {
              const dayTasks = getTasksDueOnDay(tasks, day);
              const inMonth = isSameMonth(day, monthAnchor);
              const isToday = isSameCalendarDay(day, today);
              const dayKey = formatDayKey(day);

              return (
                <div
                  key={dayKey}
                  data-testid={`calendar-day-${dayKey}`}
                  className={cn(
                    "min-h-[88px] rounded-lg border border-border-default/60 p-1",
                    inMonth ? "bg-bg-secondary" : "bg-bg-primary/40 opacity-60",
                    isToday && "ring-2 ring-accent-magenta/60",
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 text-right text-xs font-semibold",
                      isToday ? "text-accent-magenta" : "text-text-secondary",
                    )}
                  >
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, MAX_TASKS_PER_CELL).map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        data-testid={`calendar-task-${task.id}`}
                        onClick={() => onTaskPress?.(task)}
                        className={cn(
                          "flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[10px] leading-tight hover:bg-bg-tertiary",
                          task.status === "done" && "opacity-60 line-through",
                        )}
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        />
                        <span className="truncate text-text-primary">{task.name}</span>
                      </button>
                    ))}
                    {dayTasks.length > MAX_TASKS_PER_CELL && (
                      <div className="px-1 text-[10px] text-text-tertiary">
                        +{dayTasks.length - MAX_TASKS_PER_CELL} more
                      </div>
                    )}
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Task, WeekStartsOn } from "@blocks/core";
import {
  formatDayKey,
  generateContinuousCalendarWeeks,
  getTasksForCalendarDay,
  isSameCalendarDay,
  startOfDay,
} from "@blocks/core";
import { cn, getPriorityColor } from "../lib/utils";
import { readAccentColorsFromStorage } from "../lib/accent-colors";
import { useCalendarScrollResetToken } from "../hooks/use-timeline-view-mode";
import { CALENDAR_GUTTER_CLASS, TimelineWeekStrip } from "./timeline-week-strip";

export interface ContinuousScrollCalendarProps {
  tasks: Task[];
  weekStartsOn?: WeekStartsOn;
  onTaskPress?: (task: Task) => void;
  className?: string;
}

const MAX_TASKS_PER_CELL = 4;
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CALENDAR_LOOKBACK_WEEKS = 52;
const CALENDAR_FORWARD_WEEKS = 52;

function getWeekStart(day: Date, weekStartsOn: WeekStartsOn): Date {
  const start = startOfDay(day);
  if (weekStartsOn === "sunday") {
    start.setDate(start.getDate() - start.getDay());
  } else {
    const dow = start.getDay();
    start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));
  }
  return start;
}

function daysInWeek(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function dayCellFillClass(day: Date, today: Date, selectedDay: Date): string {
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  const selectedMonth = selectedDay.getMonth();
  const selectedYear = selectedDay.getFullYear();
  const dayMonth = day.getMonth();
  const dayYear = day.getFullYear();

  const inTodayMonth = dayMonth === todayMonth && dayYear === todayYear;
  const inSelectedMonth = dayMonth === selectedMonth && dayYear === selectedYear;

  if (inTodayMonth) return "bg-bg-secondary";
  if (inSelectedMonth) return "bg-bg-tertiary/80";
  return "bg-black/40";
}

function dayHeaderAccentStyle(
  isToday: boolean,
  isSelected: boolean,
  accentPrimary: string,
  accentSecondary: string,
): React.CSSProperties | undefined {
  if (isToday) return { backgroundColor: accentPrimary };
  if (isSelected) return { backgroundColor: accentSecondary };
  return undefined;
}

/** N-0027 + N-0030 + N-0038–N-0039 + N-0042 · Scroll calendar. */
export function ContinuousScrollCalendar({
  tasks,
  weekStartsOn = "monday",
  onTaskPress,
  className,
}: ContinuousScrollCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDay, setSelectedDay] = useState(today);
  const [accents, setAccents] = useState(readAccentColorsFromStorage);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentWeekRef = useRef<HTMLDivElement>(null);
  const scrollResetToken = useCalendarScrollResetToken();

  /** N-0042 · Always show current calendar week on sticky strip */
  const stripDays = useMemo(
    () => daysInWeek(getWeekStart(today, weekStartsOn)),
    [today, weekStartsOn],
  );

  const weeks = useMemo(
    () => generateContinuousCalendarWeeks(today, weekStartsOn, CALENDAR_LOOKBACK_WEEKS, CALENDAR_FORWARD_WEEKS),
    [today, weekStartsOn],
  );

  const gutterMonth = MONTH_SHORT[today.getMonth()] ?? "Jan";

  useEffect(() => {
    currentWeekRef.current?.scrollIntoView({ block: "center" });
  }, [weeks.length, scrollResetToken]);

  useEffect(() => {
    const refresh = () => setAccents(readAccentColorsFromStorage());
    window.addEventListener("blocks-settings-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("blocks-settings-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const jumpToToday = useCallback(() => {
    setSelectedDay(today);
    currentWeekRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [today]);

  const handleSelectStripDay = useCallback((day: Date) => {
    setSelectedDay(startOfDay(day));
    const key = formatDayKey(day);
    const el = scrollRef.current?.querySelector(`[data-calendar-day-cell="${key}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  return (
    <div
      className={cn("flex h-full flex-col bg-bg-primary", className)}
      data-testid="continuous-scroll-calendar"
    >
      <TimelineWeekStrip
        days={stripDays}
        selectedDay={selectedDay}
        weekStartsOn={weekStartsOn}
        onSelectDay={handleSelectStripDay}
        onJumpToToday={jumpToToday}
        gutter={{ monthAbbrev: gutterMonth }}
        className="sticky top-0 z-20 shrink-0"
      />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-28"
        data-testid="due-date-calendar"
      >
        {weeks.map((week) => {
          const isNowWeek = week.days.some((d) => isSameCalendarDay(d, today));
          const weekStartKey = formatDayKey(week.weekStart);

          return (
            <section
              key={week.weekKey}
              ref={isNowWeek ? currentWeekRef : undefined}
              data-testid={`calendar-week-${week.weekKey}`}
              data-calendar-week-start={weekStartKey}
              data-current-week={isNowWeek ? "true" : undefined}
            >
              <div className="flex gap-0 px-2 py-1">
                <div className={CALENDAR_GUTTER_CLASS} aria-hidden />
                <div className="grid min-w-0 flex-1 grid-cols-7 gap-1">
                  {week.days.map((day) => {
                    const dayTasks = getTasksForCalendarDay(tasks, day);
                    const isToday = isSameCalendarDay(day, today);
                    const isSelected = isSameCalendarDay(day, selectedDay);
                    const dayKey = formatDayKey(day);
                    const isFirstOfMonth = day.getDate() === 1;
                    const headerStyle = dayHeaderAccentStyle(
                      isToday,
                      isSelected && !isToday,
                      accents.accentPrimary,
                      accents.accentSecondary,
                    );

                    return (
                      <button
                        key={dayKey}
                        type="button"
                        data-testid={`calendar-day-${dayKey}`}
                        data-calendar-day-cell={dayKey}
                        onClick={() => setSelectedDay(startOfDay(day))}
                        className={cn(
                          "flex min-h-[144px] flex-col overflow-hidden rounded-lg border border-border-default/60 text-left transition-colors",
                          dayCellFillClass(day, today, selectedDay),
                          isToday && "ring-2 ring-[var(--accent-primary)]/60",
                          isSelected && !isToday && "ring-1 ring-[var(--accent-secondary)]",
                        )}
                      >
                        <div
                          className={cn(
                            "min-h-[1.75rem] px-1 py-0.5",
                            !headerStyle && "bg-bg-primary/20",
                          )}
                          style={headerStyle}
                          data-testid={
                            isToday
                              ? "calendar-day-header-today"
                              : isSelected
                                ? "calendar-day-header-selected"
                                : undefined
                          }
                        >
                          <div
                            className={cn(
                              "flex items-start justify-end gap-1 text-right font-semibold leading-none",
                              isToday || isSelected ? "text-white" : "text-text-secondary",
                            )}
                          >
                            {isFirstOfMonth && (
                              <span
                                className={cn(
                                  "text-xs font-bold uppercase tracking-wide",
                                  isToday || isSelected ? "text-white/90" : "text-text-tertiary",
                                )}
                              >
                                {MONTH_SHORT[day.getMonth()]}
                              </span>
                            )}
                            <span className="text-2xl tabular-nums">{day.getDate()}</span>
                          </div>
                        </div>

                        <div className="flex-1 space-y-0.5 p-1">
                          {dayTasks.slice(0, MAX_TASKS_PER_CELL).map((task) => (
                            <span
                              key={task.id}
                              role="button"
                              tabIndex={0}
                              data-testid={`calendar-task-${task.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskPress?.(task);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.stopPropagation();
                                  onTaskPress?.(task);
                                }
                              }}
                              className={cn(
                                "flex w-full items-start gap-1 rounded px-0.5 py-0.5 text-left hover:bg-bg-tertiary/80",
                                task.isEvent && "font-semibold",
                                task.status === "done" && "opacity-60 line-through",
                              )}
                            >
                              <span
                                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: task.isEvent
                                    ? "#64748b"
                                    : getPriorityColor(task.priority),
                                }}
                              />
                              <span className="line-clamp-2 text-sm leading-snug text-text-primary">
                                {task.name}
                              </span>
                            </span>
                          ))}
                          {dayTasks.length > MAX_TASKS_PER_CELL && (
                            <div className="px-0.5 text-xs text-text-tertiary">
                              +{dayTasks.length - MAX_TASKS_PER_CELL} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

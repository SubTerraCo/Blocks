"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Task, WeekStartsOn } from "@blocks/core";
import {
  clampTimelineNowBarRatio,
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
  selectedDay?: Date;
  onSelectedDayChange?: (day: Date) => void;
  snapDelaySec?: number;
  nowBarViewportRatio?: number;
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

export function getCalendarMonthTone(day: Date, today: Date): "gray1" | "gray2" | "gray3" {
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  const dayMonth = day.getMonth();
  const dayYear = day.getFullYear();

  const inTodayMonth = dayMonth === todayMonth && dayYear === todayYear;
  if (inTodayMonth) return "gray2";

  // Jan/Mar/... => Gray1, Feb/Apr/... => Gray3.
  return dayMonth % 2 === 0 ? "gray1" : "gray3";
}

function dayCellFillClass(day: Date, today: Date): string {
  const tone = getCalendarMonthTone(day, today);

  if (tone === "gray1") return "bg-bg-secondary/90";
  if (tone === "gray2") return "bg-bg-tertiary/85";
  return "bg-bg-primary/85";
}

/** N-0027 + N-0030 + N-0038–N-0039 + N-0042 · Scroll calendar. */
export function ContinuousScrollCalendar({
  tasks,
  weekStartsOn = "monday",
  selectedDay: selectedDayProp,
  onSelectedDayChange,
  snapDelaySec = 15,
  nowBarViewportRatio = 0.5,
  onTaskPress,
  className,
}: ContinuousScrollCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [internalSelectedDay, setInternalSelectedDay] = useState(today);
  const selectedDay = useMemo(
    () => startOfDay(selectedDayProp ?? internalSelectedDay),
    [internalSelectedDay, selectedDayProp],
  );
  const [accents, setAccents] = useState(readAccentColorsFromStorage);
  const scrollRef = useRef<HTMLDivElement>(null);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollResetToken = useCalendarScrollResetToken();

  const setSelectedDay = useCallback(
    (day: Date) => {
      const normalized = startOfDay(day);
      setInternalSelectedDay(normalized);
      onSelectedDayChange?.(normalized);
    },
    [onSelectedDayChange],
  );

  const scrollDayIntoView = useCallback(
    (day: Date, behavior: ScrollBehavior = "auto") => {
      const container = scrollRef.current;
      if (!container) return false;

      const key = formatDayKey(day);
      const el = container.querySelector<HTMLElement>(`[data-calendar-day-cell="${key}"]`);
      if (!el) return false;

      const containerRect = container.getBoundingClientRect();
      const cellRect = el.getBoundingClientRect();
      const ratio = clampTimelineNowBarRatio(nowBarViewportRatio);
      const top =
        cellRect.top -
        containerRect.top +
        container.scrollTop -
        container.clientHeight * ratio +
        cellRect.height / 2;

      container.scrollTo({ top: Math.max(0, top), behavior });
      return true;
    },
    [nowBarViewportRatio],
  );

  /** Snap strip to selected day week (calendar snap-to-day parity). */
  const stripDays = useMemo(
    () => daysInWeek(getWeekStart(selectedDay, weekStartsOn)),
    [selectedDay, weekStartsOn],
  );

  const weeks = useMemo(
    () => generateContinuousCalendarWeeks(today, weekStartsOn, CALENDAR_LOOKBACK_WEEKS, CALENDAR_FORWARD_WEEKS),
    [today, weekStartsOn],
  );

  const gutterMonth = MONTH_SHORT[today.getMonth()] ?? "Jan";

  useEffect(() => {
    scrollDayIntoView(selectedDay, "auto");
  }, [selectedDay, scrollResetToken, weeks.length, scrollDayIntoView]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scheduleSnap = () => {
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      if (snapDelaySec <= 0) return;
      snapTimerRef.current = setTimeout(() => {
        scrollDayIntoView(selectedDay, "smooth");
      }, snapDelaySec * 1000);
    };

    container.addEventListener("wheel", scheduleSnap, { passive: true });
    container.addEventListener("touchmove", scheduleSnap, { passive: true });
    return () => {
      container.removeEventListener("wheel", scheduleSnap);
      container.removeEventListener("touchmove", scheduleSnap);
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, [selectedDay, snapDelaySec, scrollDayIntoView]);

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
    scrollDayIntoView(today, "smooth");
  }, [scrollDayIntoView, setSelectedDay, today]);

  const handleSelectStripDay = useCallback((day: Date) => {
    setSelectedDay(startOfDay(day));
    scrollDayIntoView(day, "smooth");
  }, [scrollDayIntoView, setSelectedDay]);

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
          const weekStartKey = formatDayKey(week.weekStart);

          return (
            <section
              key={week.weekKey}
              data-testid={`calendar-week-${week.weekKey}`}
              data-calendar-week-start={weekStartKey}
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
                    const numberPillStyle: React.CSSProperties | undefined = isToday
                      ? { backgroundColor: "var(--accent-magenta)" }
                      : isSelected
                        ? { backgroundColor: accents.accentSecondary }
                        : undefined;

                    return (
                      <button
                        key={dayKey}
                        type="button"
                        data-testid={`calendar-day-${dayKey}`}
                        data-calendar-day-cell={dayKey}
                        onClick={() => {
                          setSelectedDay(startOfDay(day));
                          scrollDayIntoView(day, "smooth");
                        }}
                        className={cn(
                          "flex min-h-[144px] flex-col overflow-hidden rounded-lg border border-border-default/60 transition-colors",
                          dayCellFillClass(day, today),
                        )}
                      >
                        {/* N-0052 pass 3: absolute horizontal center at top — avoid flex/text-align drift on Desktop */}
                        <div className="relative h-12 w-full shrink-0">
                          {isFirstOfMonth && (
                            <span
                              data-testid={`calendar-month-label-${dayKey}`}
                              className="pointer-events-none absolute left-1 top-1 z-10 text-[17px] font-extrabold uppercase leading-none tracking-wide text-text-secondary"
                            >
                              {MONTH_SHORT[day.getMonth()]}
                            </span>
                          )}
                          <span
                            data-testid={`calendar-day-number-${dayKey}`}
                            className={cn(
                              "pointer-events-none absolute left-1/2 top-1 z-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-xl text-2xl font-semibold tabular-nums",
                              isToday || isSelected ? "text-white" : "text-text-secondary",
                            )}
                            style={numberPillStyle}
                          >
                            {day.getDate()}
                          </span>
                        </div>

                        <div className="flex-1 space-y-0.5 p-1 text-left">
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

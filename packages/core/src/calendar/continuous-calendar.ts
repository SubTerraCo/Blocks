// ============================================================================
// N-0027 · Continuous scroll calendar helpers
// ============================================================================

import type { WeekStartsOn } from "../settings/week-start";
import { addDays, formatDayKey, startOfDay } from "../timeline/timeline-window";
import { getTasksForCalendarDay } from "../timeline/user-event-blocks";

export { getTasksForCalendarDay };

export interface CalendarWeekRow {
  weekStart: Date;
  days: Date[];
  weekKey: string;
}

/** Build consecutive weeks for vertical scroll (lookback + forward). N-0033: ±52 weeks ≈ 12 months. */
export function generateContinuousCalendarWeeks(
  now: Date = new Date(),
  weekStartsOn: WeekStartsOn = "monday",
  lookbackWeeks = 52,
  forwardWeeks = 52,
): CalendarWeekRow[] {
  const today = startOfDay(now);
  const currentWeekStart = getWeekStart(today, weekStartsOn);
  const firstWeekStart = addDays(currentWeekStart, -lookbackWeeks * 7);
  const totalWeeks = lookbackWeeks + forwardWeeks + 1;
  const rows: CalendarWeekRow[] = [];

  for (let w = 0; w < totalWeeks; w++) {
    const weekStart = addDays(firstWeekStart, w * 7);
    const days: Date[] = [];
    for (let d = 0; d < 7; d++) {
      days.push(addDays(weekStart, d));
    }
    rows.push({
      weekStart,
      days,
      weekKey: formatDayKey(weekStart),
    });
  }
  return rows;
}

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

/** Dual-month label when week spans two months (e.g. "June / July 2026"). */
export function formatDualMonthHeader(days: Date[]): string {
  const months = new Map<string, Date>();
  for (const day of days) {
    const key = `${day.getFullYear()}-${day.getMonth()}`;
    if (!months.has(key)) months.set(key, day);
  }
  const labels = [...months.values()].map((d) =>
    d.toLocaleDateString(undefined, { month: "long" }),
  );
  const year = days[0]?.getFullYear() ?? new Date().getFullYear();
  if (labels.length <= 1) {
    return days[0]?.toLocaleDateString(undefined, { month: "long", year: "numeric" }) ?? "";
  }
  return `${labels.join(" / ")} ${year}`;
}

export function isCurrentCalendarWeek(weekDays: Date[], now: Date = new Date()): boolean {
  const todayKey = formatDayKey(now);
  return weekDays.some((d) => formatDayKey(d) === todayKey);
}

export function getOrderedWeekDayLabels(weekStartsOn: WeekStartsOn): string[] {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (weekStartsOn === "monday") {
    return [...labels.slice(1), labels[0]!];
  }
  return labels;
}

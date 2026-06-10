// ============================================================================
// BLOCKS - Due-date calendar helpers (N-0005 / SB.EN.02.050.010)
// ============================================================================

import type { Task } from "../types";
import type { WeekStartsOn } from "../settings/week-start";
import { startOfDay, formatDayKey } from "../timeline/timeline-window";

export function getTasksWithDueDate(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.dueDate != null);
}

export function parseLocalDateInput(dateStr: string): Date {  const parts = dateStr.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return startOfDay(new Date(y, m - 1, d));
}

export function getTasksDueOnDay(tasks: Task[], day: Date): Task[] {
  const dayKey = formatDayKey(day);
  return getTasksWithDueDate(tasks)
    .filter((task) => formatDayKey(task.dueDate!) === dayKey)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());
}

/** Month grid (4–6 weeks) aligned to weekStartsOn */
export function getCalendarMonthGrid(
  monthAnchor: Date,
  weekStartsOn: WeekStartsOn = "monday",
): Date[][] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  let gridStart = startOfDay(firstOfMonth);
  if (weekStartsOn === "monday") {
    const day = gridStart.getDay();
    gridStart.setDate(gridStart.getDate() - (day === 0 ? 6 : day - 1));
  } else {
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  }

  const weeks: Date[][] = [];
  const cursor = new Date(gridStart);

  while (weeks.length < 6) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    const lastInWeek = week[6]!;
    if (lastInWeek >= lastOfMonth && weeks.length >= 4) break;
  }

  return weeks;
}

export function isSameMonth(day: Date, monthAnchor: Date): boolean {
  return (
    day.getFullYear() === monthAnchor.getFullYear() &&
    day.getMonth() === monthAnchor.getMonth()
  );
}

export function formatMonthTitle(monthAnchor: Date): string {
  return monthAnchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export { formatDayKey };

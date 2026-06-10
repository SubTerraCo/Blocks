// ============================================================================
// BLOCKS - Rolling timeline window (N-0003 / SB.EN.02.040.*)
// ============================================================================

import type { Task, TimeBlock } from "../types";
import { calculateDuration } from "../types";

export const DEFAULT_TIMELINE_WINDOW_DAYS = 7;

export interface TimelineWindow {
  start: Date;
  end: Date;
}

export interface TimelineHourSlot {
  startTime: Date;
  dayKey: string;
  hour: number;
  slotIndex: number;
}

export function formatDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTimelineWindow(
  now: Date = new Date(),
  days: number = DEFAULT_TIMELINE_WINDOW_DAYS
): TimelineWindow {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() + days);

  return { start, end };
}

export function isDateInTimelineWindow(date: Date, window: TimelineWindow): boolean {
  return date.getTime() >= window.start.getTime() && date.getTime() <= window.end.getTime();
}

export function isTimelineTaskInWindow(
  task: Task,
  window: TimelineWindow,
): boolean {
  if (task.status !== "doing" || !task.scheduledAt) return false;
  return isDateInTimelineWindow(new Date(task.scheduledAt), window);
}

export function getTimelineTasksInWindow(
  tasks: Task[],
  window: TimelineWindow,
): Task[] {
  return tasks.filter((t) => isTimelineTaskInWindow(t, window));
}

export function tasksToTimeBlocksInWindow(
  tasks: Task[],
  window: TimelineWindow,
): TimeBlock[] {
  return getTimelineTasksInWindow(tasks, window).map((task) => {
    const duration = task.duration ?? calculateDuration(task.blockSize, task.blockCount);
    const startTime = new Date(task.scheduledAt!);
    return {
      id: task.id,
      type: "task" as const,
      startTime,
      endTime: new Date(startTime.getTime() + duration * 60000),
      task,
    };
  });
}

export function generateRollingTimelineSlots(
  window: TimelineWindow,
): TimelineHourSlot[] {
  const slots: TimelineHourSlot[] = [];
  const cursor = new Date(window.start);
  cursor.setMinutes(0, 0, 0);

  let slotIndex = 0;
  while (cursor.getTime() <= window.end.getTime()) {
    slots.push({
      startTime: new Date(cursor),
      dayKey: formatDayKey(cursor),
      hour: cursor.getHours(),
      slotIndex: slotIndex++,
    });
    cursor.setHours(cursor.getHours() + 1);
  }
  return slots;
}

export function isSameHour(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate() &&
    a.getHours() === b.getHours()
  );
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Seven days for week strip, ordered by weekStartsOn */
export function getWeekStripDays(
  anchor: Date,
  weekStartsOn: "monday" | "sunday" = "monday",
): Date[] {
  const days: Date[] = [];
  const start = startOfDay(anchor);

  if (weekStartsOn === "sunday") {
    start.setDate(start.getDate() - start.getDay());
  } else {
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
  }

  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
}

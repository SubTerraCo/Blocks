// ============================================================================
// BLOCKS - Timeline Service
// Daily timeline reset and scheduling helpers
// ============================================================================

import type { Task, TimeBlock } from "../types";
import {
  DEFAULT_TIMELINE_WINDOW_DAYS,
  getTimelineWindow,
  isDateInTimelineWindow,
  tasksToTimeBlocksInWindow,
} from "./timeline-window";
export {
  DEFAULT_TIMELINE_WINDOW_DAYS,
  formatDayKey,
  getTimelineWindow,
  isDateInTimelineWindow,
  isTimelineTaskInWindow,
  getTimelineTasksInWindow,
  tasksToTimeBlocksInWindow,
  generateRollingTimelineSlots,
  isSameHour,
  startOfDay,
  addDays,
  getWeekStripDays,
} from "./timeline-window";
export type { TimelineWindow, TimelineHourSlot } from "./timeline-window";
export {
  computeMidnightBoundaryProgress,
  dayKeyToDate,
  previousDayKey,
  weekStripSelectionOffset,
} from "./scroll-day-sync";
export type { MidnightBoundary, MidnightBoundaryProgress } from "./scroll-day-sync";

/**
 * Returns true if a date falls on the given calendar day (local time).
 */
export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Timeline visibility: doing tasks scheduled within the rolling window.
 */
export function isTimelineTask(
  task: Task,
  day: Date = new Date(),
  windowDays: number = DEFAULT_TIMELINE_WINDOW_DAYS,
): boolean {
  if (task.status !== "doing" || !task.scheduledAt) return false;
  const window = getTimelineWindow(day, windowDays);
  return isDateInTimelineWindow(new Date(task.scheduledAt), window);
}

/**
 * @deprecated Use getTimelineTasksInWindow for rolling timeline.
 */
export function getTimelineTasksForDay(tasks: Task[], day: Date = new Date()): Task[] {
  return tasks.filter((t) => {
    if (t.status !== "doing" || !t.scheduledAt) return false;
    return isSameCalendarDay(new Date(t.scheduledAt), day);
  });
}

/**
 * Convert doing tasks with schedules into timeline blocks (rolling ±windowDays).
 */
export function tasksToTimeBlocks(
  tasks: Task[],
  now: Date = new Date(),
  windowDays: number = DEFAULT_TIMELINE_WINDOW_DAYS,
): TimeBlock[] {
  const window = getTimelineWindow(now, windowDays);
  return tasksToTimeBlocksInWindow(tasks, window);
}

/**
 * Updates applied when removing a task from the timeline (keeps it on Kanban).
 * Moves status from doing → todo; task remains in the board.
 */
export function removeFromTimelineUpdates(): Pick<Task, "status" | "startedAt" | "updatedAt"> & {
  scheduledAt: undefined;
} {
  return {
    status: "todo",
    scheduledAt: undefined,
    startedAt: undefined,
    updatedAt: new Date(),
  };
}

/**
 * Updates applied when placing a task on the timeline.
 */
export function addToTimelineUpdates(
  scheduledAt: Date,
  duration?: number
): Pick<Task, "status" | "scheduledAt" | "updatedAt"> & { duration?: number } {
  return {
    status: "doing",
    scheduledAt,
    duration,
    updatedAt: new Date(),
  };
}

export interface ClearTimelineResult {
  clearedCount: number;
  updatedTasks: Task[];
}

/**
 * Clear timeline at 00:00 — remove doing tasks from prior calendar days.
 * Moves "doing" tasks back to "todo" for fresh daily planning.
 */
export function clearTimelineForNewDay(tasks: Task[], now: Date = new Date()): ClearTimelineResult {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const updatedTasks: Task[] = [];
  let clearedCount = 0;

  for (const task of tasks) {
    if (!task.scheduledAt) continue;
    if (task.status !== "doing") continue;

    const scheduledDate = new Date(task.scheduledAt);
    if (scheduledDate >= startOfToday) continue;

    updatedTasks.push({
      ...task,
      ...removeFromTimelineUpdates(),
    });
    clearedCount++;
  }

  return { clearedCount, updatedTasks };
}

/** @deprecated Use clearTimelineForNewDay */
export const clearDailyTimeline = clearTimelineForNewDay;

/**
 * Milliseconds until next local midnight (00:00).
 */
export function msUntilMidnight(from: Date = new Date()): number {
  const next = new Date(from);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - from.getTime();
}

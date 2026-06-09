// ============================================================================
// BLOCKS - Timeline Service
// Daily timeline reset and scheduling helpers
// ============================================================================

import type { Task, TimeBlock } from "../types";
import { calculateDuration } from "../types";

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
 * Timeline visibility rule: only tasks with status=doing and a schedule.
 */
export function isTimelineTask(task: Task, day: Date = new Date()): boolean {
  if (task.status !== "doing" || !task.scheduledAt) return false;
  return isSameCalendarDay(new Date(task.scheduledAt), day);
}

/**
 * Tasks visible on today's timeline (status=doing only).
 */
export function getTimelineTasksForDay(tasks: Task[], day: Date = new Date()): Task[] {
  return tasks.filter((t) => isTimelineTask(t, day));
}

/**
 * Convert doing tasks with schedules into timeline blocks.
 */
export function tasksToTimeBlocks(tasks: Task[], day: Date = new Date()): TimeBlock[] {
  return getTimelineTasksForDay(tasks, day).map((task) => {
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

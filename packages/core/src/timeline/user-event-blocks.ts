// ============================================================================
// N-0026 · User events on timeline (Task.isEvent)
// ============================================================================

import type { Task, TimeBlock } from "../types";
import { calculateDuration } from "../types";
import type { TimelineWindow } from "./timeline-window";
import { formatDayKey, isDateInTimelineWindow, startOfDay } from "./timeline-window";

export function isUserEventTask(task: Task): boolean {
  return task.isEvent === true;
}

/** All-day until explicit times are set (default for new events). */
export function isAllDayUserEvent(task: Task): boolean {
  if (!task.isEvent) return false;
  if (task.eventAllDay) return true;
  if (task.eventStartAt || task.eventEndAt) return false;
  return !!(task.dueDate || task.scheduledAt);
}

/** Inclusive calendar-day span for an event. */
export function getUserEventDaySpan(task: Task): { startDay: Date; endDay: Date } | null {
  if (!isUserEventTask(task)) return null;

  const anchor = task.eventStartAt ?? task.dueDate ?? task.scheduledAt;
  if (!anchor) return null;

  if (isAllDayUserEvent(task)) {
    const startDay = startOfDay(anchor);
    const endAnchor = task.eventEndAt ?? task.dueDate ?? anchor;
    const endDay = startOfDay(endAnchor);
    if (endDay.getTime() < startDay.getTime()) return { startDay, endDay: startDay };
    return { startDay, endDay };
  }

  const start = task.eventStartAt ?? task.scheduledAt!;
  const end =
    task.eventEndAt ??
    new Date(
      start.getTime() +
        (task.duration ?? calculateDuration(task.blockSize, task.blockCount)) * 60_000,
    );
  return { startDay: startOfDay(start), endDay: startOfDay(end) };
}

export function userEventOccursOnDay(task: Task, day: Date): boolean {
  const span = getUserEventDaySpan(task);
  if (!span) return false;
  const key = formatDayKey(day);
  const startKey = formatDayKey(span.startDay);
  const endKey = formatDayKey(span.endDay);
  return key >= startKey && key <= endKey;
}

export function getAllDayUserEventsForDay(tasks: Task[], day: Date): Task[] {
  return tasks
    .filter((t) => isUserEventTask(t) && isAllDayUserEvent(t) && userEventOccursOnDay(t, day))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Timed user events as timeline blocks (excludes all-day — those use sticky strip). */
export function userEventsToTimedBlocks(
  tasks: Task[],
  window: TimelineWindow,
): TimeBlock[] {
  const blocks: TimeBlock[] = [];

  for (const task of tasks) {
    if (!isUserEventTask(task) || isAllDayUserEvent(task)) continue;

    const startTime = task.eventStartAt ?? task.scheduledAt;
    if (!startTime) continue;

    const endTime =
      task.eventEndAt ??
      new Date(
        startTime.getTime() +
          (task.duration ?? calculateDuration(task.blockSize, task.blockCount)) * 60_000,
      );

    if (
      !isDateInTimelineWindow(startTime, window) &&
      !isDateInTimelineWindow(endTime, window) &&
      endTime.getTime() < window.start.getTime()
    ) {
      continue;
    }
    if (startTime.getTime() > window.end.getTime()) continue;

    blocks.push({
      id: task.id,
      type: "task",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      task,
    });
  }

  return blocks;
}

/** Tasks shown on a calendar day (due dates + events). */
export function getTasksForCalendarDay(tasks: Task[], day: Date): Task[] {
  const dayKey = formatDayKey(day);
  const dueTasks = tasks.filter(
    (t) => t.dueDate && formatDayKey(t.dueDate) === dayKey && !t.isEvent,
  );
  const eventTasks = tasks.filter((t) => isUserEventTask(t) && userEventOccursOnDay(t, day));
  const seen = new Set<string>();
  const merged: Task[] = [];
  for (const t of [...eventTasks, ...dueTasks]) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    merged.push(t);
  }
  return merged.sort((a, b) => a.name.localeCompare(b.name));
}

export function rescheduleUserEventTask(
  task: Task,
  newStart: Date,
): Pick<Task, "eventStartAt" | "eventEndAt" | "scheduledAt" | "updatedAt"> {
  const prevStart = task.eventStartAt ?? task.scheduledAt ?? newStart;
  const prevEnd =
    task.eventEndAt ??
    new Date(
      prevStart.getTime() +
        (task.duration ?? calculateDuration(task.blockSize, task.blockCount)) * 60_000,
    );
  const durationMs = prevEnd.getTime() - prevStart.getTime();
  const eventStartAt = new Date(newStart);
  const eventEndAt = new Date(newStart.getTime() + durationMs);
  return {
    eventStartAt,
    eventEndAt,
    scheduledAt: eventStartAt,
    updatedAt: new Date(),
  };
}

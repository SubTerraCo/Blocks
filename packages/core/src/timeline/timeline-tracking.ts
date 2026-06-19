import { calculateDuration } from "../types";
import type { Task } from "../types";
import { getDownstreamTimelineTasks } from "./timeline-scroll";
import { isSameCalendarDay } from "./timeline-service";
import { startOfDay } from "./timeline-window";

/** N-0037 · Next scheduled doing task on today's timeline after anchor task ends. */
export function getNextScheduledTimelineTask(
  tasks: Task[],
  anchorTaskId: string,
): Task | null {
  const anchor = tasks.find((t) => t.id === anchorTaskId);
  if (!anchor?.scheduledAt) return null;

  const today = startOfDay(new Date());
  const anchorEndMs =
    new Date(anchor.scheduledAt).getTime() + getTaskDurationMinutes(anchor) * 60_000;

  const candidates = tasks
    .filter(
      (t) =>
        t.id !== anchorTaskId &&
        t.status === "doing" &&
        t.scheduledAt &&
        isSameCalendarDay(new Date(t.scheduledAt), today),
    )
    .filter((t) => new Date(t.scheduledAt!).getTime() >= anchorEndMs)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime(),
    );

  return candidates[0] ?? null;
}

/** Minutes for a task (blockSize × blockCount or duration override). */
export function getTaskDurationMinutes(task: Task): number {
  if (task.duration != null) return task.duration;
  return calculateDuration(task.blockSize, task.blockCount);
}

/** Ms from `now` until the task's scheduled end (0 if already past end). */
export function getRemainingTimelineSlotMs(task: Task, now: Date = new Date()): number {
  if (!task.scheduledAt) return 0;
  const startMs = new Date(task.scheduledAt).getTime();
  const endMs = startMs + getTaskDurationMinutes(task) * 60_000;
  return Math.max(0, endMs - now.getTime());
}

/** Shift downstream doing tasks on the timeline by deltaMs (negative = earlier). */
export function buildDownstreamScheduleShiftUpdates(
  tasks: Task[],
  anchorTaskId: string,
  deltaMs: number,
  excludeTaskIds: string[] = [],
): { id: string; scheduledAt: Date }[] {
  if (deltaMs === 0) return [];
  const exclude = new Set([anchorTaskId, ...excludeTaskIds]);
  return getDownstreamTimelineTasks(tasks, anchorTaskId)
    .filter((t) => !exclude.has(t.id) && t.scheduledAt)
    .map((t) => ({
      id: t.id,
      scheduledAt: new Date(new Date(t.scheduledAt!).getTime() + deltaMs),
    }));
}

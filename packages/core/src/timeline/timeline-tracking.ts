import { calculateDuration } from "../types";
import type { Task } from "../types";
import { getDownstreamTimelineTasks } from "./timeline-scroll";

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

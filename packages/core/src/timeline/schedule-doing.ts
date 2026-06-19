// ============================================================================
// N-0025 · Schedule Doing tasks — lock current task engine
// ============================================================================

import type { Task, TaskScheduleBehavior } from "../types";
import { calculateDuration } from "../types";

export interface ScheduleDoingTasksInput {
  doingTasks: Task[];
  behavior: TaskScheduleBehavior;
  /** Task under now-bar with active timer (desktop/web tracking) */
  activeTrackingTaskId?: string;
  isTimerRunning?: boolean;
  now?: Date;
}

export interface ScheduleDoingPlan {
  /** Doing tasks to assign new scheduledAt (sorted by priority) */
  tasksToSchedule: Task[];
  /** Where sequential scheduling starts */
  startAt: Date;
  /** Task id skipped when lock_current applies */
  lockedTaskId?: string;
}

/**
 * Resolve which Doing tasks to schedule and from what time.
 * Lock current: skip now-bar + running-timer task; start after its block ends.
 */
export function planScheduleDoingTasks(input: ScheduleDoingTasksInput): ScheduleDoingPlan {
  const now = input.now ?? new Date();
  const sorted = [...input.doingTasks]
    .filter((t) => !t.isEvent)
    .sort(
    (a, b) => parseInt(a.priority, 10) - parseInt(b.priority, 10),
  );

  if (input.behavior === "reschedule_all") {
    return { tasksToSchedule: sorted, startAt: new Date(now) };
  }

  const lockActive =
    input.activeTrackingTaskId &&
    input.isTimerRunning &&
    sorted.some((t) => t.id === input.activeTrackingTaskId);

  if (!lockActive) {
    return { tasksToSchedule: sorted, startAt: new Date(now) };
  }

  const lockedId = input.activeTrackingTaskId!;
  const locked = sorted.find((t) => t.id === lockedId);
  const tasksToSchedule = sorted.filter((t) => t.id !== lockedId);

  let startAt = new Date(now);
  if (locked?.scheduledAt) {
    const duration =
      locked.duration ?? calculateDuration(locked.blockSize, locked.blockCount);
    const lockedEnd = locked.scheduledAt.getTime() + duration * 60_000;
    startAt = new Date(Math.max(now.getTime(), lockedEnd));
  }

  return { tasksToSchedule, startAt, lockedTaskId: lockedId };
}

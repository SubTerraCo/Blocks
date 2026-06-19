"use client";

import { useCallback, useState } from "react";
import type { CalendarScheduleConflict, Task, TimeBlock } from "@blocks/core";
import {
  findOverlappingCalendarEvents,
  getTaskDurationMinutes,
} from "@blocks/core";

export interface PendingScheduleConflict {
  taskId: string;
  taskName: string;
  scheduledAt: Date;
  durationMinutes: number;
  calendarConflicts: CalendarScheduleConflict[];
}

export interface UseTimelineScheduleOptions {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  onCommit: (taskId: string, scheduledAt: Date) => Promise<void>;
}

/**
 * N-0020 · Gate timeline scheduling when calendar events overlap.
 * Task-task overlaps are handled by push-back in the task store.
 */
export function useTimelineSchedule({
  tasks,
  timeBlocks,
  onCommit,
}: UseTimelineScheduleOptions) {
  const [pending, setPending] = useState<PendingScheduleConflict | null>(null);

  const requestSchedule = useCallback(
    async (taskId: string, scheduledAt: Date, durationMinutes?: number) => {
      const task = tasks.find((t) => t.id === taskId);
      const duration =
        durationMinutes ??
        (task ? getTaskDurationMinutes(task) : 30);
      const calendarConflicts = findOverlappingCalendarEvents(
        timeBlocks,
        scheduledAt,
        duration,
      );

      if (calendarConflicts.length > 0) {
        setPending({
          taskId,
          taskName: task?.name ?? "Task",
          scheduledAt,
          durationMinutes: duration,
          calendarConflicts,
        });
        return;
      }

      await onCommit(taskId, scheduledAt);
    },
    [tasks, timeBlocks, onCommit],
  );

  const confirmPending = useCallback(async () => {
    if (!pending) return;
    const { taskId, scheduledAt } = pending;
    setPending(null);
    await onCommit(taskId, scheduledAt);
  }, [pending, onCommit]);

  const cancelPending = useCallback(() => {
    setPending(null);
  }, []);

  return {
    pending,
    requestSchedule,
    confirmPending,
    cancelPending,
  };
}

/** Check calendar conflicts before creating a new doing task (Quick Blocks). */
export function checkCalendarConflictsForNewTask(
  timeBlocks: TimeBlock[],
  scheduledAt: Date,
  durationMinutes: number,
): CalendarScheduleConflict[] {
  return findOverlappingCalendarEvents(timeBlocks, scheduledAt, durationMinutes);
}

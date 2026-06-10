// ============================================================================
// N-0008 · Timeline auto-track + pause-sync (desktop)
// ============================================================================

import { useEffect, useRef } from "react";
import type { Task, TimeBlock } from "@blocks/core";
import { useTaskStore } from "@blocks/ui";
import { useTimerStore } from "./useTimerStore";

/** Auto-start tracking when now enters a scheduled task block */
export function useTimelineAutoTrack(
  timeBlocks: TimeBlock[],
  now: Date,
  enabled: boolean,
) {
  const startTimer = useTimerStore((s) => s.startTimer);
  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const isRunning = useTimerStore((s) => s.isRunning);
  const isPaused = useTimerStore((s) => s.isPaused);
  const lastAutoIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const nowMs = now.getTime();
    const block = timeBlocks.find(
      (b) =>
        b.type === "task" &&
        b.task &&
        nowMs >= b.startTime.getTime() &&
        nowMs < b.endTime.getTime(),
    );

    if (!block?.task) {
      lastAutoIdRef.current = null;
      return;
    }

    const taskId = block.task.id;
    if (activeTaskId === taskId && (isRunning || isPaused)) {
      lastAutoIdRef.current = taskId;
      return;
    }

    if (lastAutoIdRef.current === taskId) return;

    lastAutoIdRef.current = taskId;
    startTimer(block.task);
  }, [enabled, now.getTime(), timeBlocks, activeTaskId, isRunning, isPaused, startTimer]);
}

/** While timer paused, shift anchor task + downstream schedules with wall clock */
export function useTimelinePauseSync(_tasks: Task[], enabled: boolean) {
  const isPaused = useTimerStore((s) => s.isPaused);
  const timelinePauseSync = useTimerStore((s) => s.timelinePauseSync);
  const shiftTimelineSchedules = useTaskStore((s) => s.shiftTimelineSchedules);
  const lastShiftRef = useRef(0);

  useEffect(() => {
    if (!enabled || !isPaused || !timelinePauseSync.pauseStartedAt) {
      lastShiftRef.current = 0;
      return;
    }

    const { baselineScheduleMs } = timelinePauseSync;
    if (!baselineScheduleMs) return;

    const apply = () => {
      const shiftMs = Date.now() - timelinePauseSync.pauseStartedAt!;
      if (shiftMs === lastShiftRef.current) return;
      lastShiftRef.current = shiftMs;

      const updates = Object.entries(baselineScheduleMs).map(([id, baseMs]) => ({
        id,
        scheduledAt: new Date(baseMs + shiftMs),
      }));
      void shiftTimelineSchedules(updates);
    };

    apply();
    const interval = window.setInterval(apply, 1000);
    return () => clearInterval(interval);
  }, [
    enabled,
    isPaused,
    timelinePauseSync.pauseStartedAt,
    timelinePauseSync.baselineScheduleMs,
    shiftTimelineSchedules,
  ]);
}

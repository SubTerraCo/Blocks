import { useMemo } from "react";
import type { Task } from "@blocks/core";
import {
  DEFAULT_TIMELINE_WINDOW_DAYS,
  generateRollingTimelineSlots,
  getTimelineWindow,
  tasksToTimeBlocks,
} from "@blocks/core";

export function useRollingTimeline(
  tasks: Task[],
  now: Date = new Date(),
  windowDays: number = DEFAULT_TIMELINE_WINDOW_DAYS,
) {
  const window = useMemo(
    () => getTimelineWindow(now, windowDays),
    [now.getTime(), windowDays],
  );

  const slots = useMemo(
    () => generateRollingTimelineSlots(window),
    [window.start.getTime(), window.end.getTime()],
  );

  const timeBlocks = useMemo(
    () => tasksToTimeBlocks(tasks, now, windowDays),
    [tasks, now.getTime(), windowDays],
  );

  return { window, slots, timeBlocks, windowDays };
}

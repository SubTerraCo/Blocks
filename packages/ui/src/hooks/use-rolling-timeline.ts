import { useMemo } from "react";
import type { Task, CalendarEvent } from "@blocks/core";
import {
  DEFAULT_TIMELINE_WINDOW_DAYS,
  generateRollingTimelineSlots,
  getTimelineWindow,
  tasksToTimeBlocks,
  calendarEventsToTimeBlocks,
  mergeTimelineBlocks,
  userEventsToTimedBlocks,
} from "@blocks/core";

export function useRollingTimeline(
  tasks: Task[],
  now: Date = new Date(),
  windowDays: number = DEFAULT_TIMELINE_WINDOW_DAYS,
  calendarEvents: CalendarEvent[] = [],
) {
  const window = useMemo(
    () => getTimelineWindow(now, windowDays),
    [now.getTime(), windowDays],
  );

  const slots = useMemo(
    () => generateRollingTimelineSlots(window),
    [window.start.getTime(), window.end.getTime()],
  );

  const timeBlocks = useMemo(() => {
    const taskBlocks = tasksToTimeBlocks(tasks, now, windowDays);
    const userEventBlocks = userEventsToTimedBlocks(tasks, window);
    const eventBlocks = calendarEventsToTimeBlocks(calendarEvents, window);
    return mergeTimelineBlocks(
      mergeTimelineBlocks(taskBlocks, userEventBlocks),
      eventBlocks,
    );
  }, [tasks, calendarEvents, now.getTime(), windowDays, window]);

  return { window, slots, timeBlocks, windowDays };
}

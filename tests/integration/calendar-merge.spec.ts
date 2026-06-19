// N-0017 · Calendar merge helpers (core, no browser)
import { test, expect } from "@playwright/test";
import {
  calendarEventsToTimeBlocks,
  mergeTimelineBlocks,
  type CalendarEvent,
  type TimeBlock,
} from "@blocks/core";

function makeEvent(
  id: string,
  start: Date,
  durationMin: number,
): CalendarEvent {
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  return {
    id,
    calendarId: "primary",
    title: `Event ${id}`,
    startTime: start,
    endTime: end,
    isAllDay: false,
    isReadOnly: true,
    source: "google",
    color: "#039be5",
  };
}

test.describe("SB.EN.02.036 · Calendar merge @N-0017 @core", () => {
  test("calendarEventsToTimeBlocks filters to window", () => {
    const base = new Date("2026-06-09T10:00:00");
    const window = {
      start: new Date("2026-06-09T09:00:00"),
      end: new Date("2026-06-09T18:00:00"),
    };
    const events = [
      makeEvent("in", base, 30),
      makeEvent("out", new Date("2026-06-08T10:00:00"), 30),
    ];
    const blocks = calendarEventsToTimeBlocks(events, window);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.type).toBe("calendar_event");
    expect(blocks[0]?.calendarEvent?.title).toBe("Event in");
  });

  test("mergeTimelineBlocks sorts by start time", () => {
    const t1 = new Date("2026-06-09T14:00:00");
    const t2 = new Date("2026-06-09T11:00:00");
    const taskBlocks: TimeBlock[] = [
      {
        id: "task-1",
        type: "task",
        startTime: t1,
        endTime: new Date(t1.getTime() + 30 * 60 * 1000),
        task: undefined,
      },
    ];
    const eventBlocks = calendarEventsToTimeBlocks(
      [makeEvent("cal", t2, 60)],
      { start: t2, end: t1 },
    );
    const merged = mergeTimelineBlocks(taskBlocks, eventBlocks);
    expect(merged[0]?.id).toContain("cal-");
    expect(merged[1]?.id).toBe("task-1");
  });
});

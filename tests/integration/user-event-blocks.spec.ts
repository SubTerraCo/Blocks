// N-0026 · User event blocks @core
import { test, expect } from "@playwright/test";
import {
  getAllDayUserEventsForDay,
  getTasksForCalendarDay,
  getTimelineWindow,
  isAllDayUserEvent,
  rescheduleUserEventTask,
  startOfDay,
  userEventsToTimedBlocks,
} from "@blocks/core";
import type { Task } from "@blocks/core";

function baseTask(overrides: Partial<Task> = {}): Task {
  const now = new Date();
  return {
    id: "t1",
    name: "Team offsite",
    status: "todo",
    priority: "3",
    blockSize: 30,
    blockCount: 1,
    tags: [],
    subtasks: [],
    reminders: [],
    timeSpent: 0,
    isQuickAdd: false,
    isPutzing: false,
    isRecurringInstance: false,
    isEvent: false,
    eventAllDay: true,
    recurrence: "none",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Task;
}

test.describe("user-event-blocks @N-0026 @core", () => {
  test("detects all-day events by default", () => {
    const due = new Date(2026, 5, 12);
    const task = baseTask({ isEvent: true, dueDate: due, eventAllDay: true });
    expect(isAllDayUserEvent(task)).toBe(true);
    expect(getAllDayUserEventsForDay([task], due)).toHaveLength(1);
  });

  test("timed events become timeline blocks", () => {
    const start = new Date(2026, 5, 12, 10, 0);
    const end = new Date(2026, 5, 12, 11, 0);
    const task = baseTask({
      isEvent: true,
      eventAllDay: false,
      eventStartAt: start,
      eventEndAt: end,
    });
    const window = getTimelineWindow(start, 7);
    const blocks = userEventsToTimedBlocks([task], window);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.startTime.getTime()).toBe(start.getTime());
  });

  test("rescheduleUserEventTask preserves duration", () => {
    const start = new Date(2026, 5, 12, 10, 0);
    const end = new Date(2026, 5, 12, 11, 30);
    const task = baseTask({
      isEvent: true,
      eventAllDay: false,
      eventStartAt: start,
      eventEndAt: end,
    });
    const newStart = new Date(2026, 5, 12, 14, 0);
    const updates = rescheduleUserEventTask(task, newStart);
    expect(updates.eventStartAt!.getTime()).toBe(newStart.getTime());
    expect(updates.eventEndAt!.getTime()).toBe(newStart.getTime() + 90 * 60_000);
  });

  test("getTasksForCalendarDay includes events and due tasks", () => {
    const day = startOfDay(new Date(2026, 5, 12));
    const event = baseTask({ id: "e1", isEvent: true, dueDate: day, name: "Holiday" });
    const due = baseTask({ id: "d1", dueDate: day, name: "Pay rent" });
    const rows = getTasksForCalendarDay([event, due], day);
    expect(rows.map((t) => t.id).sort()).toEqual(["d1", "e1"]);
  });
});

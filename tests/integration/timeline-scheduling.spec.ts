import { test, expect } from "@playwright/test";
import {
  buildTimelineInsertPushBackUpdates,
  findOverlappingScheduledTasks,
  findOverlappingCalendarEvents,
  hasTaskTimelineOverlaps,
  SINGLE_FOCUS_TASK_SCHEDULING,
} from "../../packages/core/src/timeline/timeline-scheduling";
import {
  computeTimelineOverlapLayout,
  overlapLayoutToStyle,
} from "../../packages/core/src/timeline/timeline-overlap-layout";
import type { Task, TimeBlock } from "../../packages/core/src/types";

function makeTask(overrides: Partial<Task> & Pick<Task, "id" | "name">): Task {
  const now = new Date();
  return {
    id: overrides.id,
    name: overrides.name,
    assigneeId: "me",
    accessContexts: [],
    blockSize: "30min",
    blockCount: 1,
    priority: "3",
    status: "todo",
    tags: [],
    recurrence: "none",
    subtasks: [],
    reminders: [],
    timeSpent: 0,
    isQuickAdd: false,
    isPutzing: false,
    isRecurringInstance: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test.describe("Single-focus timeline scheduling @N-0021 @core", () => {
  test("SINGLE_FOCUS_TASK_SCHEDULING invariant is enabled", () => {
    expect(SINGLE_FOCUS_TASK_SCHEDULING).toBe(true);
  });

  test("insert at now pushes overlapping downstream tasks @B-0015", () => {
    const base = new Date("2026-06-10T10:00:00");
    const existing = makeTask({
      id: "existing",
      name: "Existing",
      status: "doing",
      scheduledAt: new Date("2026-06-10T10:15:00"),
    });
    const downstream = makeTask({
      id: "downstream",
      name: "Downstream",
      status: "doing",
      scheduledAt: new Date("2026-06-10T10:30:00"),
    });
    const insert = makeTask({ id: "new", name: "New block", status: "todo" });

    const updates = buildTimelineInsertPushBackUpdates(
      [existing, downstream],
      insert.id,
      base,
      30,
    );

    expect(updates).toEqual([
      { id: "existing", scheduledAt: new Date("2026-06-10T10:30:00") },
      { id: "downstream", scheduledAt: new Date("2026-06-10T11:00:00") },
    ]);
    expect(hasTaskTimelineOverlaps([existing, downstream])).toBe(true);
    expect(
      findOverlappingScheduledTasks([existing, downstream], base, 30, insert.id),
    ).toHaveLength(1);
  });

  test("non-overlapping tasks are unchanged", () => {
    const later = makeTask({
      id: "later",
      name: "Later",
      status: "doing",
      scheduledAt: new Date("2026-06-10T12:00:00"),
    });
    const updates = buildTimelineInsertPushBackUpdates(
      [later],
      "new",
      new Date("2026-06-10T10:00:00"),
      30,
    );
    expect(updates).toEqual([]);
  });

  test("detects calendar event overlap @N-0020", () => {
    const start = new Date("2026-06-10T14:00:00");
    const blocks: TimeBlock[] = [
      {
        id: "cal-1",
        type: "calendar_event",
        startTime: new Date("2026-06-10T14:15:00"),
        endTime: new Date("2026-06-10T15:00:00"),
        calendarEvent: {
          id: "evt-1",
          calendarId: "primary",
          title: "Team standup",
          startTime: new Date("2026-06-10T14:15:00"),
          endTime: new Date("2026-06-10T15:00:00"),
          isAllDay: false,
          isReadOnly: true,
          source: "google",
        },
      },
    ];
    const conflicts = findOverlappingCalendarEvents(blocks, start, 30);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.title).toBe("Team standup");
  });

  test("overlap layout splits task and calendar columns @N-0021", () => {
    const blocks: TimeBlock[] = [
      {
        id: "task-1",
        type: "task",
        startTime: new Date("2026-06-10T14:00:00"),
        endTime: new Date("2026-06-10T14:30:00"),
        task: makeTask({
          id: "task-1",
          name: "Focus",
          status: "doing",
          scheduledAt: new Date("2026-06-10T14:00:00"),
        }),
      },
      {
        id: "cal-1",
        type: "calendar_event",
        startTime: new Date("2026-06-10T14:15:00"),
        endTime: new Date("2026-06-10T15:00:00"),
        calendarEvent: {
          id: "evt-1",
          calendarId: "primary",
          title: "Standup",
          startTime: new Date("2026-06-10T14:15:00"),
          endTime: new Date("2026-06-10T15:00:00"),
          isAllDay: false,
          isReadOnly: true,
          source: "google",
        },
      },
    ];
    const layout = computeTimelineOverlapLayout(blocks);
    expect(layout.get("task-1")).toEqual({ column: 0, totalColumns: 2 });
    expect(layout.get("cal-1")).toEqual({ column: 1, totalColumns: 2 });
    const style = overlapLayoutToStyle(layout.get("task-1"));
    expect(style.width).toContain("50%");
    expect(style.right).toBe("auto");
  });
});

// N-0025 · Schedule Doing lock current task @core
import { test, expect } from "@playwright/test";
import { planScheduleDoingTasks } from "@blocks/core";
import type { Task } from "@blocks/core";

function makeDoingTask(
  id: string,
  priority: string,
  scheduledAt?: Date,
): Task {
  const now = new Date("2026-06-09T10:00:00");
  return {
    id,
    name: `Task ${id}`,
    priority: priority as Task["priority"],
    status: "doing",
    blockSize: "30min",
    blockCount: 1,
    accessContexts: [],
    tags: [],
    assigneeId: "me",
    recurrence: "none",
    subtasks: [],
    reminders: [],
    isQuickAdd: false,
    isPutzing: false,
    isEvent: false,
    eventAllDay: true,
    timeSpent: 0,
    scheduledAt,
    createdAt: now,
    updatedAt: now,
  };
}

test.describe("SB.EN.02.035 · planScheduleDoingTasks @N-0025 @core", () => {
  test("lock_current skips active tracked task and starts after its block", () => {
    const locked = makeDoingTask(
      "locked",
      "1",
      new Date("2026-06-09T10:00:00"),
    );
    const other = makeDoingTask("other", "2");
    const now = new Date("2026-06-09T10:15:00");

    const plan = planScheduleDoingTasks({
      doingTasks: [locked, other],
      behavior: "lock_current",
      activeTrackingTaskId: "locked",
      isTimerRunning: true,
      now,
    });

    expect(plan.lockedTaskId).toBe("locked");
    expect(plan.tasksToSchedule.map((t) => t.id)).toEqual(["other"]);
    expect(plan.startAt.getTime()).toBe(
      new Date("2026-06-09T10:30:00").getTime(),
    );
  });

  test("reschedule_all includes every doing task from now", () => {
    const a = makeDoingTask("a", "1", new Date("2026-06-09T09:00:00"));
    const b = makeDoingTask("b", "2");
    const now = new Date("2026-06-09T10:00:00");

    const plan = planScheduleDoingTasks({
      doingTasks: [a, b],
      behavior: "reschedule_all",
      activeTrackingTaskId: "a",
      isTimerRunning: true,
      now,
    });

    expect(plan.tasksToSchedule).toHaveLength(2);
    expect(plan.startAt.getTime()).toBe(now.getTime());
  });

  test("excludes isEvent tasks from scheduling plan", () => {
    const event = makeDoingTask("ev", "1");
    event.isEvent = true;
    const task = makeDoingTask("task", "2");
    const plan = planScheduleDoingTasks({
      doingTasks: [event, task],
      behavior: "reschedule_all",
      now: new Date("2026-06-09T10:00:00"),
    });
    expect(plan.tasksToSchedule.map((t) => t.id)).toEqual(["task"]);
  });
});

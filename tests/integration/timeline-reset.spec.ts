import { test, expect } from "@playwright/test";
import { clearTimelineForNewDay } from "../../packages/core/src/timeline/timeline-service";
import type { Task } from "../../packages/core/src/types";

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

test.describe("Timeline daily reset", () => {
  test("clearTimelineForNewDay unschedules prior-day doing tasks", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0);

    const tasks: Task[] = [
      makeTask({
        id: "1",
        name: "Yesterday task",
        status: "doing",
        scheduledAt: yesterday,
      }),
      makeTask({
        id: "2",
        name: "Today task",
        status: "doing",
        scheduledAt: new Date(),
      }),
      makeTask({
        id: "3",
        name: "Done yesterday",
        status: "done",
        scheduledAt: yesterday,
        completedAt: yesterday,
      }),
    ];

    const { clearedCount, updatedTasks } = clearTimelineForNewDay(tasks);
    expect(clearedCount).toBe(1);
    expect(updatedTasks[0].id).toBe("1");
    expect(updatedTasks[0].scheduledAt).toBeUndefined();
    expect(updatedTasks[0].status).toBe("todo");
  });
});

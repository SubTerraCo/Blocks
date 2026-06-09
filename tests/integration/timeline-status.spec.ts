import { test, expect } from "@playwright/test";
import {
  isTimelineTask,
  tasksToTimeBlocks,
  clearTimelineForNewDay,
} from "../../packages/core/src/timeline/timeline-service";
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

test.describe("Timeline status rules", () => {
  test("only status=doing with schedule appears on timeline", () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    const doing = makeTask({ id: "1", name: "Doing", status: "doing", scheduledAt: today });
    const todo = makeTask({ id: "2", name: "Todo", status: "todo", scheduledAt: today });
    const doingUnscheduled = makeTask({ id: "3", name: "Unscheduled", status: "doing" });

    expect(isTimelineTask(doing)).toBe(true);
    expect(isTimelineTask(todo)).toBe(false);
    expect(isTimelineTask(doingUnscheduled)).toBe(false);

    const blocks = tasksToTimeBlocks([doing, todo, doingUnscheduled]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].task?.id).toBe("1");
  });

  test("clearTimelineForNewDay only affects doing tasks on timeline", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0);

    const tasks: Task[] = [
      makeTask({
        id: "1",
        name: "Yesterday doing",
        status: "doing",
        scheduledAt: yesterday,
      }),
      makeTask({
        id: "2",
        name: "Yesterday todo scheduled",
        status: "todo",
        scheduledAt: yesterday,
      }),
    ];

    const { clearedCount, updatedTasks } = clearTimelineForNewDay(tasks);
    expect(clearedCount).toBe(1);
    expect(updatedTasks[0].id).toBe("1");
    expect(updatedTasks[0].status).toBe("todo");
    expect(updatedTasks[0].scheduledAt).toBeUndefined();
  });
});

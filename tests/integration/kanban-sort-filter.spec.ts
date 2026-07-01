import { test, expect } from "@playwright/test";
import {
  sortKanbanTasks,
  filterKanbanTasks,
  taskMatchesKanbanFilter,
  isKanbanFilterActive,
  buildKanbanBoard,
} from "../../packages/core/src/kanban/kanban-sort-filter";
import type {
  Task,
  KanbanFilter,
  KanbanSort,
} from "../../packages/core/src/types";

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
    kanbanOrder: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const EMPTY_FILTER: KanbanFilter = {
  priority: [],
  tags: [],
  category: [],
  accessContexts: [],
};

const PRIORITY_ASC: KanbanSort = { field: "priority", direction: "asc" };

test.describe("Kanban sort @N-0048 @core", () => {
  test("default priority ascending puts P1 top, P5 bottom", () => {
    const tasks = [
      makeTask({ id: "c", name: "C", priority: "5" }),
      makeTask({ id: "a", name: "A", priority: "1" }),
      makeTask({ id: "b", name: "B", priority: "3" }),
    ];
    const sorted = sortKanbanTasks(tasks, PRIORITY_ASC);
    expect(sorted.map((t) => t.id)).toEqual(["a", "b", "c"]);
  });

  test("descending reverses the field order", () => {
    const tasks = [
      makeTask({ id: "a", name: "A", priority: "1" }),
      makeTask({ id: "b", name: "B", priority: "5" }),
    ];
    const sorted = sortKanbanTasks(tasks, { field: "priority", direction: "desc" });
    expect(sorted.map((t) => t.id)).toEqual(["b", "a"]);
  });

  test("multi-value tags sort by first value alphabetically, empties last", () => {
    const tasks = [
      makeTask({ id: "none", name: "None", tags: [] }),
      makeTask({ id: "z", name: "Z", tags: ["zeta", "alpha"] }),
      makeTask({ id: "b", name: "B", tags: ["beta"] }),
    ];
    const sorted = sortKanbanTasks(tasks, { field: "tags", direction: "asc" });
    // "alpha" (from z) < "beta" (from b) < empty (none) last
    expect(sorted.map((t) => t.id)).toEqual(["z", "b", "none"]);
  });

  test("dueDate nulls sort last regardless of direction", () => {
    const tasks = [
      makeTask({ id: "later", name: "Later", dueDate: new Date("2026-07-02") }),
      makeTask({ id: "none", name: "None" }),
      makeTask({ id: "soon", name: "Soon", dueDate: new Date("2026-07-01") }),
    ];
    const asc = sortKanbanTasks(tasks, { field: "dueDate", direction: "asc" });
    expect(asc.map((t) => t.id)).toEqual(["soon", "later", "none"]);
    const desc = sortKanbanTasks(tasks, { field: "dueDate", direction: "desc" });
    expect(desc[desc.length - 1].id).toBe("none");
  });

  test("manual kanbanOrder pins cards ahead of active sort", () => {
    const tasks = [
      makeTask({ id: "p5-pin", name: "Pinned", priority: "5", kanbanOrder: 1 }),
      makeTask({ id: "p1", name: "P1", priority: "1" }),
      makeTask({ id: "p2", name: "P2", priority: "2" }),
    ];
    const sorted = sortKanbanTasks(tasks, PRIORITY_ASC);
    // Pinned card (kanbanOrder=1) leads, then priority asc for the rest.
    expect(sorted.map((t) => t.id)).toEqual(["p5-pin", "p1", "p2"]);
  });

  test("refresh sort (honorManual=false) ignores kanbanOrder", () => {
    const tasks = [
      makeTask({ id: "p5-pin", name: "Pinned", priority: "5", kanbanOrder: 1 }),
      makeTask({ id: "p1", name: "P1", priority: "1" }),
    ];
    const sorted = sortKanbanTasks(tasks, PRIORITY_ASC, false);
    expect(sorted.map((t) => t.id)).toEqual(["p1", "p5-pin"]);
  });
});

test.describe("Kanban filter @N-0049 @core", () => {
  test("priority filter narrows to selected priorities (AND with others)", () => {
    const tasks = [
      makeTask({ id: "p1", name: "P1", priority: "1" }),
      makeTask({ id: "p3", name: "P3", priority: "3" }),
    ];
    const filtered = filterKanbanTasks(tasks, {
      ...EMPTY_FILTER,
      priority: ["1"],
    });
    expect(filtered.map((t) => t.id)).toEqual(["p1"]);
  });

  test("kind filter separates events from tasks", () => {
    const tasks = [
      makeTask({ id: "evt", name: "Event", isEvent: true }),
      makeTask({ id: "task", name: "Task", isEvent: false }),
    ];
    expect(
      filterKanbanTasks(tasks, { ...EMPTY_FILTER, kind: "event" }).map((t) => t.id),
    ).toEqual(["evt"]);
    expect(
      filterKanbanTasks(tasks, { ...EMPTY_FILTER, kind: "task" }).map((t) => t.id),
    ).toEqual(["task"]);
  });

  test("scheduled + subtasks clauses combine with AND", () => {
    const tasks = [
      makeTask({
        id: "match",
        name: "Match",
        scheduledAt: new Date("2026-07-01T09:00:00"),
        subtasks: [{ id: "s1", name: "sub", completed: false }],
      }),
      makeTask({ id: "noSub", name: "NoSub", scheduledAt: new Date() }),
      makeTask({ id: "unsched", name: "Unsched", subtasks: [{ id: "s2", name: "x", completed: false }] }),
    ];
    const filtered = filterKanbanTasks(tasks, {
      ...EMPTY_FILTER,
      scheduled: "scheduled",
      subtasks: "with",
    });
    expect(filtered.map((t) => t.id)).toEqual(["match"]);
  });

  test("due date range filters inclusive of bounds", () => {
    const tasks = [
      makeTask({ id: "in", name: "In", dueDate: new Date("2026-07-05") }),
      makeTask({ id: "before", name: "Before", dueDate: new Date("2026-06-01") }),
      makeTask({ id: "after", name: "After", dueDate: new Date("2026-08-01") }),
    ];
    const filtered = filterKanbanTasks(tasks, {
      ...EMPTY_FILTER,
      dueFrom: new Date("2026-07-01"),
      dueTo: new Date("2026-07-31"),
    });
    expect(filtered.map((t) => t.id)).toEqual(["in"]);
  });

  test("isKanbanFilterActive reflects presence of any clause", () => {
    expect(isKanbanFilterActive(EMPTY_FILTER)).toBe(false);
    expect(isKanbanFilterActive({ ...EMPTY_FILTER, kind: "event" })).toBe(true);
    expect(taskMatchesKanbanFilter(makeTask({ id: "x", name: "X" }), EMPTY_FILTER)).toBe(true);
  });
});

test.describe("buildKanbanBoard @N-0048 @N-0049 @core", () => {
  test("groups by status and sorts each column with the active sort", () => {
    const tasks = [
      makeTask({ id: "todo-p5", name: "T5", status: "todo", priority: "5" }),
      makeTask({ id: "todo-p1", name: "T1", status: "todo", priority: "1" }),
      makeTask({ id: "doing-p2", name: "D2", status: "doing", priority: "2" }),
      makeTask({ id: "evt", name: "Event", status: "todo", isEvent: true, priority: "3" }),
    ];
    const board = buildKanbanBoard(
      tasks,
      { ...EMPTY_FILTER, kind: "task" },
      PRIORITY_ASC,
    );
    // Event filtered out; todo column sorted priority asc.
    expect(board.todo.map((t) => t.id)).toEqual(["todo-p1", "todo-p5"]);
    expect(board.doing.map((t) => t.id)).toEqual(["doing-p2"]);
  });
});

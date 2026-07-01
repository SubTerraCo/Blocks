// ============================================================================
// BLOCKS - Kanban sort + filter (N-0048 · N-0049)
// Pure, shared logic so web + desktop stay in lock-step and stay testable.
// ============================================================================

import type {
  Task,
  TaskStatus,
  KanbanSort,
  KanbanFilter,
} from "../types";
import { KANBAN_COLUMNS } from "../types";

/** Lowercase first value of a string array for stable multi-value sorting. */
function firstValue(values: string[]): string | null {
  if (!values || values.length === 0) return null;
  const sorted = [...values].map((v) => v.toLowerCase()).sort();
  return sorted[0] ?? null;
}

/** Compare helper that always sorts nullish values last (regardless of dir). */
function compareNullable<T>(
  a: T | null | undefined,
  b: T | null | undefined,
  cmp: (x: T, y: T) => number,
): number | null {
  const aMissing = a === null || a === undefined;
  const bMissing = b === null || b === undefined;
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1; // a after b
  if (bMissing) return -1; // a before b
  return cmp(a as T, b as T);
}

/**
 * True when a task has no value for the given sort field. Such tasks always sort
 * last regardless of direction (so "empties last" holds for asc and desc alike).
 * Fields that are always present (priority, createdAt, name, manual) never miss.
 */
function fieldMissing(task: Task, field: KanbanSort["field"]): boolean {
  switch (field) {
    case "dueDate":
      return !task.dueDate;
    case "tags":
      return firstValue(task.tags) === null;
    case "accessContexts":
      return firstValue(task.accessContexts) === null;
    case "category":
      return !task.category;
    default:
      return false;
  }
}

/**
 * Compare two tasks by the active sort field (ascending orientation).
 * Nullish values always sort last; direction is applied by the caller.
 * `manual` uses Task.kanbanOrder ascending.
 */
function compareByField(a: Task, b: Task, field: KanbanSort["field"]): number {
  switch (field) {
    case "priority": {
      // P1 (highest) → P5. Numeric ascending.
      return parseInt(a.priority, 10) - parseInt(b.priority, 10);
    }
    case "dueDate": {
      const cmp = compareNullable(
        a.dueDate ?? null,
        b.dueDate ?? null,
        (x, y) => x.getTime() - y.getTime(),
      );
      return cmp ?? 0;
    }
    case "createdAt":
      return a.createdAt.getTime() - b.createdAt.getTime();
    case "name":
      return a.name.localeCompare(b.name);
    case "tags": {
      const cmp = compareNullable(firstValue(a.tags), firstValue(b.tags), (x, y) =>
        x.localeCompare(y),
      );
      return cmp ?? 0;
    }
    case "accessContexts": {
      const cmp = compareNullable(
        firstValue(a.accessContexts),
        firstValue(b.accessContexts),
        (x, y) => x.localeCompare(y),
      );
      return cmp ?? 0;
    }
    case "category": {
      const cmp = compareNullable(
        a.category?.toLowerCase() ?? null,
        b.category?.toLowerCase() ?? null,
        (x, y) => x.localeCompare(y),
      );
      return cmp ?? 0;
    }
    case "manual":
      return 0;
    default:
      return 0;
  }
}

/**
 * Sort a list of tasks by the active sort. When `honorManual` is true, any task
 * with a non-zero `kanbanOrder` is treated as manually pinned and ordered by
 * `kanbanOrder` first; the remaining tasks follow the active field sort. This
 * lets a user drag-reorder a column while unpinned cards keep the active sort,
 * and "refresh sort" (which clears kanbanOrder) restores a fully-sorted column.
 */
export function sortKanbanTasks(
  tasks: Task[],
  sort: KanbanSort,
  honorManual = true,
): Task[] {
  const dir = sort.direction === "desc" ? -1 : 1;

  const fieldSort = (a: Task, b: Task): number => {
    // Empties always sort last, independent of direction.
    const aMissing = fieldMissing(a, sort.field);
    const bMissing = fieldMissing(b, sort.field);
    if (aMissing !== bMissing) return aMissing ? 1 : -1;
    const primary = aMissing ? 0 : compareByField(a, b, sort.field) * dir;
    if (primary !== 0) return primary;
    // Stable tie-breakers: priority, then name.
    const byPriority = parseInt(a.priority, 10) - parseInt(b.priority, 10);
    if (byPriority !== 0) return byPriority;
    return a.name.localeCompare(b.name);
  };

  if (sort.field === "manual" || !honorManual) {
    if (sort.field === "manual") {
      return [...tasks].sort(
        (a, b) => a.kanbanOrder - b.kanbanOrder || fieldSort(a, b),
      );
    }
    return [...tasks].sort(fieldSort);
  }

  const pinned = tasks
    .filter((t) => t.kanbanOrder > 0)
    .sort((a, b) => a.kanbanOrder - b.kanbanOrder);
  const rest = tasks.filter((t) => t.kanbanOrder <= 0).sort(fieldSort);
  return [...pinned, ...rest];
}

/** True when a task passes every active filter clause (AND semantics). */
export function taskMatchesKanbanFilter(task: Task, filter: KanbanFilter): boolean {
  if (filter.priority.length > 0 && !filter.priority.includes(task.priority)) {
    return false;
  }
  if (filter.tags.length > 0) {
    const has = filter.tags.some((t) => task.tags.includes(t));
    if (!has) return false;
  }
  if (filter.category.length > 0) {
    if (!task.category || !filter.category.includes(task.category)) return false;
  }
  if (filter.accessContexts.length > 0) {
    const has = filter.accessContexts.some((c) => task.accessContexts.includes(c));
    if (!has) return false;
  }
  if (filter.dueFrom && (!task.dueDate || task.dueDate < filter.dueFrom)) {
    return false;
  }
  if (filter.dueTo && (!task.dueDate || task.dueDate > filter.dueTo)) {
    return false;
  }
  if (filter.kind === "event" && !task.isEvent) return false;
  if (filter.kind === "task" && task.isEvent) return false;
  if (filter.scheduled === "scheduled" && !task.scheduledAt) return false;
  if (filter.scheduled === "unscheduled" && task.scheduledAt) return false;
  if (filter.subtasks === "with" && task.subtasks.length === 0) return false;
  if (filter.subtasks === "without" && task.subtasks.length > 0) return false;
  return true;
}

export function filterKanbanTasks(tasks: Task[], filter: KanbanFilter): Task[] {
  return tasks.filter((t) => taskMatchesKanbanFilter(t, filter));
}

/** True when a filter has at least one active clause (drives the UI badge). */
export function isKanbanFilterActive(filter: KanbanFilter): boolean {
  return (
    filter.priority.length > 0 ||
    filter.tags.length > 0 ||
    filter.category.length > 0 ||
    filter.accessContexts.length > 0 ||
    filter.dueFrom !== undefined ||
    filter.dueTo !== undefined ||
    filter.kind !== undefined ||
    filter.scheduled !== undefined ||
    filter.subtasks !== undefined
  );
}

export type KanbanBoard = Record<TaskStatus, Task[]>;

/**
 * Filter, group by status column, then sort each column with the active sort.
 * `done` always resolves to completion order last (newest completed on top)
 * unless an explicit non-priority sort is chosen.
 */
export function buildKanbanBoard(
  tasks: Task[],
  filter: KanbanFilter,
  sort: KanbanSort,
): KanbanBoard {
  const board = {} as KanbanBoard;
  for (const col of KANBAN_COLUMNS) board[col.id] = [];

  for (const task of filterKanbanTasks(tasks, filter)) {
    const status = (board[task.status] ? task.status : "backlog") as TaskStatus;
    board[status].push(task);
  }

  for (const col of KANBAN_COLUMNS) {
    board[col.id] = sortKanbanTasks(board[col.id], sort);
  }
  return board;
}

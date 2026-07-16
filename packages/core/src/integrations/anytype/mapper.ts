// ============================================================================
// BLOCKS - Task ↔ Anytype object field mapper (N-0050 · SB.EN.02.080.020)
// Full-parity mapping per ROADMAP N-0050; kanbanOrder and views never sync.
// ============================================================================

import type { Task, TaskStatus } from "../../types";
import type {
  AnytypeApiObject,
  AnytypeApiProperty,
  AnytypeTaskObject,
} from "./types";

// ----------------------------------------------------------------------------
// Status map (Blocks ↔ Anytype) — single source of truth
// ----------------------------------------------------------------------------

export const BLOCKS_TO_ANYTYPE_STATUS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  design: "Planning",
  todo: "To Do",
  doing: "In Progress",
  review: "Review",
  done: "Done",
};

const ANYTYPE_TO_BLOCKS_STATUS = new Map<string, TaskStatus>(
  (Object.entries(BLOCKS_TO_ANYTYPE_STATUS) as [TaskStatus, string][]).map(
    ([blocks, anytype]) => [anytype.toLowerCase(), blocks],
  ),
);

/** Unknown Anytype states map to backlog (logged by callers). */
export function anytypeStatusToBlocks(status: string | undefined): TaskStatus {
  if (!status) return "backlog";
  return ANYTYPE_TO_BLOCKS_STATUS.get(status.toLowerCase()) ?? "backlog";
}

// ----------------------------------------------------------------------------
// Blocks property keys on Anytype objects (custom relations)
// ----------------------------------------------------------------------------

export const ANYTYPE_PROP_KEYS = {
  description: "description",
  notes: "blocks_notes",
  status: "status",
  priority: "blocks_priority",
  tags: "tag",
  dueDate: "due_date",
  scheduledAt: "blocks_scheduled_at",
  timeSpent: "blocks_time_spent",
  startedAt: "blocks_started_at",
  completedAt: "blocks_completed_at",
  subtasks: "blocks_subtasks",
  blockSize: "blocks_block_size",
  blockCount: "blocks_block_count",
  accessContexts: "blocks_access_contexts",
  blocksTaskId: "blocks_task_id",
  syncVersion: "blocks_sync_version",
  lastModified: "last_modified_date",
} as const;

// ----------------------------------------------------------------------------
// Task → normalized Anytype object
// ----------------------------------------------------------------------------

export function taskToAnytypeObject(task: Task, spaceId: string): AnytypeTaskObject {
  return {
    id: task.anytypeObjectId ?? "",
    spaceId,
    name: task.name,
    description: task.description,
    notes: task.notes,
    status: task.status,
    priority: task.priority,
    tags: [...task.tags],
    dueDate: task.dueDate,
    scheduledAt: task.scheduledAt,
    timeSpent: task.timeSpent,
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    subtasks: task.subtasks.map((s) => ({ ...s })),
    blockSize: task.blockSize,
    blockCount: task.blockCount,
    accessContexts: [...task.accessContexts],
    updatedAt: task.updatedAt,
    blocksTaskId: task.id,
    syncVersion: (task.anytypeSyncVersion ?? 0) + 1,
  };
}

/**
 * Apply a normalized Anytype object onto an existing Blocks task.
 * Blocks-only fields (kanbanOrder, isQuickAdd, recurrence, events, …) are
 * preserved; only the mapped parity fields are overwritten.
 */
export function applyAnytypeObjectToTask(task: Task, obj: AnytypeTaskObject): Task {
  return {
    ...task,
    name: obj.name || task.name,
    description: obj.description,
    notes: obj.notes,
    status: obj.status,
    priority: obj.priority,
    tags: [...obj.tags],
    dueDate: obj.dueDate,
    scheduledAt: obj.scheduledAt,
    timeSpent: obj.timeSpent,
    startedAt: obj.startedAt,
    completedAt: obj.completedAt,
    subtasks: obj.subtasks.map((s) => ({ ...s })),
    blockSize: obj.blockSize,
    blockCount: obj.blockCount,
    accessContexts: [...obj.accessContexts],
    updatedAt: obj.updatedAt,
    anytypeObjectId: obj.id,
    anytypeSpaceId: obj.spaceId,
    anytypeSyncedAt: new Date(),
    anytypeSyncVersion: obj.syncVersion ?? task.anytypeSyncVersion,
  };
}

// ----------------------------------------------------------------------------
// Wire codec — normalized object ↔ Anytype API shape
// ----------------------------------------------------------------------------

function propValue(props: AnytypeApiProperty[] | undefined, key: string): AnytypeApiProperty | undefined {
  return props?.find((p) => p.key === key);
}

function selectName(value: AnytypeApiProperty["select"]): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.name;
}

function multiSelectNames(value: AnytypeApiProperty["multi_select"]): string[] {
  if (!value) return [];
  return value.map((v) => (typeof v === "string" ? v : v.name)).filter(Boolean);
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function decodeAnytypeApiObject(raw: AnytypeApiObject): AnytypeTaskObject {
  const K = ANYTYPE_PROP_KEYS;
  const props = raw.properties;

  let subtasks: AnytypeTaskObject["subtasks"] = [];
  const subtasksJson = propValue(props, K.subtasks)?.text;
  if (subtasksJson) {
    try {
      const parsed = JSON.parse(subtasksJson);
      if (Array.isArray(parsed)) subtasks = parsed;
    } catch {
      // Malformed subtask payload from a foreign editor — ignore, keep empty.
    }
  }

  const blockSize = propValue(props, K.blockSize)?.text;
  const priority = selectName(propValue(props, K.priority)?.select)
    ?? propValue(props, K.priority)?.text;

  return {
    id: raw.id,
    spaceId: raw.space_id ?? "",
    name: raw.name ?? "",
    description: propValue(props, K.description)?.text,
    notes: propValue(props, K.notes)?.text,
    status: anytypeStatusToBlocks(selectName(propValue(props, K.status)?.select)),
    priority: (priority as AnytypeTaskObject["priority"]) ?? "3",
    tags: multiSelectNames(propValue(props, K.tags)?.multi_select),
    dueDate: parseDate(propValue(props, K.dueDate)?.date),
    scheduledAt: parseDate(propValue(props, K.scheduledAt)?.date),
    timeSpent: propValue(props, K.timeSpent)?.number ?? 0,
    startedAt: parseDate(propValue(props, K.startedAt)?.date),
    completedAt: parseDate(propValue(props, K.completedAt)?.date),
    subtasks,
    blockSize: (blockSize as AnytypeTaskObject["blockSize"]) ?? "30min",
    blockCount: propValue(props, K.blockCount)?.number ?? 1,
    accessContexts: multiSelectNames(
      propValue(props, K.accessContexts)?.multi_select,
    ) as AnytypeTaskObject["accessContexts"],
    updatedAt: parseDate(propValue(props, K.lastModified)?.date) ?? new Date(0),
    blocksTaskId: propValue(props, K.blocksTaskId)?.text,
    syncVersion: propValue(props, K.syncVersion)?.number,
  };
}

export function encodeAnytypeApiObject(obj: AnytypeTaskObject): Omit<AnytypeApiObject, "id"> {
  const K = ANYTYPE_PROP_KEYS;
  const properties: AnytypeApiProperty[] = [
    { key: K.status, select: { name: BLOCKS_TO_ANYTYPE_STATUS[obj.status] } },
    { key: K.priority, text: obj.priority },
    { key: K.tags, multi_select: obj.tags.map((name) => ({ name })) },
    { key: K.timeSpent, number: obj.timeSpent },
    { key: K.blockSize, text: obj.blockSize },
    { key: K.blockCount, number: obj.blockCount },
    { key: K.accessContexts, multi_select: obj.accessContexts.map((name) => ({ name })) },
    { key: K.subtasks, text: JSON.stringify(obj.subtasks) },
  ];

  if (obj.description) properties.push({ key: K.description, text: obj.description });
  if (obj.notes) properties.push({ key: K.notes, text: obj.notes });
  if (obj.dueDate) properties.push({ key: K.dueDate, date: obj.dueDate.toISOString() });
  if (obj.scheduledAt) properties.push({ key: K.scheduledAt, date: obj.scheduledAt.toISOString() });
  if (obj.startedAt) properties.push({ key: K.startedAt, date: obj.startedAt.toISOString() });
  if (obj.completedAt) properties.push({ key: K.completedAt, date: obj.completedAt.toISOString() });
  if (obj.blocksTaskId) properties.push({ key: K.blocksTaskId, text: obj.blocksTaskId });
  if (obj.syncVersion !== undefined) properties.push({ key: K.syncVersion, number: obj.syncVersion });

  return {
    name: obj.name,
    space_id: obj.spaceId,
    type: "task",
    properties,
  };
}

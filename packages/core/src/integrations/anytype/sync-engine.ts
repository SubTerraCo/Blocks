// ============================================================================
// BLOCKS - Anytype two-way sync engine (N-0050 · SB.EN.02.080.030/.040)
//
// LWW on updatedAt (anytypeSyncVersion tie-break). Incoming schedule changes
// that overlap the timeline are gated: they are reported as conflicts and only
// applied with confirmSchedule=true, via the single-focus push-back engine.
// ============================================================================

import type { Task } from "../../types";
import { TaskEngine } from "../../tasks";
import {
  buildTimelineInsertPushBackUpdates,
  findOverlappingScheduledTasks,
  getTaskDurationMinutes,
  type ScheduleConflict,
} from "../../timeline";
import { applyAnytypeObjectToTask, taskToAnytypeObject } from "./mapper";
import type { AnytypeClient } from "./client";
import type { AnytypeTaskObject } from "./types";

// ----------------------------------------------------------------------------
// LWW resolution
// ----------------------------------------------------------------------------

export type LwwWinner = "blocks" | "anytype" | "equal";

export function resolveLww(task: Task, obj: AnytypeTaskObject): LwwWinner {
  const taskMs = new Date(task.updatedAt).getTime();
  const objMs = new Date(obj.updatedAt).getTime();
  if (taskMs > objMs) return "blocks";
  if (objMs > taskMs) return "anytype";
  const taskVersion = task.anytypeSyncVersion ?? 0;
  const objVersion = obj.syncVersion ?? 0;
  if (taskVersion > objVersion) return "blocks";
  if (objVersion > taskVersion) return "anytype";
  return "equal";
}

// ----------------------------------------------------------------------------
// Sync plan (pure — no IO)
// ----------------------------------------------------------------------------

export interface PendingPull {
  task: Task;
  incoming: AnytypeTaskObject;
  /** Overlaps caused by the incoming scheduledAt (empty = safe to apply) */
  scheduleConflicts: ScheduleConflict[];
}

export interface SyncPlan {
  /** Blocks tasks not yet linked — create in Anytype */
  createInAnytype: Task[];
  /** Anytype objects with no Blocks counterpart — create in Blocks */
  createInBlocks: AnytypeTaskObject[];
  /** Linked tasks where Blocks wins LWW — push to Anytype */
  pushToAnytype: Task[];
  /** Linked tasks where Anytype wins LWW — pull into Blocks */
  pullIntoBlocks: PendingPull[];
  /** Linked task ids already in sync */
  unchanged: string[];
}

/**
 * Compare the Blocks store against Anytype objects and produce a two-way plan.
 * Matching: task.anytypeObjectId ↔ obj.id, falling back to obj.blocksTaskId.
 */
export function planTwoWaySync(tasks: Task[], objects: AnytypeTaskObject[]): SyncPlan {
  const plan: SyncPlan = {
    createInAnytype: [],
    createInBlocks: [],
    pushToAnytype: [],
    pullIntoBlocks: [],
    unchanged: [],
  };

  const objectsById = new Map(objects.map((o) => [o.id, o]));
  const objectsByTaskId = new Map(
    objects.filter((o) => o.blocksTaskId).map((o) => [o.blocksTaskId!, o]),
  );
  const matchedObjectIds = new Set<string>();

  for (const task of tasks) {
    const obj =
      (task.anytypeObjectId ? objectsById.get(task.anytypeObjectId) : undefined) ??
      objectsByTaskId.get(task.id);

    if (!obj) {
      plan.createInAnytype.push(task);
      continue;
    }
    matchedObjectIds.add(obj.id);

    const winner = resolveLww(task, obj);
    if (winner === "blocks") {
      plan.pushToAnytype.push(task);
    } else if (winner === "anytype") {
      plan.pullIntoBlocks.push({
        task,
        incoming: obj,
        scheduleConflicts: incomingScheduleConflicts(tasks, task, obj),
      });
    } else {
      plan.unchanged.push(task.id);
    }
  }

  for (const obj of objects) {
    if (!matchedObjectIds.has(obj.id)) plan.createInBlocks.push(obj);
  }

  return plan;
}

/** Overlaps the incoming schedule would create on the timeline (N-0021 gate). */
function incomingScheduleConflicts(
  tasks: Task[],
  task: Task,
  incoming: AnytypeTaskObject,
): ScheduleConflict[] {
  if (!incoming.scheduledAt || incoming.status !== "doing") return [];
  const unchanged =
    task.scheduledAt &&
    new Date(task.scheduledAt).getTime() === incoming.scheduledAt.getTime();
  if (unchanged) return [];

  const probe = applyAnytypeObjectToTask(task, incoming);
  return findOverlappingScheduledTasks(
    tasks,
    incoming.scheduledAt,
    getTaskDurationMinutes(probe),
    task.id,
  );
}

// ----------------------------------------------------------------------------
// Pull application (pure)
// ----------------------------------------------------------------------------

export interface ApplyPullResult {
  /** Full task list after applying (or the original list when skipped) */
  tasks: Task[];
  applied: boolean;
  /** Populated when skipped because of unconfirmed schedule conflicts */
  scheduleConflicts: ScheduleConflict[];
}

/**
 * Apply one pull onto the task list. Conflicting schedule changes require
 * confirmSchedule=true and are committed through the push-back engine —
 * never a bare scheduledAt write (SINGLE_FOCUS_TASK_SCHEDULING).
 */
export function applyPull(
  tasks: Task[],
  pull: PendingPull,
  options: { confirmSchedule?: boolean } = {},
): ApplyPullResult {
  if (pull.scheduleConflicts.length > 0 && !options.confirmSchedule) {
    return { tasks, applied: false, scheduleConflicts: pull.scheduleConflicts };
  }

  const merged = applyAnytypeObjectToTask(pull.task, pull.incoming);
  let next = tasks.map((t) => (t.id === merged.id ? merged : t));

  if (pull.scheduleConflicts.length > 0 && merged.scheduledAt) {
    const pushBack = buildTimelineInsertPushBackUpdates(
      next,
      merged.id,
      new Date(merged.scheduledAt),
      getTaskDurationMinutes(merged),
    );
    const updatesById = new Map(pushBack.map((u) => [u.id, u.scheduledAt]));
    next = next.map((t) =>
      updatesById.has(t.id)
        ? { ...t, scheduledAt: updatesById.get(t.id)!, updatedAt: new Date() }
        : t,
    );
  }

  return { tasks: next, applied: true, scheduleConflicts: [] };
}

/** Create a new Blocks task from an unlinked Anytype object. */
export function createTaskFromAnytypeObject(obj: AnytypeTaskObject): Task {
  const task = TaskEngine.createTask({
    name: obj.name || "Untitled Anytype task",
    status: obj.status,
    priority: obj.priority,
    assigneeId: "me",
    accessContexts: obj.accessContexts,
    blockSize: obj.blockSize,
    blockCount: obj.blockCount,
    tags: obj.tags,
    subtasks: obj.subtasks,
    reminders: [],
    recurrence: "none",
    isQuickAdd: false,
    isPutzing: false,
  });
  return applyAnytypeObjectToTask(task, obj);
}

// ----------------------------------------------------------------------------
// Engine (IO orchestration over AnytypeClient)
// ----------------------------------------------------------------------------

export interface SyncResult {
  /** Full task list after the sync pass — caller persists it */
  tasks: Task[];
  pushed: number;
  pulled: number;
  createdInAnytype: number;
  createdInBlocks: number;
  /** Pulls skipped pending schedule confirmation */
  pendingScheduleConflicts: PendingPull[];
}

export interface AnytypeSyncEngineConfig {
  spaceId: string;
}

export class AnytypeSyncEngine {
  constructor(
    private readonly client: AnytypeClient,
    private readonly config: AnytypeSyncEngineConfig,
  ) {}

  /** Push one task to Anytype (create or update). Returns the linked task. */
  async pushTask(task: Task): Promise<Task> {
    const outgoing = taskToAnytypeObject(task, this.config.spaceId);
    const saved = task.anytypeObjectId
      ? await this.client.updateTaskObject({ ...outgoing, id: task.anytypeObjectId })
      : await this.client.createTaskObject(outgoing);
    return {
      ...task,
      anytypeObjectId: saved.id,
      anytypeSpaceId: this.config.spaceId,
      anytypeSyncedAt: new Date(),
      anytypeSyncVersion: outgoing.syncVersion,
    };
  }

  async pullObjects(): Promise<AnytypeTaskObject[]> {
    return this.client.listTaskObjects(this.config.spaceId);
  }

  /**
   * Full two-way pass: pull, LWW merge, push winners, create missing on both
   * sides. Schedule-conflicting pulls are only applied with confirmSchedule.
   */
  async syncTasks(
    tasks: Task[],
    options: { confirmSchedule?: boolean } = {},
  ): Promise<SyncResult> {
    const objects = await this.pullObjects();
    const plan = planTwoWaySync(tasks, objects);

    let next = [...tasks];
    const pendingScheduleConflicts: PendingPull[] = [];
    let pulled = 0;

    for (const pull of plan.pullIntoBlocks) {
      const result = applyPull(next, pull, options);
      if (result.applied) {
        next = result.tasks;
        pulled += 1;
      } else {
        pendingScheduleConflicts.push(pull);
      }
    }

    for (const obj of plan.createInBlocks) {
      next.push(createTaskFromAnytypeObject(obj));
    }

    let pushed = 0;
    let createdInAnytype = 0;
    for (const task of [...plan.pushToAnytype, ...plan.createInAnytype]) {
      const isCreate = !task.anytypeObjectId;
      const linked = await this.pushTask(next.find((t) => t.id === task.id) ?? task);
      next = next.map((t) => (t.id === linked.id ? linked : t));
      if (isCreate) createdInAnytype += 1;
      else pushed += 1;
    }

    return {
      tasks: next,
      pushed,
      pulled,
      createdInAnytype,
      createdInBlocks: plan.createInBlocks.length,
      pendingScheduleConflicts,
    };
  }
}

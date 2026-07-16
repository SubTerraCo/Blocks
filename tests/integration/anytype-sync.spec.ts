// N-0050 · Anytype two-way sync — mapper, LWW merge, schedule conflict gate
import { test, expect } from "@playwright/test";
import {
  TaskEngine,
  taskToAnytypeObject,
  applyAnytypeObjectToTask,
  decodeAnytypeApiObject,
  encodeAnytypeApiObject,
  anytypeStatusToBlocks,
  BLOCKS_TO_ANYTYPE_STATUS,
  resolveLww,
  planTwoWaySync,
  applyPull,
  createTaskFromAnytypeObject,
  type Task,
  type CreateTaskInput,
} from "@blocks/core";

function makeTask(overrides: Partial<CreateTaskInput & Task> = {}): Task {
  const task = TaskEngine.createTask({
    name: "Sync me",
    status: "todo",
    priority: "3",
    assigneeId: "me",
    accessContexts: [],
    blockSize: "30min",
    blockCount: 1,
    tags: [],
    subtasks: [],
    reminders: [],
    recurrence: "none",
    isQuickAdd: false,
    isPutzing: false,
    ...overrides,
  } as CreateTaskInput);
  return { ...task, ...overrides } as Task;
}

test.describe("SB.EN.02.080 · Anytype sync @N-0050 @core", () => {
  test("status map is total and round-trips", () => {
    for (const [blocks, anytype] of Object.entries(BLOCKS_TO_ANYTYPE_STATUS)) {
      expect(anytypeStatusToBlocks(anytype)).toBe(blocks);
    }
    expect(anytypeStatusToBlocks("Some Unknown State")).toBe("backlog");
    expect(anytypeStatusToBlocks(undefined)).toBe("backlog");
  });

  test("task → object → wire → object round-trips parity fields", () => {
    const due = new Date("2026-08-01T12:00:00.000Z");
    const task = makeTask({
      name: "Round trip",
      status: "doing",
      priority: "1",
      tags: ["deep-work", "home"],
      dueDate: due,
      scheduledAt: new Date("2026-07-16T09:00:00.000Z"),
      notes: "keep me",
      subtasks: [{ id: "11111111-1111-4111-8111-111111111111", name: "step 1", completed: true }],
    });

    const obj = taskToAnytypeObject(task, "space-1");
    expect(obj.blocksTaskId).toBe(task.id);
    expect(obj.syncVersion).toBe(1);

    const wire = encodeAnytypeApiObject(obj);
    const decoded = decodeAnytypeApiObject({ ...wire, id: "obj-1" });

    expect(decoded.name).toBe("Round trip");
    expect(decoded.status).toBe("doing");
    expect(decoded.priority).toBe("1");
    expect(decoded.tags).toEqual(["deep-work", "home"]);
    expect(decoded.dueDate?.toISOString()).toBe(due.toISOString());
    expect(decoded.notes).toBe("keep me");
    expect(decoded.subtasks).toHaveLength(1);
    expect(decoded.subtasks[0].completed).toBe(true);
    expect(decoded.blocksTaskId).toBe(task.id);
  });

  test("applyAnytypeObjectToTask preserves Blocks-only fields", () => {
    const task = makeTask({ kanbanOrder: 4 });
    const obj = taskToAnytypeObject(makeTask({ name: "Renamed" }), "space-1");
    const merged = applyAnytypeObjectToTask(task, { ...obj, id: "obj-9" });
    expect(merged.name).toBe("Renamed");
    expect(merged.kanbanOrder).toBe(4);
    expect(merged.id).toBe(task.id);
    expect(merged.anytypeObjectId).toBe("obj-9");
  });

  test("LWW resolves by updatedAt with syncVersion tie-break", () => {
    const base = makeTask({});
    const older = { ...base, updatedAt: new Date("2026-07-01T00:00:00Z") };
    const newerObj = {
      ...taskToAnytypeObject(base, "s"),
      id: "o1",
      updatedAt: new Date("2026-07-02T00:00:00Z"),
    };
    expect(resolveLww(older, newerObj)).toBe("anytype");
    expect(resolveLww({ ...older, updatedAt: new Date("2026-07-03T00:00:00Z") }, newerObj)).toBe("blocks");

    const sameTime = new Date("2026-07-02T00:00:00Z");
    const tieTask = { ...base, updatedAt: sameTime, anytypeSyncVersion: 5 };
    const tieObj = { ...newerObj, updatedAt: sameTime, syncVersion: 3 };
    expect(resolveLww(tieTask, tieObj)).toBe("blocks");
    expect(resolveLww({ ...tieTask, anytypeSyncVersion: 3 }, { ...tieObj, syncVersion: 3 })).toBe("equal");
  });

  test("planTwoWaySync buckets create/push/pull/unchanged", () => {
    const unlinked = makeTask({ name: "New in Blocks" });
    const linkedNewer = makeTask({
      name: "Blocks wins",
      anytypeObjectId: "obj-a",
      updatedAt: new Date("2026-07-10T00:00:00Z"),
    });
    const linkedOlder = makeTask({
      name: "Anytype wins",
      anytypeObjectId: "obj-b",
      updatedAt: new Date("2026-07-01T00:00:00Z"),
    });

    const objA = {
      ...taskToAnytypeObject(linkedNewer, "s"),
      id: "obj-a",
      updatedAt: new Date("2026-07-05T00:00:00Z"),
    };
    const objB = {
      ...taskToAnytypeObject(linkedOlder, "s"),
      id: "obj-b",
      name: "Renamed in Anytype",
      updatedAt: new Date("2026-07-09T00:00:00Z"),
    };
    const objNew = {
      ...taskToAnytypeObject(makeTask({ name: "New in Anytype" }), "s"),
      id: "obj-c",
      blocksTaskId: undefined,
    };

    const plan = planTwoWaySync([unlinked, linkedNewer, linkedOlder], [objA, objB, objNew]);
    expect(plan.createInAnytype.map((t) => t.id)).toEqual([unlinked.id]);
    expect(plan.pushToAnytype.map((t) => t.id)).toEqual([linkedNewer.id]);
    expect(plan.pullIntoBlocks.map((p) => p.task.id)).toEqual([linkedOlder.id]);
    expect(plan.createInBlocks.map((o) => o.id)).toEqual(["obj-c"]);
  });

  test("incoming schedule overlap is gated until confirmSchedule", () => {
    const nine = new Date("2026-07-16T09:00:00.000Z");
    const blocker = makeTask({
      name: "Already scheduled",
      status: "doing",
      scheduledAt: nine,
      blockSize: "1hour",
    });
    const target = makeTask({
      name: "Pulled task",
      status: "doing",
      anytypeObjectId: "obj-t",
      updatedAt: new Date("2026-07-01T00:00:00Z"),
    });

    const incoming = {
      ...taskToAnytypeObject(target, "s"),
      id: "obj-t",
      status: "doing" as const,
      scheduledAt: new Date("2026-07-16T09:15:00.000Z"),
      updatedAt: new Date("2026-07-15T00:00:00Z"),
    };

    const plan = planTwoWaySync([blocker, target], [incoming]);
    expect(plan.pullIntoBlocks).toHaveLength(1);
    const pull = plan.pullIntoBlocks[0];
    expect(pull.scheduleConflicts.map((c) => c.taskId)).toContain(blocker.id);

    // Unconfirmed: skipped
    const skipped = applyPull([blocker, target], pull);
    expect(skipped.applied).toBe(false);
    expect(skipped.tasks.find((t) => t.id === target.id)?.scheduledAt).toBeUndefined();

    // Confirmed: applied with push-back — no overlap remains
    const confirmed = applyPull([blocker, target], pull, { confirmSchedule: true });
    expect(confirmed.applied).toBe(true);
    const pulledTask = confirmed.tasks.find((t) => t.id === target.id)!;
    const pushedBlocker = confirmed.tasks.find((t) => t.id === blocker.id)!;
    expect(pulledTask.scheduledAt?.toISOString()).toBe("2026-07-16T09:15:00.000Z");
    // Blocker pushed to after the pulled task's 30min window
    expect(new Date(pushedBlocker.scheduledAt!).getTime()).toBeGreaterThanOrEqual(
      new Date("2026-07-16T09:45:00.000Z").getTime(),
    );
  });

  test("createTaskFromAnytypeObject links the new task", () => {
    const obj = {
      ...taskToAnytypeObject(makeTask({ name: "Fresh from Anytype", status: "review" }), "space-9"),
      id: "obj-new",
      blocksTaskId: undefined,
    };
    const task = createTaskFromAnytypeObject(obj);
    expect(task.name).toBe("Fresh from Anytype");
    expect(task.status).toBe("review");
    expect(task.anytypeObjectId).toBe("obj-new");
    expect(task.anytypeSpaceId).toBe("space-9");
  });
});

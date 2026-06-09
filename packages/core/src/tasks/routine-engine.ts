// ============================================================================
// BLOCKS - Routine Engine
// Spawn grouped tasks from routine templates
// ============================================================================

import { v4 as uuidv4 } from "uuid";
import type { CreateTaskInput, Routine, RoutineItem, Task } from "../types";
import { calculateDuration } from "../types";
import { TaskEngine } from "./task-engine";

export interface SpawnRoutineOptions {
  /** Base time to schedule first task; subsequent tasks chain sequentially */
  startAt?: Date;
  /** Initial status for spawned tasks */
  status?: "todo" | "doing" | "backlog";
}

export interface SpawnRoutineResult {
  tasks: Task[];
  routine: Routine;
}

/**
 * Build CreateTaskInput array from a routine definition.
 */
export function routineToTaskInputs(
  routine: Routine,
  options: SpawnRoutineOptions = {}
): CreateTaskInput[] {
  const status = options.status ?? "todo";
  const sortedItems = [...routine.items].sort((a, b) => a.sortOrder - b.sortOrder);

  let cursor = options.startAt ? new Date(options.startAt) : undefined;

  return sortedItems.map((item) => {
    const input: CreateTaskInput = {
      name: item.name,
      priority: item.priority,
      status,
      blockSize: item.blockSize,
      blockCount: item.blockCount,
      accessContexts: item.accessContexts,
      tags: [...item.tags, routine.name.toLowerCase().replace(/\s+/g, "-")],
      notes: item.notes,
      duration: calculateDuration(item.blockSize, item.blockCount),
      scheduledAt: cursor ? new Date(cursor) : undefined,
      recurrence: "none",
      subtasks: [],
      reminders: [],
      assigneeId: "me",
      isQuickAdd: false,
      isPutzing: false,
    };

    if (cursor) {
      cursor = new Date(cursor.getTime() + (input.duration ?? 30) * 60000);
    }

    return input;
  });
}

/**
 * Spawn tasks from a routine, returning created Task objects (not yet persisted).
 */
export function spawnRoutineTasks(
  routine: Routine,
  options: SpawnRoutineOptions = {}
): Task[] {
  const inputs = routineToTaskInputs(routine, options);
  return inputs.map((input) => TaskEngine.createTask(input));
}

/**
 * Create a default Morning Routine for first-run seeding.
 */
export function createDefaultMorningRoutine(): Routine {
  const now = new Date();
  const items: RoutineItem[] = [
    {
      id: uuidv4(),
      name: "Hydrate & stretch",
      blockSize: "15min",
      blockCount: 1,
      priority: "3",
      accessContexts: ["home"],
      tags: ["morning"],
      sortOrder: 0,
    },
    {
      id: uuidv4(),
      name: "Review calendar & priorities",
      blockSize: "15min",
      blockCount: 1,
      priority: "2",
      accessContexts: ["computer"],
      tags: ["morning", "planning"],
      sortOrder: 1,
    },
    {
      id: uuidv4(),
      name: "Deep work block",
      blockSize: "1hour",
      blockCount: 1,
      priority: "2",
      accessContexts: ["computer"],
      tags: ["morning", "focus"],
      sortOrder: 2,
    },
  ];

  return {
    id: uuidv4(),
    name: "Morning Routine",
    description: "Daily startup sequence",
    icon: "🌅",
    color: "#F97316",
    items,
    scheduledTime: "07:00",
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

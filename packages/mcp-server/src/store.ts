/**
 * File-backed store for Blocks MCP server.
 * Uses @blocks/core business logic; persists to JSON for agent access.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Task, Routine, CreateTaskInput, TaskStatus } from "@blocks/core";
import {
  TaskEngine,
  clearTimelineForNewDay,
  spawnRoutineTasks,
  createDefaultMorningRoutine,
  tasksToTimeBlocks,
} from "@blocks/core";

interface McpData {
  tasks: Task[];
  routines: Routine[];
}

function defaultDataPath(): string {
  return process.env.BLOCKS_MCP_DATA_PATH ?? join(homedir(), ".blocks", "mcp-data.json");
}

function reviveDates<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj), (_k, v) => {
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      return new Date(v);
    }
    return v;
  });
}

export class BlocksMcpStore {
  private dataPath = defaultDataPath();
  private data: McpData = { tasks: [], routines: [] };

  async init(): Promise<void> {
    try {
      const raw = await readFile(this.dataPath, "utf8");
      this.data = reviveDates(JSON.parse(raw));
    } catch {
      this.data = {
        tasks: [],
        routines: [createDefaultMorningRoutine()],
      };
      await this.save();
    }
  }

  private async save(): Promise<void> {
    await mkdir(dirname(this.dataPath), { recursive: true });
    await writeFile(this.dataPath, JSON.stringify(this.data, null, 2), "utf8");
  }

  async listTasks(status?: string): Promise<Task[]> {
    if (status) {
      return this.data.tasks.filter((t) => t.status === status);
    }
    return this.data.tasks;
  }

  async listTimelineTasks(): Promise<Task[]> {
    return tasksToTimeBlocks(this.data.tasks).map((b) => b.task!);
  }

  async createTask(input: {
    name: string;
    status?: string;
    priority?: string;
  }): Promise<Task> {
    const createInput: CreateTaskInput = {
      name: input.name,
      status: (input.status as TaskStatus) ?? "todo",
      priority: (input.priority as CreateTaskInput["priority"]) ?? "3",
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
    };
    const task = TaskEngine.createTask(createInput);
    this.data.tasks.push(task);
    await this.save();
    return task;
  }

  async addToTimeline(taskId: string, scheduledAt: Date): Promise<Task> {
    const idx = this.data.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error(`Task not found: ${taskId}`);
    const updated = TaskEngine.addToTimeline(this.data.tasks[idx], scheduledAt);
    this.data.tasks[idx] = updated;
    await this.save();
    return updated;
  }

  async removeFromTimeline(taskId: string): Promise<Task> {
    const idx = this.data.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error(`Task not found: ${taskId}`);
    const updated = TaskEngine.removeFromTimeline(this.data.tasks[idx]);
    this.data.tasks[idx] = updated;
    await this.save();
    return updated;
  }

  async clearTimeline(): Promise<number> {
    const { clearedCount, updatedTasks } = clearTimelineForNewDay(this.data.tasks);
    for (const updated of updatedTasks) {
      const idx = this.data.tasks.findIndex((t) => t.id === updated.id);
      if (idx !== -1) this.data.tasks[idx] = updated;
    }
    await this.save();
    return clearedCount;
  }

  async spawnRoutine(routineId: string, startAt: Date): Promise<Task[]> {
    const routine = this.data.routines.find((r) => r.id === routineId);
    if (!routine) throw new Error(`Routine not found: ${routineId}`);
    const spawned = spawnRoutineTasks(routine, { startAt, status: "doing" });
    this.data.tasks.push(...spawned);
    routine.usageCount = (routine.usageCount || 0) + 1;
    await this.save();
    return spawned;
  }
}

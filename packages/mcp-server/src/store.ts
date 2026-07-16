/**
 * File-backed store for Blocks MCP server.
 * Modes: file (default JSON) | export (read/write desktop ExportData snapshot)
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Task, Routine, CreateTaskInput, TaskStatus, ExportData } from "@blocks/core";
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
  if (process.env.BLOCKS_MCP_EXPORT_PATH) {
    return process.env.BLOCKS_MCP_EXPORT_PATH;
  }
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
  private mode = process.env.BLOCKS_MCP_MODE ?? "file";
  private data: McpData = { tasks: [], routines: [] };

  async init(): Promise<void> {
    try {
      const raw = await readFile(this.dataPath, "utf8");
      const parsed = reviveDates(JSON.parse(raw));
      if (this.mode === "export" && parsed.tasks && parsed.version) {
        const exp = parsed as ExportData;
        this.data = {
          tasks: exp.tasks ?? [],
          routines: [createDefaultMorningRoutine()],
        };
      } else {
        this.data = parsed as McpData;
      }
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
    if (this.mode === "export") {
      const payload: ExportData = {
        version: "0.0.5",
        exportedAt: new Date().toISOString(),
        tasks: this.data.tasks,
        quickAddBlocks: [],
        timeEntries: [],
        settings: {} as ExportData["settings"],
      };
      await writeFile(this.dataPath, JSON.stringify(payload, null, 2), "utf8");
      return;
    }
    await writeFile(this.dataPath, JSON.stringify(this.data, null, 2), "utf8");
  }

  async listTasks(status?: string): Promise<Task[]> {
    if (status) {
      return this.data.tasks.filter((t) => t.status === status);
    }
    return this.data.tasks;
  }

  /** N-0050: replace the full task list after an Anytype sync pass. */
  async replaceTasks(tasks: Task[]): Promise<void> {
    this.data.tasks = tasks;
    await this.save();
  }

  /** N-0050: persist a single updated task (e.g. after push linking). */
  async updateTask(task: Task): Promise<void> {
    const idx = this.data.tasks.findIndex((t) => t.id === task.id);
    if (idx === -1) throw new Error(`Task not found: ${task.id}`);
    this.data.tasks[idx] = task;
    await this.save();
  }

  async listTimelineTasks(): Promise<Task[]> {
    return tasksToTimeBlocks(this.data.tasks).map((b) => b.task!);
  }

  async exportTasksMarkdown(): Promise<string> {
    const lines = ["# Blocks tasks export", ""];
    for (const task of this.data.tasks) {
      lines.push(`## ${task.name}`);
      lines.push(`- Status: ${task.status}`);
      lines.push(`- Priority: ${task.priority}`);
      if (task.scheduledAt) {
        lines.push(`- Scheduled: ${new Date(task.scheduledAt).toISOString()}`);
      }
      if (task.notes) lines.push(`\n${task.notes}\n`);
    }
    return lines.join("\n");
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

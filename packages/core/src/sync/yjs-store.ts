// ============================================================================
// BLOCKS - Yjs Document Store
// CRDT-based storage for conflict-free sync
// ============================================================================

import * as Y from "yjs";
import type { Task, Settings, QuickAddBlock } from "../types";

/**
 * Task stored in Yjs (dates as ISO strings for serialization)
 */
export interface YjsTask extends Omit<Task, "createdAt" | "updatedAt" | "scheduledAt" | "dueDate" | "startedAt" | "completedAt"> {
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Convert Task to Yjs-compatible format (dates to ISO strings)
 */
export function taskToYjs(task: Task): YjsTask {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    scheduledAt: task.scheduledAt?.toISOString(),
    dueDate: task.dueDate?.toISOString(),
    startedAt: task.startedAt?.toISOString(),
    completedAt: task.completedAt?.toISOString(),
    subtasks: task.subtasks.map(st => ({ ...st })),
  };
}

/**
 * Convert Yjs format back to Task (ISO strings to Date objects)
 */
export function yjsToTask(yjsTask: YjsTask): Task {
  return {
    ...yjsTask,
    createdAt: new Date(yjsTask.createdAt),
    updatedAt: new Date(yjsTask.updatedAt),
    scheduledAt: yjsTask.scheduledAt ? new Date(yjsTask.scheduledAt) : undefined,
    dueDate: yjsTask.dueDate ? new Date(yjsTask.dueDate) : undefined,
    startedAt: yjsTask.startedAt ? new Date(yjsTask.startedAt) : undefined,
    completedAt: yjsTask.completedAt ? new Date(yjsTask.completedAt) : undefined,
  };
}

/**
 * Yjs Document Store - manages the shared CRDT document
 */
export class YjsStore {
  private doc: Y.Doc;
  private tasksMap: Y.Map<YjsTask>;
  private settingsMap: Y.Map<unknown>;
  private quickBlocksMap: Y.Map<QuickAddBlock>;
  private static instance: YjsStore | null = null;

  private constructor() {
    this.doc = new Y.Doc();
    this.tasksMap = this.doc.getMap<YjsTask>("tasks");
    this.settingsMap = this.doc.getMap<unknown>("settings");
    this.quickBlocksMap = this.doc.getMap<QuickAddBlock>("quickBlocks");
  }

  /**
   * Get singleton instance
   */
  static getInstance(): YjsStore {
    if (!YjsStore.instance) {
      YjsStore.instance = new YjsStore();
    }
    return YjsStore.instance;
  }

  /**
   * Get the underlying Y.Doc for provider connection
   */
  getDoc(): Y.Doc {
    return this.doc;
  }

  // -------------------------------------------------------------------------
  // Tasks CRUD
  // -------------------------------------------------------------------------

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    const tasks: Task[] = [];
    this.tasksMap.forEach((yjsTask) => {
      tasks.push(yjsToTask(yjsTask));
    });
    return tasks;
  }

  /**
   * Get a single task by ID
   */
  getTask(id: string): Task | null {
    const yjsTask = this.tasksMap.get(id);
    return yjsTask ? yjsToTask(yjsTask) : null;
  }

  /**
   * Create or update a task
   */
  setTask(task: Task): void {
    this.tasksMap.set(task.id, taskToYjs(task));
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): void {
    this.tasksMap.delete(id);
  }

  /**
   * Subscribe to task changes
   */
  observeTasks(callback: (tasks: Task[]) => void): () => void {
    const handler = () => {
      callback(this.getTasks());
    };
    this.tasksMap.observe(handler);
    return () => this.tasksMap.unobserve(handler);
  }

  // -------------------------------------------------------------------------
  // Settings
  // -------------------------------------------------------------------------

  /**
   * Get settings
   */
  getSettings(): Partial<Settings> {
    const settings: Partial<Settings> = {};
    this.settingsMap.forEach((value, key) => {
      (settings as Record<string, unknown>)[key] = value;
    });
    return settings;
  }

  /**
   * Update settings
   */
  updateSettings(updates: Partial<Settings>): void {
    Object.entries(updates).forEach(([key, value]) => {
      this.settingsMap.set(key, value);
    });
  }

  /**
   * Subscribe to settings changes
   */
  observeSettings(callback: (settings: Partial<Settings>) => void): () => void {
    const handler = () => {
      callback(this.getSettings());
    };
    this.settingsMap.observe(handler);
    return () => this.settingsMap.unobserve(handler);
  }

  // -------------------------------------------------------------------------
  // Quick Add Blocks
  // -------------------------------------------------------------------------

  /**
   * Get all quick add blocks
   */
  getQuickBlocks(): QuickAddBlock[] {
    const blocks: QuickAddBlock[] = [];
    this.quickBlocksMap.forEach((block) => {
      blocks.push(block);
    });
    return blocks.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Set a quick add block
   */
  setQuickBlock(block: QuickAddBlock): void {
    this.quickBlocksMap.set(block.id, block);
  }

  /**
   * Delete a quick add block
   */
  deleteQuickBlock(id: string): void {
    this.quickBlocksMap.delete(id);
  }

  // -------------------------------------------------------------------------
  // Bulk Operations
  // -------------------------------------------------------------------------

  /**
   * Import data from Dexie export format
   */
  importFromDexie(data: { tasks: Task[]; quickAddBlocks: QuickAddBlock[]; settings?: Partial<Settings> }): void {
    this.doc.transact(() => {
      // Import tasks
      data.tasks.forEach((task) => {
        this.setTask(task);
      });

      // Import quick blocks
      data.quickAddBlocks.forEach((block) => {
        this.setQuickBlock(block);
      });

      // Import settings
      if (data.settings) {
        this.updateSettings(data.settings);
      }
    });
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.doc.transact(() => {
      this.tasksMap.clear();
      this.settingsMap.clear();
      this.quickBlocksMap.clear();
    });
  }

  /**
   * Get document state as Uint8Array (for persistence)
   */
  getState(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  /**
   * Apply state update from another peer
   */
  applyUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.doc, update);
  }
}

export default YjsStore;


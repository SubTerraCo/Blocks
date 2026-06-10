// ============================================================================
// BLOCKS - Dexie.js Storage Implementation (Web/Desktop)
// ============================================================================

import Dexie, { type Table } from "dexie";
import type {
  Task,
  QuickAddBlock,
  User,
  Settings,
  TimeEntry,
  SearchFilters,
  SearchResult,
  TaskTemplate,
  Tag,
  Routine,
} from "../types";
import type {
  IStorageWithEvents,
  ExportData,
  StorageEvent,
  StorageEventHandler,
} from "./storage-interface";
import { SettingsSchema } from "../types";
import { createDefaultMorningRoutine } from "../tasks/routine-engine";

/**
 * Dexie database schema for Blocks
 */
class BlocksDatabase extends Dexie {
  tasks!: Table<Task, string>;
  quickAddBlocks!: Table<QuickAddBlock, string>;
  users!: Table<User, string>;
  settings!: Table<Settings & { id: string }, string>;
  timeEntries!: Table<TimeEntry, string>;
  taskTemplates!: Table<TaskTemplate, string>;
  tags!: Table<Tag, string>;
  routines!: Table<Routine, string>;

  constructor() {
    super("BlocksDB");

    // Version 1: Original schema
    this.version(1).stores({
      tasks: "id, name, status, priority, category, scheduledAt, dueDate, createdAt, updatedAt",
      quickAddBlocks: "id, name, sortOrder, createdAt",
      users: "id, email",
      settings: "id",
      timeEntries: "id, taskId, startTime, createdAt",
    });
    
    // Version 2: Add templates and tags
    this.version(2).stores({
      tasks: "id, name, status, priority, category, scheduledAt, dueDate, createdAt, updatedAt, parentTaskId, recurrence, *tags",
      quickAddBlocks: "id, name, sortOrder, createdAt",
      users: "id, email",
      settings: "id",
      timeEntries: "id, taskId, startTime, createdAt",
      taskTemplates: "id, name, category, usageCount, createdAt",
      tags: "id, name, usageCount, createdAt",
    });

    this.version(3).stores({
      tasks: "id, name, status, priority, category, scheduledAt, dueDate, createdAt, updatedAt, parentTaskId, recurrence, *tags",
      quickAddBlocks: "id, name, sortOrder, createdAt",
      users: "id, email",
      settings: "id",
      timeEntries: "id, taskId, startTime, createdAt",
      taskTemplates: "id, name, category, usageCount, createdAt",
      tags: "id, name, usageCount, createdAt",
      routines: "id, name, usageCount, createdAt",
    });
  }
}

/**
 * Dexie-based storage implementation
 */
export class DexieStorage implements IStorageWithEvents {
  private db: BlocksDatabase;
  private eventHandlers: Set<StorageEventHandler> = new Set();
  private static instance: DexieStorage | null = null;

  private constructor() {
    this.db = new BlocksDatabase();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DexieStorage {
    if (!DexieStorage.instance) {
      DexieStorage.instance = new DexieStorage();
    }
    return DexieStorage.instance;
  }

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  async init(): Promise<void> {
    await this.db.open();
    
    // Initialize default settings if not exists
    const existingSettings = await this.db.settings.get("default");
    if (!existingSettings) {
      const defaultSettings = SettingsSchema.parse({});
      await this.db.settings.put({ ...defaultSettings, id: "default" });
    }

    // Seed default routines if none exist
    const routineCount = await this.db.routines.count();
    if (routineCount === 0) {
      await this.db.routines.add(createDefaultMorningRoutine());
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }

  // -------------------------------------------------------------------------
  // Tasks
  // -------------------------------------------------------------------------

  async getTasks(): Promise<Task[]> {
    return this.db.tasks.toArray();
  }

  async getTask(id: string): Promise<Task | null> {
    const task = await this.db.tasks.get(id);
    return task ?? null;
  }

  async createTask(task: Task): Promise<Task> {
    await this.db.tasks.add(task);
    this.emit({ type: "task:created", data: task, timestamp: new Date() });
    return task;
  }

  async updateTask(task: Task): Promise<Task> {
    await this.db.tasks.put(task);
    this.emit({ type: "task:updated", data: task, timestamp: new Date() });
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await this.db.tasks.delete(id);
    this.emit({ type: "task:deleted", data: { id }, timestamp: new Date() });
  }

  async searchTasks(filters: SearchFilters): Promise<SearchResult> {
    let collection = this.db.tasks.toCollection();

    // Apply filters
    const tasks = await collection.toArray();
    
    let filtered = tasks;

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.location?.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((t) => filters.status!.includes(t.status));
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((t) => filters.priority!.includes(t.priority));
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(
        (t) => t.category && filters.category!.includes(t.category)
      );
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((t) =>
        filters.tags!.some((tag) => t.tags.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (t) => t.createdAt >= filters.dateFrom!
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (t) => t.createdAt <= filters.dateTo!
      );
    }

    // Exclude done/completed unless specified
    if (!filters.includeCompleted) {
      filtered = filtered.filter((t) => t.status !== "done");
    }

    // Sort by priority then by created date
    filtered.sort((a, b) => {
      const priorityDiff = parseInt(a.priority) - parseInt(b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return {
      tasks: filtered,
      totalCount: filtered.length,
      hasMore: false,
    };
  }

  // -------------------------------------------------------------------------
  // Quick Add Blocks
  // -------------------------------------------------------------------------

  async getQuickAddBlocks(): Promise<QuickAddBlock[]> {
    return this.db.quickAddBlocks.orderBy("sortOrder").toArray();
  }

  async getQuickAddBlock(id: string): Promise<QuickAddBlock | null> {
    const block = await this.db.quickAddBlocks.get(id);
    return block ?? null;
  }

  async createQuickAddBlock(block: QuickAddBlock): Promise<QuickAddBlock> {
    await this.db.quickAddBlocks.add(block);
    this.emit({ type: "quickblock:created", data: block, timestamp: new Date() });
    return block;
  }

  async updateQuickAddBlock(block: QuickAddBlock): Promise<QuickAddBlock> {
    await this.db.quickAddBlocks.put(block);
    this.emit({ type: "quickblock:updated", data: block, timestamp: new Date() });
    return block;
  }

  async deleteQuickAddBlock(id: string): Promise<void> {
    await this.db.quickAddBlocks.delete(id);
    this.emit({ type: "quickblock:deleted", data: { id }, timestamp: new Date() });
  }

  // -------------------------------------------------------------------------
  // User
  // -------------------------------------------------------------------------

  async getUser(): Promise<User | null> {
    const users = await this.db.users.toArray();
    return users[0] ?? null;
  }

  async setUser(user: User): Promise<User> {
    // Clear existing users and set new one
    await this.db.users.clear();
    await this.db.users.add(user);
    this.emit({ type: "user:updated", data: user, timestamp: new Date() });
    return user;
  }

  async clearUser(): Promise<void> {
    await this.db.users.clear();
    this.emit({ type: "user:updated", data: null, timestamp: new Date() });
  }

  // -------------------------------------------------------------------------
  // Settings
  // -------------------------------------------------------------------------

  async getSettings(): Promise<Settings> {
    const settings = await this.db.settings.get("default");
    if (!settings) {
      return SettingsSchema.parse({});
    }
    const { id: _, ...settingsWithoutId } = settings;
    return SettingsSchema.parse(settingsWithoutId);
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const updated = { ...current, ...updates, id: "default" };
    await this.db.settings.put(updated);
    
    const { id: _, ...settingsWithoutId } = updated;
    this.emit({ type: "settings:updated", data: settingsWithoutId, timestamp: new Date() });
    return settingsWithoutId as Settings;
  }

  // -------------------------------------------------------------------------
  // Time Entries
  // -------------------------------------------------------------------------

  async getTimeEntries(taskId?: string): Promise<TimeEntry[]> {
    if (taskId) {
      return this.db.timeEntries.where("taskId").equals(taskId).toArray();
    }
    return this.db.timeEntries.toArray();
  }

  async createTimeEntry(entry: TimeEntry): Promise<TimeEntry> {
    await this.db.timeEntries.add(entry);
    return entry;
  }

  async updateTimeEntry(entry: TimeEntry): Promise<TimeEntry> {
    await this.db.timeEntries.put(entry);
    return entry;
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await this.db.timeEntries.delete(id);
  }

  // -------------------------------------------------------------------------
  // Bulk Operations
  // -------------------------------------------------------------------------

  async importData(data: ExportData): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.tasks, this.db.quickAddBlocks, this.db.timeEntries, this.db.settings],
      async () => {
        // Clear existing data
        await this.db.tasks.clear();
        await this.db.quickAddBlocks.clear();
        await this.db.timeEntries.clear();

        // Import new data
        if (data.tasks.length > 0) {
          await this.db.tasks.bulkAdd(data.tasks);
        }
        if (data.quickAddBlocks.length > 0) {
          await this.db.quickAddBlocks.bulkAdd(data.quickAddBlocks);
        }
        if (data.timeEntries.length > 0) {
          await this.db.timeEntries.bulkAdd(data.timeEntries);
        }
        if (data.settings) {
          await this.db.settings.put({ ...data.settings, id: "default" });
        }
      }
    );
  }

  async exportData(): Promise<ExportData> {
    const [tasks, quickAddBlocks, timeEntries, settings] = await Promise.all([
      this.getTasks(),
      this.getQuickAddBlocks(),
      this.getTimeEntries(),
      this.getSettings(),
    ]);

    return {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      tasks,
      quickAddBlocks,
      timeEntries,
      settings,
    };
  }

  async clearAllData(): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.tasks, this.db.quickAddBlocks, this.db.timeEntries, this.db.users],
      async () => {
        await this.db.tasks.clear();
        await this.db.quickAddBlocks.clear();
        await this.db.timeEntries.clear();
        await this.db.users.clear();
      }
    );
  }

  // -------------------------------------------------------------------------
  // Task Templates
  // -------------------------------------------------------------------------

  async getTaskTemplates(): Promise<TaskTemplate[]> {
    return this.db.taskTemplates.orderBy("usageCount").reverse().toArray();
  }

  async getTaskTemplate(id: string): Promise<TaskTemplate | undefined> {
    return this.db.taskTemplates.get(id);
  }

  async createTaskTemplate(template: TaskTemplate): Promise<TaskTemplate> {
    await this.db.taskTemplates.add(template);
    return template;
  }

  async updateTaskTemplate(id: string, updates: Partial<TaskTemplate>): Promise<TaskTemplate> {
    await this.db.taskTemplates.update(id, { ...updates, updatedAt: new Date() });
    const updated = await this.db.taskTemplates.get(id);
    if (!updated) throw new Error(`Template ${id} not found`);
    return updated;
  }

  async deleteTaskTemplate(id: string): Promise<void> {
    await this.db.taskTemplates.delete(id);
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    const template = await this.db.taskTemplates.get(id);
    if (template) {
      await this.db.taskTemplates.update(id, { usageCount: (template.usageCount || 0) + 1 });
    }
  }

  // -------------------------------------------------------------------------
  // Tags
  // -------------------------------------------------------------------------

  async getTags(): Promise<Tag[]> {
    return this.db.tags.orderBy("usageCount").reverse().toArray();
  }

  async getTag(id: string): Promise<Tag | undefined> {
    return this.db.tags.get(id);
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    return this.db.tags.where("name").equalsIgnoreCase(name).first();
  }

  async createTag(tag: Tag): Promise<Tag> {
    await this.db.tags.add(tag);
    return tag;
  }

  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    await this.db.tags.update(id, updates);
    const updated = await this.db.tags.get(id);
    if (!updated) throw new Error(`Tag ${id} not found`);
    return updated;
  }

  async deleteTag(id: string): Promise<void> {
    await this.db.tags.delete(id);
  }

  async incrementTagUsage(name: string): Promise<void> {
    const tag = await this.getTagByName(name);
    if (tag) {
      await this.db.tags.update(tag.id, { usageCount: (tag.usageCount || 0) + 1 });
    }
  }

  async getTasksByTag(tagName: string): Promise<Task[]> {
    return this.db.tasks.where("tags").equals(tagName).toArray();
  }

  // -------------------------------------------------------------------------
  // Recurring Tasks
  // -------------------------------------------------------------------------

  async getRecurringTasks(): Promise<Task[]> {
    return this.db.tasks
      .where("recurrence")
      .notEqual("none")
      .filter((t) => !t.isRecurringInstance)
      .toArray();
  }

  async getRecurringInstances(parentTaskId: string): Promise<Task[]> {
    return this.db.tasks.where("parentTaskId").equals(parentTaskId).toArray();
  }

  // -------------------------------------------------------------------------
  // Routines (Grouped Tasks)
  // -------------------------------------------------------------------------

  async getRoutines(): Promise<Routine[]> {
    return this.db.routines.orderBy("usageCount").reverse().toArray();
  }

  async getRoutine(id: string): Promise<Routine | undefined> {
    return this.db.routines.get(id);
  }

  async createRoutine(routine: Routine): Promise<Routine> {
    await this.db.routines.add(routine);
    return routine;
  }

  async updateRoutine(id: string, updates: Partial<Routine>): Promise<Routine> {
    await this.db.routines.update(id, { ...updates, updatedAt: new Date() });
    const updated = await this.db.routines.get(id);
    if (!updated) throw new Error(`Routine ${id} not found`);
    return updated;
  }

  async deleteRoutine(id: string): Promise<void> {
    await this.db.routines.delete(id);
  }

  async incrementRoutineUsage(id: string): Promise<void> {
    const routine = await this.db.routines.get(id);
    if (routine) {
      await this.db.routines.update(id, { usageCount: (routine.usageCount || 0) + 1 });
    }
  }

  // -------------------------------------------------------------------------
  // Event System
  // -------------------------------------------------------------------------

  subscribe(handler: StorageEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  emit(event: StorageEvent): void {
    this.eventHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error("Storage event handler error:", error);
      }
    });
  }
}


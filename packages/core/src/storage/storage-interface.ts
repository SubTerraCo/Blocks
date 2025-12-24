// ============================================================================
// BLOCKS - Storage Interface (Platform-Agnostic)
// ============================================================================

import type {
  Task,
  QuickAddBlock,
  User,
  Settings,
  TimeEntry,
  SearchFilters,
  SearchResult,
} from "../types";

/**
 * Storage interface that must be implemented by platform-specific storage
 * - Web/Electron: Dexie.js (IndexedDB)
 * - React Native: expo-sqlite
 */
export interface IStorage {
  // Initialization
  init(): Promise<void>;
  close(): Promise<void>;
  
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(task: Task): Promise<Task>;
  updateTask(task: Task): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  searchTasks(filters: SearchFilters): Promise<SearchResult>;
  
  // Quick Add Blocks
  getQuickAddBlocks(): Promise<QuickAddBlock[]>;
  getQuickAddBlock(id: string): Promise<QuickAddBlock | null>;
  createQuickAddBlock(block: QuickAddBlock): Promise<QuickAddBlock>;
  updateQuickAddBlock(block: QuickAddBlock): Promise<QuickAddBlock>;
  deleteQuickAddBlock(id: string): Promise<void>;
  
  // User
  getUser(): Promise<User | null>;
  setUser(user: User): Promise<User>;
  clearUser(): Promise<void>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
  
  // Time Entries
  getTimeEntries(taskId?: string): Promise<TimeEntry[]>;
  createTimeEntry(entry: TimeEntry): Promise<TimeEntry>;
  updateTimeEntry(entry: TimeEntry): Promise<TimeEntry>;
  deleteTimeEntry(id: string): Promise<void>;
  
  // Bulk operations
  importData(data: ExportData): Promise<void>;
  exportData(): Promise<ExportData>;
  clearAllData(): Promise<void>;
}

/**
 * Data export format
 */
export interface ExportData {
  version: string;
  exportedAt: string;
  tasks: Task[];
  quickAddBlocks: QuickAddBlock[];
  timeEntries: TimeEntry[];
  settings: Settings;
}

/**
 * Storage events for real-time updates
 */
export type StorageEventType = 
  | "task:created"
  | "task:updated"
  | "task:deleted"
  | "quickblock:created"
  | "quickblock:updated"
  | "quickblock:deleted"
  | "settings:updated"
  | "user:updated";

export interface StorageEvent {
  type: StorageEventType;
  data?: unknown;
  timestamp: Date;
}

export type StorageEventHandler = (event: StorageEvent) => void;

/**
 * Extended storage with event support
 */
export interface IStorageWithEvents extends IStorage {
  subscribe(handler: StorageEventHandler): () => void;
  emit(event: StorageEvent): void;
}


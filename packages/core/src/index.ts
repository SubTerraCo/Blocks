// ============================================================================
// BLOCKS - Core Package Entry Point
// ============================================================================

// Types
export * from "./types";

// Task Engine
export { TaskEngine } from "./tasks";

// AI Service
export { AIService } from "./ai";
export type { AIConfig, TimeGap, AIPromptContext } from "./ai";

// Storage Interface
export type {
  IStorage,
  IStorageWithEvents,
  ExportData,
  StorageEvent,
  StorageEventType,
  StorageEventHandler,
} from "./storage";

export { DexieStorage } from "./storage";

// Calendar Service
export { CalendarService } from "./calendar";
export type {
  CalendarCredentials,
  CalendarInfo,
  CalendarSyncOptions,
} from "./calendar";

// Version
export const VERSION = "0.1.0";


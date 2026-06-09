// ============================================================================
// BLOCKS - Core Package Entry Point
// ============================================================================

// Types
export * from "./types";

// Task Engine
export { TaskEngine, routineToTaskInputs, spawnRoutineTasks, createDefaultMorningRoutine } from "./tasks";
export type { SpawnRoutineOptions, SpawnRoutineResult } from "./tasks";

// Timeline
export {
  isSameCalendarDay,
  isTimelineTask,
  getTimelineTasksForDay,
  tasksToTimeBlocks,
  removeFromTimelineUpdates,
  addToTimelineUpdates,
  clearTimelineForNewDay,
  clearDailyTimeline,
  msUntilMidnight,
} from "./timeline";
export type { ClearTimelineResult } from "./timeline";

// Recurring Engine
export {
  getNextOccurrence,
  generateRecurringInstances,
  createRecurringInstance,
  getNextOccurrences,
  buildRecurrencePattern,
} from "./tasks/recurring-engine";

// AI Service
export { AIService, GeminiService, AIOfflineError } from "./ai";
export type {
  AIConfig,
  TimeGap,
  AIPromptContext,
  GeminiConfig,
  ChatMessage,
  SchedulingSuggestion,
  TaskContext,
} from "./ai";

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

// Sync (Yjs CRDT)
export {
  YjsStore,
  taskToYjs,
  yjsToTask,
  BaseSyncProvider,
  NullSyncProvider,
  WebRTCSyncProvider,
} from "./sync";
export type {
  YjsTask,
  ISyncProvider,
  SyncStatus,
  SyncEvent,
  SyncEventHandler,
  WebRTCSyncConfig,
} from "./sync";

// Version
export const VERSION = "0.0.3";


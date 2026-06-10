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
  DEFAULT_TIMELINE_WINDOW_DAYS,
  formatDayKey,
  getTimelineWindow,
  isDateInTimelineWindow,
  isTimelineTaskInWindow,
  getTimelineTasksInWindow,
  tasksToTimeBlocksInWindow,
  generateRollingTimelineSlots,
  isSameHour,
  startOfDay,
  addDays,
  getWeekStripDays,
  computeMidnightBoundaryProgress,
  dayKeyToDate,
  previousDayKey,
  weekStripSelectionOffset,
} from "./timeline";
export type {
  ClearTimelineResult,
  TimelineWindow,
  TimelineHourSlot,
  MidnightBoundary,
  MidnightBoundaryProgress,
} from "./timeline";
export {
  TIMELINE_DAY_HEADER_HEIGHT_PX,
  getTimelineYOffsetForTime,
  getScrollTopToCenterTime,
  getScrollTopToAlignTime,
  getScrollTopForDayStart,
  getDownstreamTimelineTasks,
  TIMELINE_NOW_BAR_MIN_RATIO,
  TIMELINE_NOW_BAR_MAX_RATIO,
  TIMELINE_NOW_BAR_SNAP_POINTS,
  clampTimelineNowBarRatio,
  softSnapTimelineNowBarRatio,
  getTaskDurationMinutes,
  getRemainingTimelineSlotMs,
  buildDownstreamScheduleShiftUpdates,
} from "./timeline";

export {
  WeekStartsOnSchema,
  WEEK_DAY_LABELS,
  WEEK_DAY_TO_NUMBER,
  NUMBER_TO_WEEK_DAY,
  getOrderedWeekDays,
  isWorkDaySelected,
  toggleWorkDayNumber,
} from "./settings/week-start";
export type { WeekStartsOn, WeekDayKey } from "./settings/week-start";

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
export {
  CalendarService,
  getTasksWithDueDate,
  getTasksDueOnDay,
  getCalendarMonthGrid,
  isSameMonth,
  formatMonthTitle,
  parseLocalDateInput,
} from "./calendar";
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
export const VERSION = "0.0.4";

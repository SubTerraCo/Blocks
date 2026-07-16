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
  getNextScheduledTimelineTask,
  SINGLE_FOCUS_TASK_SCHEDULING,
  taskTimeRange,
  rangesOverlap,
  findOverlappingScheduledTasks,
  findOverlappingCalendarEvents,
  analyzeSchedulePlacement,
  buildTimelineInsertPushBackUpdates,
  hasTaskTimelineOverlaps,
  computeTimelineOverlapLayout,
  overlapLayoutToStyle,
} from "./timeline";
export type {
  TaskTimeRange,
  ScheduleConflict,
  CalendarScheduleConflict,
  SchedulePlacementAnalysis,
  OverlapLayout,
} from "./timeline";
export { planScheduleDoingTasks } from "./timeline";
export type { ScheduleDoingTasksInput, ScheduleDoingPlan } from "./timeline";
export {
  isUserEventTask,
  isAllDayUserEvent,
  getAllDayUserEventsForDay,
  userEventsToTimedBlocks,
  getTasksForCalendarDay,
  rescheduleUserEventTask,
  userEventOccursOnDay,
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

// Kanban sort + filter (N-0048 · N-0049)
export {
  sortKanbanTasks,
  filterKanbanTasks,
  taskMatchesKanbanFilter,
  isKanbanFilterActive,
  buildKanbanBoard,
} from "./kanban";
export type { KanbanBoard } from "./kanban";

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
  generateContinuousCalendarWeeks,
  formatDualMonthHeader,
  isCurrentCalendarWeek,
  getOrderedWeekDayLabels,
  buildGoogleOAuthStartUrl,
  parseOAuthHash,
  getGoogleProvider,
  isGoogleTokenValid,
  tokensToGoogleProvider,
  mergeGoogleProviderIntoUser,
  refreshGoogleAccessToken,
  ensureValidGoogleTokens,
  getOAuthProxyBaseUrl,
  GOOGLE_CALENDAR_SCOPES,
  BLOCKS_OAUTH_PROXY_PRODUCTION_URL,
  BLOCKS_OAUTH_PROXY_DEV_URL,
  resolveOAuthProxyBaseUrl,
  isLikelyOAuthDevContext,
  syncCalendarEvents,
  calendarEventsToTimeBlocks,
  mergeTimelineBlocks,
  credentialsFromTokens,
} from "./calendar";
export type {
  CalendarCredentials,
  CalendarInfo,
  CalendarSyncOptions,
  GoogleOAuthTokens,
  ParsedOAuthHash,
  CalendarSyncInput,
  ResolveOAuthProxyOptions,
} from "./calendar";
export type { CalendarWeekRow } from "./calendar";

// Anytype two-way sync (N-0050)
export {
  ANYTYPE_DEFAULT_BASE_URL,
  ANYTYPE_DEFAULT_API_VERSION,
  AnytypeUnavailableError,
  BLOCKS_TO_ANYTYPE_STATUS,
  ANYTYPE_PROP_KEYS,
  anytypeStatusToBlocks,
  taskToAnytypeObject,
  applyAnytypeObjectToTask,
  decodeAnytypeApiObject,
  encodeAnytypeApiObject,
  AnytypeClient,
  resolveLww,
  planTwoWaySync,
  applyPull,
  createTaskFromAnytypeObject,
  AnytypeSyncEngine,
} from "./integrations/anytype";
export type {
  AnytypeTaskObject,
  AnytypeApiObject,
  AnytypeApiProperty,
  AnytypeSpace,
  AnytypeClientConfig,
  LwwWinner,
  SyncPlan,
  PendingPull,
  ApplyPullResult,
  SyncResult,
  AnytypeSyncEngineConfig,
} from "./integrations/anytype";

// Sync (Yjs CRDT)
export {
  YjsStore,
  taskToYjs,
  yjsToTask,
  BaseSyncProvider,
  NullSyncProvider,
  WebRTCSyncProvider,
  DexieYjsBridge,
} from "./sync";
export type {
  YjsTask,
  ISyncProvider,
  SyncStatus,
  SyncEvent,
  SyncEventHandler,
  WebRTCSyncConfig,
  DexieYjsBridgeOptions,
} from "./sync";

// Version
export const VERSION = "26.06.12";

// ============================================================================
// BLOCKS - Hooks Export
// ============================================================================

export { useTaskStore } from "./use-task-store";
export { useSettingsStore } from "./use-settings-store";
export { useQuickBlocksStore } from "./use-quick-blocks-store";
export { useOnlineStatus } from "./use-online-status";
export { useLocalSettingsFlag } from "./use-local-settings-flag";
export { useDailyTimelineReset } from "./use-daily-timeline-reset";
export { useRollingTimeline } from "./use-rolling-timeline";
export { useTimelineSelectedDay } from "./use-timeline-selected-day";
export { useTimelineScrollDaySync } from "./use-timeline-scroll-day-sync";
export type { TimelineScrollDaySyncState } from "./use-timeline-scroll-day-sync";
export { useTimelineViewMode } from "./use-timeline-view-mode";
export type { TimelineViewMode } from "./use-timeline-view-mode";
export {
  exitToTimelineView,
  resetCalendarScrollSession,
  useCalendarScrollResetToken,
  EXIT_CALENDAR_EVENT,
  CALENDAR_SCROLL_RESET_KEY,
} from "./use-timeline-view-mode";
export {
  useTimelineNowFollow,
  timelineEntrySnapDay,
} from "./use-timeline-now-follow";
export type {
  UseTimelineNowFollowOptions,
  TimelineNowFollowState,
} from "./use-timeline-now-follow";
export {
  useTimelineBlockDrag,
} from "./use-timeline-block-drag";
export type { UseTimelineBlockDragOptions } from "./use-timeline-block-drag";
export {
  DraggableTimelineBlock,
  TimelineDragDropPreview,
  TimelineDragOverlay,
} from "../components/timeline-drag-components";
export type {
  DraggableTimelineBlockProps,
  TimelineDragDropPreviewProps,
} from "../components/timeline-drag-components";
export { useRoutinesStore } from "./use-routines-store";
export { useTheme, useThemePreference, type Theme, type ResolvedTheme } from "./use-theme";
export { useGoogleCalendarAuth } from "./use-google-calendar-auth";
export { useProfileGoogleAuth } from "./use-profile-google-auth";
export type { ProfileIdentity } from "./use-profile-google-auth";
export { useCalendarSync } from "./use-calendar-sync";
export { useSyncStore } from "./use-sync-store";
export {
  useTimelineSchedule,
  checkCalendarConflictsForNewTask,
} from "./use-timeline-schedule";
export type {
  PendingScheduleConflict,
  UseTimelineScheduleOptions,
} from "./use-timeline-schedule";

// ============================================================================
// BLOCKS - UI Package Entry Point
// ============================================================================

// Components
export * from "./components";

// Hooks
export * from "./hooks";

// Utilities
export { cn, formatDuration, formatTime, formatDate, getPriorityColor, getPriorityLabel, truncate, getInitials, isSameDay } from "./lib/utils";
export { TIMELINE_HOUR_HEIGHT_PX, formatDayHeader } from "./lib/timeline-rolling";
export {
  TIMELINE_BOTTOM_ACTION_BTN,
  TIMELINE_BOTTOM_ACTION_BTN_SM,
  TIMELINE_BOTTOM_ACTION_FIXED,
  TIMELINE_TRACKING_PLAYER_ROW,
  TASK_EDIT_BOTTOM_BAR,
} from "./lib/timeline-bottom-actions";
export {
  snapWithTaskEdges,
  snapToQuarterHour,
  scheduleImmediatelyAt,
} from "./lib/timeline-drag-position";

// Design tokens
export { colors, typography, spacing, borderRadius, shadows, transitions, zIndex, breakpoints, layout } from "./styles/tokens";

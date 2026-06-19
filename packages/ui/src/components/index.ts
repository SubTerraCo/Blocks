// ============================================================================
// BLOCKS - UI Components Export
// ============================================================================

// Icons
export * from "./icons";

// Core components
export { TaskCard, type TaskCardProps } from "./task-card";
export { TimelineBlock, type TimelineBlockProps } from "./timeline-block";
export {
  QuickAddTile,
  QuickAddGrid,
  EditableQuickAddGrid,
  type QuickAddTileProps,
  type QuickAddGridProps,
  type EditableQuickAddGridProps,
} from "./quick-add-tile";
export { BottomNav, type BottomNavProps, type NavItem } from "./bottom-nav";
export { TopBar, type TopBarProps } from "./top-bar";

// Modal components
export { CreateBlockModal, type CreateBlockModalProps } from "./create-block-modal";

// Form components
export { Button, type ButtonProps } from "./button";
export { SlideToggle, type SlideToggleProps } from "./slide-toggle";
export { HourFormat24Field, type HourFormat24FieldProps } from "./hour-format-field";
export { Input, Textarea, type InputProps, type TextareaProps } from "./input";
export { Select, type SelectProps, type SelectOption } from "./select";
export { ThemeSync } from "./theme-sync";
export { AccentSync } from "./accent-sync";
export { AccentColorFields, type AccentColorFieldsProps } from "./accent-color-fields";
export {
  applyAccentColorsToDocument,
  readAccentColorsFromStorage,
  DEFAULT_ACCENT_PRIMARY,
  DEFAULT_ACCENT_SECONDARY,
  normalizeHexColor,
} from "../lib/accent-colors";
export { TimelineWeekStrip, type TimelineWeekStripProps, CALENDAR_GUTTER_CLASS } from "./timeline-week-strip";
export { DueDateCalendar, type DueDateCalendarProps } from "./due-date-calendar";
export {
  ContinuousScrollCalendar,
  type ContinuousScrollCalendarProps,
} from "./continuous-scroll-calendar";
export { TimelineAllDayStrip, type TimelineAllDayStripProps } from "./timeline-all-day-strip";
export { TimelineViewToggle, type TimelineViewToggleProps } from "./timeline-view-toggle";
export { TimelineSnapDelayField, type TimelineSnapDelayFieldProps } from "./timeline-snap-delay-field";
export { TaskScheduleBehaviorField, type TaskScheduleBehaviorFieldProps } from "./task-schedule-behavior-field";
export {
  TimelineNowBarOffsetField,
  type TimelineNowBarOffsetFieldProps,
} from "./timeline-now-bar-offset-field";
export {
  TimelineTimerDisplayField,
  type TimelineTimerDisplayFieldProps,
} from "./timeline-timer-display-field";
export { TimelineScheduleFab, type TimelineScheduleFabProps } from "./timeline-schedule-fab";
export { WorkScheduleFields, type WorkScheduleFieldsProps } from "./work-schedule-fields";
export {
  GoogleCalendarSettings,
  type GoogleCalendarSettingsProps,
} from "./google-calendar-settings";
export {
  ProfileGoogleAccount,
  ProfileIdentityHeader,
  type ProfileGoogleAccountProps,
  type ProfileIdentityHeaderProps,
} from "./profile-google-account";
export { SyncSettingsPanel, type SyncSettingsPanelProps } from "./sync-settings-panel";
export { CalendarWeekLookbackField, type CalendarWeekLookbackFieldProps } from "./calendar-week-lookback-field";
export { ClockTimePicker, type ClockTimePickerProps, bumpEndTimeAfterStart } from "./clock-time-picker";
export {
  TaskEventFields,
  buildEventTimestamps,
  timeStringFromDate,
  type TaskEventFieldsProps,
} from "./task-event-fields";
export {
  ScheduleConflictDialog,
  type ScheduleConflictDialogProps,
} from "./schedule-conflict-dialog";
export {
  DraggableTimelineBlock,
  TimelineDragDropPreview,
  TimelineDragOverlay,
  type DraggableTimelineBlockProps,
  type TimelineDragDropPreviewProps,
} from "./timeline-drag-components";

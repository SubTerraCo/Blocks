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
export { Input, Textarea, type InputProps, type TextareaProps } from "./input";
export { Select, type SelectProps, type SelectOption } from "./select";
export { ThemeSync } from "./theme-sync";
export { TimelineWeekStrip, type TimelineWeekStripProps } from "./timeline-week-strip";
export { DueDateCalendar, type DueDateCalendarProps } from "./due-date-calendar";
export { TimelineViewToggle, type TimelineViewToggleProps } from "./timeline-view-toggle";
export { TimelineSnapDelayField, type TimelineSnapDelayFieldProps } from "./timeline-snap-delay-field";
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

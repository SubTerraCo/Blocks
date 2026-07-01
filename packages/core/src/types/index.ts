// ============================================================================
// BLOCKS - Core TypeScript Types
// Aligned with Anytype Object/Types/Relations framework
// ============================================================================

import { z } from "zod";

// ----------------------------------------------------------------------------
// Anytype-Compatible Base Types
// ----------------------------------------------------------------------------

/**
 * Placeholder User type (Anytype "Human" type)
 * Used for assignee field until Anytype integration
 */
export const AnytypeUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  isPlaceholder: z.boolean().default(false),
});

export type AnytypeUser = z.infer<typeof AnytypeUserSchema>;

/**
 * Placeholder Project type (for linkedProjectId)
 * Used for project linking until Anytype integration
 */
export const AnytypeProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().optional(),
  createdAt: z.date(),
});

export type AnytypeProject = z.infer<typeof AnytypeProjectSchema>;

// ----------------------------------------------------------------------------
// Task Types - Anytype Compatible
// ----------------------------------------------------------------------------

export const TaskPriority = z.enum(["1", "2", "3", "4", "5"]);
export type TaskPriority = z.infer<typeof TaskPriority>;

// Updated status enum with 6 values matching Kanban columns
export const TaskStatus = z.enum([
  "backlog",  // Ideas, someday/maybe
  "design",   // Planning, research
  "todo",     // Ready to start
  "doing",    // In progress, today
  "review",   // Needs review/check
  "done",     // Completed
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

// Access context - where/how the task can be done
export const AccessContext = z.enum(["home", "errand", "computer", "phone"]);
export type AccessContext = z.infer<typeof AccessContext>;

// Block size - base time unit for task duration
export const BlockSize = z.enum(["15min", "30min", "1hour", "1week"]);
export type BlockSize = z.infer<typeof BlockSize>;

// Block size to minutes mapping
export const BLOCK_SIZE_MINUTES = {
  "15min": 15,
  "30min": 30,
  "1hour": 60,
  "1week": 10080, // 7 * 24 * 60
} as const;

// Block size labels for display
const BLOCK_SIZE_LABELS = {
  "15min": "15 Min",
  "30min": "30 Min",
  "1hour": "1 Hour",
  "1week": "1 Week",
} as const;

/**
 * Calculate total duration from block size and count
 */
export function calculateDuration(blockSize: BlockSize, blockCount: number): number {
  return BLOCK_SIZE_MINUTES[blockSize] * blockCount;
}

/**
 * Format block size for display
 */
export function formatBlockSize(blockSize: BlockSize): string {
  return BLOCK_SIZE_LABELS[blockSize];
}

export const RecurrenceType = z.enum(["none", "daily", "weekly", "monthly", "custom"]);
export type RecurrenceType = z.infer<typeof RecurrenceType>;

// Day of week for recurring tasks
export const DayOfWeek = z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);
export type DayOfWeek = z.infer<typeof DayOfWeek>;

// Detailed recurrence pattern
export const RecurrencePatternSchema = z.object({
  type: RecurrenceType,
  interval: z.number().min(1).max(99).default(1), // e.g., every 2 weeks
  daysOfWeek: z.array(DayOfWeek).optional(), // For weekly recurrence
  dayOfMonth: z.number().min(1).max(31).optional(), // For monthly
  endDate: z.date().optional(), // When recurrence ends
  occurrences: z.number().min(1).optional(), // Number of times to repeat
  excludeDates: z.array(z.date()).default([]), // Skip these dates
});

export type RecurrencePattern = z.infer<typeof RecurrencePatternSchema>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  
  // Anytype-aligned fields
  assigneeId: z.string().default("me"), // Default to placeholder "Me" user
  accessContexts: z.array(AccessContext).default([]), // Where task can be done
  blockSize: BlockSize.default("30min"), // Base time unit
  blockCount: z.number().min(1).max(5).default(1), // Multiplier
  linkedProjectId: z.string().uuid().optional(), // Link to project object
  
  // Priority and status
  priority: TaskPriority,
  status: TaskStatus.default("backlog"),
  
  // Existing fields (kept for compatibility)
  duration: z.number().min(1).max(10080).optional(), // Computed from blockSize * blockCount, or manual override
  location: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  
  // Scheduling
  scheduledAt: z.date().optional(),
  dueDate: z.date().optional(),
  /** N-0026: user-created static event (property on Task, not separate entity) */
  isEvent: z.boolean().default(false),
  /** Default true for events until due date / times are set */
  eventAllDay: z.boolean().default(true),
  eventStartAt: z.date().optional(),
  eventEndAt: z.date().optional(),
  recurrence: RecurrenceType.default("none"),
  recurrenceRule: z.string().optional(), // iCal RRULE format for custom
  recurrencePattern: RecurrencePatternSchema.optional(), // Detailed pattern
  parentTaskId: z.string().uuid().optional(), // For recurring instances, points to template
  isRecurringInstance: z.boolean().default(false), // Is this an auto-generated instance?
  
  // Subtasks
  subtasks: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(200),
    completed: z.boolean().default(false),
  })).default([]),
  
  // Reminders (minutes before task)
  reminders: z.array(z.number().min(0).max(10080)).default([]), // Max 1 week
  notes: z.string().max(5000).optional(),
  
  // Time tracking
  timeSpent: z.number().min(0).default(0), // Actual time spent in minutes
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  
  // Metadata
  isQuickAdd: z.boolean().default(false), // Is this a quick-add block?
  isPutzing: z.boolean().default(false), // Is this unproductive time?
  calendarEventId: z.string().optional(), // Linked Google Calendar event

  // N-0048: manual Kanban order within a status column (drag override).
  // Lower values sort first. 0 = unset (falls back to active sort).
  kanbanOrder: z.number().default(0),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Task = z.infer<typeof TaskSchema>;

export type CreateTaskInput = Omit<
  Task,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "timeSpent"
  | "completedAt"
  | "isRecurringInstance"
  | "parentTaskId"
  | "isEvent"
  | "eventAllDay"
  | "kanbanOrder"
> & {
  isEvent?: boolean;
  eventAllDay?: boolean;
  kanbanOrder?: number;
};
export type UpdateTaskInput = Partial<Omit<Task, "id" | "createdAt">>;

// ----------------------------------------------------------------------------
// Task Template Types
// ----------------------------------------------------------------------------

export const TaskTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  
  // Template settings (applied to new tasks)
  defaultName: z.string().max(200).optional(), // Pre-fill task name
  defaultDescription: z.string().max(2000).optional(),
  defaultPriority: TaskPriority.optional(),
  defaultBlockSize: BlockSize.optional(),
  defaultBlockCount: z.number().min(1).max(5).optional(),
  defaultAccessContexts: z.array(AccessContext).optional(),
  defaultTags: z.array(z.string().max(30)).max(10).optional(),
  defaultSubtasks: z.array(z.object({
    name: z.string().min(1).max(200),
  })).optional(),
  
  // Metadata
  category: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  usageCount: z.number().default(0),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TaskTemplate = z.infer<typeof TaskTemplateSchema>;
export type CreateTemplateInput = Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "usageCount">;

// ----------------------------------------------------------------------------
// Routine / Grouped Task Types
// ----------------------------------------------------------------------------

export const RoutineItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  blockSize: BlockSize.default("30min"),
  blockCount: z.number().min(1).max(5).default(1),
  priority: TaskPriority.default("3"),
  accessContexts: z.array(AccessContext).default([]),
  tags: z.array(z.string().max(30)).max(10).default([]),
  notes: z.string().max(500).optional(),
  sortOrder: z.number().default(0),
});

export type RoutineItem = z.infer<typeof RoutineItemSchema>;

export const RoutineSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  items: z.array(RoutineItemSchema).min(1),
  /** Optional daily trigger time HH:mm (e.g. "07:00") */
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  usageCount: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Routine = z.infer<typeof RoutineSchema>;
export type CreateRoutineInput = Omit<Routine, "id" | "createdAt" | "updatedAt" | "usageCount">;

// ----------------------------------------------------------------------------
// Tag Types
// ----------------------------------------------------------------------------

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  usageCount: z.number().default(0),
  createdAt: z.date(),
});

export type Tag = z.infer<typeof TagSchema>;

// ----------------------------------------------------------------------------
// Kanban Column Configuration
// ----------------------------------------------------------------------------

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "backlog", title: "Backlog", color: "#3B82F6" },  // Blue
  { id: "design", title: "Design", color: "#A855F7" },    // Purple
  { id: "todo", title: "To Do", color: "#EC4899" },       // Pink
  { id: "doing", title: "Doing", color: "#F97316" },      // Orange
  { id: "review", title: "Review", color: "#EAB308" },    // Yellow
  { id: "done", title: "Done", color: "#22C55E" },        // Green
];

// ----------------------------------------------------------------------------
// N-0048 · Kanban sort  ·  N-0049 · Kanban filters + saved views (Anytype-style)
// ----------------------------------------------------------------------------

/** Sortable Task properties for the Kanban board (N-0048). */
export const KanbanSortField = z.enum([
  "priority", // P1 → P5
  "dueDate", // "time" — earliest due first
  "createdAt",
  "name",
  "tags", // first tag alphabetically
  "accessContexts", // first access context alphabetically
  "category",
  "manual", // honor Task.kanbanOrder only
]);
export type KanbanSortField = z.infer<typeof KanbanSortField>;

export const KanbanSortDirection = z.enum(["asc", "desc"]);
export type KanbanSortDirection = z.infer<typeof KanbanSortDirection>;

export const KanbanSortSchema = z.object({
  field: KanbanSortField.default("priority"),
  direction: KanbanSortDirection.default("asc"),
});
export type KanbanSort = z.infer<typeof KanbanSortSchema>;

/** Property-based filter for the Kanban board (N-0049, Anytype-aligned). */
export const KanbanFilterSchema = z.object({
  priority: z.array(TaskPriority).default([]),
  tags: z.array(z.string()).default([]),
  category: z.array(z.string()).default([]),
  accessContexts: z.array(AccessContext).default([]),
  dueFrom: z.date().optional(),
  dueTo: z.date().optional(),
  /** "event" = isEvent only · "task" = non-event only · undefined = both */
  kind: z.enum(["event", "task"]).optional(),
  /** "scheduled" = has scheduledAt · "unscheduled" = none · undefined = both */
  scheduled: z.enum(["scheduled", "unscheduled"]).optional(),
  /** "with" = has subtasks · "without" = none · undefined = both */
  subtasks: z.enum(["with", "without"]).optional(),
});
export type KanbanFilter = z.infer<typeof KanbanFilterSchema>;

/** Named saved view bundling filter + sort, synced via Dexie (N-0049). */
export const KanbanViewSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(60),
  filter: KanbanFilterSchema.default({
    priority: [],
    tags: [],
    category: [],
    accessContexts: [],
  }),
  sort: KanbanSortSchema.default({ field: "priority", direction: "asc" }),
  /** Built-in default view cannot be deleted. */
  isDefault: z.boolean().default(false),
  sortOrder: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type KanbanView = z.infer<typeof KanbanViewSchema>;
export type CreateKanbanViewInput = Omit<
  KanbanView,
  "id" | "createdAt" | "updatedAt"
>;

export const DEFAULT_KANBAN_SORT: KanbanSort = { field: "priority", direction: "asc" };
export const DEFAULT_KANBAN_FILTER: KanbanFilter = {
  priority: [],
  tags: [],
  category: [],
  accessContexts: [],
};

// ----------------------------------------------------------------------------
// Quick Add Block Types
// ----------------------------------------------------------------------------

// Block category enum for color presets
export const BlockCategory = z.enum(["productive", "chores", "putzing", "custom"]);
export type BlockCategory = z.infer<typeof BlockCategory>;

// Category color presets
export const BLOCK_CATEGORY_COLORS: Record<BlockCategory, string> = {
  productive: "#6B4423", // Brown (activities like Get Ready, Meeting, Friends)
  chores: "#16a34a",     // Green (activities like Laundry, Dishes, Vacuum)
  putzing: "#166534",    // Dark green (non-productive time)
  custom: "#9b4dca",     // Magenta (user-defined)
};

export const QuickAddBlockSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  defaultDuration: z.number().min(1).max(480), // Default duration in minutes
  category: BlockCategory.default("productive"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  isPutzing: z.boolean().default(false),
  icon: z.string().max(50).optional(), // Emoji or icon name
  sortOrder: z.number().default(0),
  usageCount: z.number().default(0),

  // N-0045: a block manages exactly one permanent, reusable Task.
  // `linkedTaskId` points at that Task once the block has been configured.
  // First use (configured === false) opens the task editor to fill details;
  // later uses go straight to the placement picker and reschedule that task.
  linkedTaskId: z.string().uuid().optional(),
  configured: z.boolean().default(false),

  createdAt: z.date(),
});

export type QuickAddBlock = z.infer<typeof QuickAddBlockSchema>;

// ----------------------------------------------------------------------------
// Calendar Event Types
// ----------------------------------------------------------------------------

export const CalendarEventSchema = z.object({
  id: z.string(),
  calendarId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  isAllDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.string().optional(),
  isReadOnly: z.boolean().default(true), // Calendar events are static
  source: z.enum(["google", "apple", "outlook", "local"]),
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

// ----------------------------------------------------------------------------
// Time Block Types (for Timeline view)
// ----------------------------------------------------------------------------

export const TimeBlockSchema = z.object({
  id: z.string(),
  type: z.enum(["task", "calendar_event", "ai_suggestion", "free_time"]),
  startTime: z.date(),
  endTime: z.date(),
  task: TaskSchema.optional(),
  calendarEvent: CalendarEventSchema.optional(),
  aiSuggestion: z.object({
    suggestedTaskId: z.string().optional(),
    suggestedTaskName: z.string(),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
  }).optional(),
});

export type TimeBlock = z.infer<typeof TimeBlockSchema>;

// ----------------------------------------------------------------------------
// User Types
// ----------------------------------------------------------------------------

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  
  // OAuth connections
  providers: z.array(z.object({
    provider: z.enum(["google", "apple", "github"]),
    providerId: z.string(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    expiresAt: z.date().optional(),
  })).default([]),
  
  // Stats
  stats: z.object({
    tasksCompletedTotal: z.number().default(0),
    tasksCompletedToday: z.number().default(0),
    tasksCompletedThisWeek: z.number().default(0),
    tasksCompletedThisMonth: z.number().default(0),
    totalTimeTracked: z.number().default(0), // Minutes
    putzingTime: z.number().default(0), // Minutes
    currentStreak: z.number().default(0), // Days
    longestStreak: z.number().default(0),
    lastActiveDate: z.date().optional(),
  }).default({
    tasksCompletedTotal: 0,
    tasksCompletedToday: 0,
    tasksCompletedThisWeek: 0,
    tasksCompletedThisMonth: 0,
    totalTimeTracked: 0,
    putzingTime: 0,
    currentStreak: 0,
    longestStreak: 0,
  }),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// ----------------------------------------------------------------------------
// Settings Types
// ----------------------------------------------------------------------------

export const ThemeSchema = z.enum(["dark", "light", "system"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const AIProviderSchema = z.enum(["openai", "anthropic", "ollama"]);
export type AIProvider = z.infer<typeof AIProviderSchema>;

/** N-0025: Schedule Task button behavior for Doing tasks */
export const TaskScheduleBehaviorSchema = z.enum(["lock_current", "reschedule_all"]);
export type TaskScheduleBehavior = z.infer<typeof TaskScheduleBehaviorSchema>;

export const SettingsSchema = z.object({
  // Appearance
  theme: ThemeSchema.default("dark"),
  /** N-0040 · User primary accent (today, active chrome) */
  accentPrimary: z.string().default("#9b4dca"),
  /** N-0040 · User secondary accent (selected calendar day, etc.) */
  accentSecondary: z.string().default("#00bcd4"),
  
  // AI Configuration
  aiProvider: AIProviderSchema.default("openai"),
  aiApiKey: z.string().optional(), // Encrypted
  aiModel: z.string().default("gpt-4o-mini"),
  aiEnabled: z.boolean().default(true),
  
  // Notifications
  notificationsEnabled: z.boolean().default(true),
  reminderNotifications: z.boolean().default(true),
  taskSwitchSuggestions: z.boolean().default(true),
  dailySummary: z.boolean().default(false),
  dailySummaryTime: z.string().default("20:00"), // HH:mm format
  
  // Calendar
  googleCalendarEnabled: z.boolean().default(false),
  selectedCalendars: z.array(z.string()).default([]), // Calendar IDs to sync
  calendarSyncInterval: z.number().default(15), // Minutes
  
  // Work hours (for AI suggestions)
  workStartTime: z.string().default("09:00"),
  workEndTime: z.string().default("17:00"),
  workDays: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5]), // 0=Sun, 6=Sat
  weekStartsOn: z.enum(["monday", "sunday"]).default("monday"),
  
  // Time tracking
  autoStartTimer: z.boolean().default(false),
  /** Seconds after manual scroll before timeline recenters on now (0 = never until re-entry) */
  timelineSnapDelaySec: z.number().int().min(0).max(120).default(15),
  /** N-0014: viewport ratio for now-bar (0.25 = ¼ from top … 0.75 = ¼ from bottom) */
  timelineNowBarViewportRatio: z.number().min(0.25).max(0.75).default(0.5),
  /** N-0009 / N-0043 · remaining-only (elapsed option removed) */
  timelineTimerDisplayMode: z.enum(["elapsed", "remaining"]).default("remaining"),
  /** N-0025: lock active tracked task when scheduling Doing tasks */
  taskScheduleBehavior: TaskScheduleBehaviorSchema.default("lock_current"),
  /** N-0027: weeks of history before current week in scroll calendar (−1 / −2 / −3) */
  calendarWeekLookback: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  /** N-0032: 24-hour time on timeline labels + GCal clock picker */
  use24HourTime: z.boolean().default(false),
  overtimeWarningMinutes: z.number().default(30), // Warn after this many extra minutes
  
  // Data
  lastSyncAt: z.date().optional(),
  dataExportFormat: z.enum(["json", "csv"]).default("json"),
});

export type Settings = z.infer<typeof SettingsSchema>;
export type TimelineTimerDisplayMode = Settings["timelineTimerDisplayMode"];

// ----------------------------------------------------------------------------
// AI Suggestion Types
// ----------------------------------------------------------------------------

export const AISuggestionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["fill_gap", "switch_task", "task_complete", "priority_reorder"]),
  message: z.string(),
  suggestedTaskId: z.string().optional(),
  suggestedTaskName: z.string().optional(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  dismissed: z.boolean().default(false),
  acceptedAt: z.date().optional(),
  createdAt: z.date(),
});

export type AISuggestion = z.infer<typeof AISuggestionSchema>;

// ----------------------------------------------------------------------------
// Search Types
// ----------------------------------------------------------------------------

export const SearchFiltersSchema = z.object({
  query: z.string().default(""),
  status: z.array(TaskStatus).optional(),
  priority: z.array(TaskPriority).optional(),
  category: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  accessContexts: z.array(AccessContext).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  includeCompleted: z.boolean().default(false),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export interface SearchResult {
  tasks: Task[];
  totalCount: number;
  hasMore: boolean;
}

// ----------------------------------------------------------------------------
// Time Entry Types (for logging)
// ----------------------------------------------------------------------------

export const TimeEntrySchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().min(0), // Minutes
  notes: z.string().optional(),
  createdAt: z.date(),
});

export type TimeEntry = z.infer<typeof TimeEntrySchema>;

// ----------------------------------------------------------------------------
// Export all schemas for runtime validation
// ----------------------------------------------------------------------------

export const schemas = {
  Task: TaskSchema,
  QuickAddBlock: QuickAddBlockSchema,
  CalendarEvent: CalendarEventSchema,
  TimeBlock: TimeBlockSchema,
  User: UserSchema,
  Settings: SettingsSchema,
  AISuggestion: AISuggestionSchema,
  SearchFilters: SearchFiltersSchema,
  TimeEntry: TimeEntrySchema,
  AnytypeUser: AnytypeUserSchema,
  AnytypeProject: AnytypeProjectSchema,
};

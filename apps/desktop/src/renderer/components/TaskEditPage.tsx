// ============================================================================
// BLOCKS - Unified Task Edit Page
// Single component for creating AND editing tasks
// Used from: Nav +Add, Kanban +Add, Kanban card tap, Timeline block tap,
//            Search result tap, Blocks placement picker
// ============================================================================

import { useState, useMemo } from "react";
import { 
  useTaskStore, 
  Button, 
  Input, 
  Textarea, 
  Select, 
  cn,
  TaskEventFields,
  buildEventTimestamps,
  timeStringFromDate,
  TASK_EDIT_BOTTOM_BAR,
} from "@blocks/ui";
import type { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  BlockSize, 
  AccessContext, 
  RecurrenceType,
  QuickAddBlock
} from "@blocks/core";
import { KANBAN_COLUMNS, calculateDuration, formatBlockSize, parseLocalDateInput } from "@blocks/core";
import {
  Timer,
  MapPin,
  Home,
  Car,
  Monitor,
  Smartphone,
  Tag,
  Plus,
  X,
  Calendar,
  Palette,
  Trash2,
} from "lucide-react";
import { TrackingControlBar } from "./TrackingBar";

// ============================================================================
// Constants
// ============================================================================

const PRIORITY_OPTIONS = [
  { value: "1", label: "1 - Urgent" },
  { value: "2", label: "2 - High" },
  { value: "3", label: "3 - Medium" },
  { value: "4", label: "4 - Low" },
  { value: "5", label: "5 - Minimal" },
];

const STATUS_OPTIONS = KANBAN_COLUMNS.map((col) => ({ 
  value: col.id, 
  label: col.title 
}));

const BLOCK_SIZE_OPTIONS = [
  { value: "15min", label: "15 Min" },
  { value: "30min", label: "30 Min" },
  { value: "1hour", label: "1 Hour" },
  { value: "1week", label: "1 Week" },
];

const BLOCK_COUNT_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ 
  value: String(n), 
  label: String(n) 
}));

const ACCESS_CONTEXTS: { value: AccessContext; label: string; icon: React.ReactNode }[] = [
  { value: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
  { value: "errand", label: "Errand", icon: <Car className="h-4 w-4" /> },
  { value: "computer", label: "Computer", icon: <Monitor className="h-4 w-4" /> },
  { value: "phone", label: "Phone", icon: <Smartphone className="h-4 w-4" /> },
];

const RECURRENCE_OPTIONS = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const COLOR_OPTIONS = [
  "#9b4dca", "#00bcd4", "#22c55e", "#f59e0b", 
  "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"
];

// ============================================================================
// Types
// ============================================================================

interface TaskEditPageProps {
  /** Existing task to edit. If undefined, creates new task. */
  task?: Task;
  /** Initial status for new tasks (from Kanban column +Add button) */
  initialStatus?: TaskStatus;
  /** Initial scheduled time for new tasks (from Blocks placement picker) */
  initialScheduledAt?: Date;
  /** N-0045: prefill a new task from a Quick Block on first use */
  prefillBlock?: QuickAddBlock;
  /** Callback when save/create completes or user cancels */
  onBack: () => void;
  /** Callback when task is saved (for refreshing task list) */
  onTaskSaved?: (task: Task) => void;
}

function blockToBlocks(minutes: number): { blockSize: BlockSize; blockCount: number } {
  if (minutes <= 15) return { blockSize: "15min", blockCount: 1 };
  if (minutes <= 30) return { blockSize: "15min", blockCount: Math.ceil(minutes / 15) };
  if (minutes <= 60) return { blockSize: "30min", blockCount: Math.ceil(minutes / 30) };
  return { blockSize: "1hour", blockCount: Math.ceil(minutes / 60) };
}

// ============================================================================
// Component
// ============================================================================

export function TaskEditPage({ 
  task, 
  initialStatus, 
  initialScheduledAt,
  prefillBlock,
  onBack,
  onTaskSaved,
}: TaskEditPageProps) {
  const createTask = useTaskStore((state) => state.createTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  
  const isEditMode = !!task;
  const prefillBlocks = prefillBlock ? blockToBlocks(prefillBlock.defaultDuration) : null;
  
  // Form state
  const [name, setName] = useState(task?.name || prefillBlock?.name || "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || "3");
  const [status, setStatus] = useState<TaskStatus>(task?.status || initialStatus || "backlog");
  const [blockSize, setBlockSize] = useState<BlockSize>(task?.blockSize || prefillBlocks?.blockSize || "30min");
  const [blockCount, setBlockCount] = useState(task?.blockCount || prefillBlocks?.blockCount || 1);
  const [accessContexts, setAccessContexts] = useState<AccessContext[]>(task?.accessContexts || []);
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>(task?.recurrence || "none");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.toISOString().split("T")[0] : ""
  );
  const [scheduledAt] = useState<Date | undefined>(
    task?.scheduledAt || initialScheduledAt
  );
  const [notes, setNotes] = useState(task?.notes || "");
  const [color, setColor] = useState(task?.color || prefillBlock?.color || COLOR_OPTIONS[0]);
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [isEvent, setIsEvent] = useState(task?.isEvent ?? false);
  const [eventAllDay, setEventAllDay] = useState(task?.eventAllDay ?? true);
  const [eventStartTime, setEventStartTime] = useState(
    timeStringFromDate(task?.eventStartAt) || "",
  );
  const [eventEndTime, setEventEndTime] = useState(
    timeStringFromDate(task?.eventEndAt) || "",
  );
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Computed values
  const computedDuration = useMemo(
    () => calculateDuration(blockSize, blockCount), 
    [blockSize, blockCount]
  );
  
  const formattedDuration = useMemo(() => {
    const mins = computedDuration;
    if (mins >= 10080) return `${Math.floor(mins / 10080)} week(s)`;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remaining = mins % 60;
      return `${hours}h${remaining > 0 ? ` ${remaining}m` : ""}`;
    }
    return `${mins}m`;
  }, [computedDuration]);

  // Handlers
  const handleToggleAccess = (ctx: AccessContext) => {
    setAccessContexts((prev) => 
      prev.includes(ctx) 
        ? prev.filter((c) => c !== ctx) 
        : [...prev, ctx]
    );
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    const trimmed = subtaskInput.trim();
    if (trimmed) {
      setSubtasks([
        ...subtasks, 
        { id: `st-${Date.now()}`, name: trimmed, completed: false }
      ]);
      setSubtaskInput("");
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map((st) => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== subtaskId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const eventFields = buildEventTimestamps(
        isEvent,
        dueDate,
        eventAllDay,
        eventStartTime,
        eventEndTime,
      );

      const taskData = {
        name: name.trim(),
        description: notes.trim() || undefined,
        priority: isEvent ? ("3" as TaskPriority) : priority,
        status: isEvent ? ("doing" as TaskStatus) : status,
        blockSize: isEvent ? ("30min" as BlockSize) : blockSize,
        blockCount: isEvent ? 1 : blockCount,
        duration: isEvent && eventStartTime && eventEndTime
          ? Math.max(
              15,
              (new Date(`1970-01-01T${eventEndTime}`).getTime() -
                new Date(`1970-01-01T${eventStartTime}`).getTime()) /
                60000,
            )
          : computedDuration,
        accessContexts,
        assigneeId: "me",
        tags,
        color,
        recurrence,
        dueDate: dueDate ? parseLocalDateInput(dueDate) : undefined,
        scheduledAt,
        notes: notes.trim() || undefined,
        subtasks,
        reminders: [],
        isQuickAdd: prefillBlock ? true : false,
        isPutzing: prefillBlock ? prefillBlock.isPutzing : false,
        isEvent,
        ...eventFields,
      };

      if (isEditMode && task) {
        await updateTask(task.id, taskData);
        onTaskSaved?.({ ...task, ...taskData, updatedAt: new Date() });
      } else {
        const newTask = await createTask(taskData);
        if (newTask) {
          onTaskSaved?.(newTask);
        }
      }
      
      onBack();
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      onBack();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 pb-32">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-bg-secondary p-6">
            <h3 className="text-lg font-semibold text-text-primary">Delete Task?</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Are you sure you want to delete &ldquo;{task?.name}&rdquo;? This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 bg-status-error hover:bg-status-error/80" 
                onClick={handleDelete} 
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <form id="task-edit-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        {/* Header with Delete button (edit mode only) */}
        {isEditMode && (
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text-primary">Edit Task</h1>
            <button 
              type="button" 
              onClick={() => setShowDeleteConfirm(true)} 
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-status-error hover:bg-status-error/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}

        {/* Task Name */}
        <Input 
          label="Task Name *" 
          placeholder="What do you need to do?" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          autoFocus 
        />

        {/* N-0046: Event section sits directly under Task Name */}
        <TaskEventFields
          isEvent={isEvent}
          onIsEventChange={setIsEvent}
          eventAllDay={eventAllDay}
          onEventAllDayChange={setEventAllDay}
          eventStartTime={eventStartTime}
          eventEndTime={eventEndTime}
          onEventStartTimeChange={(t) => {
            setEventStartTime(t);
            if (t) setEventAllDay(false);
          }}
          onEventEndTimeChange={(t) => {
            setEventEndTime(t);
            if (t) setEventAllDay(false);
          }}
        />

        {/* Duration / blocks — hidden for events (B-0019) */}
        {!isEvent && (
          <div className="space-y-2">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              <Timer className="mr-1 inline h-4 w-4" />
              Duration: {formatBlockSize(blockSize)} × {blockCount} ={" "}
              <span className="text-accent-magenta">{formattedDuration}</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Block Size" 
                options={BLOCK_SIZE_OPTIONS} 
                value={blockSize} 
                onChange={(v) => setBlockSize(v as BlockSize)} 
              />
              <Select 
                label="Block Count" 
                options={BLOCK_COUNT_OPTIONS} 
                value={String(blockCount)} 
                onChange={(v) => setBlockCount(parseInt(v, 10))} 
              />
            </div>
          </div>
        )}

        {/* Priority & Status — hidden for events (B-0019) */}
        {!isEvent && (
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Priority" 
              options={PRIORITY_OPTIONS} 
              value={priority} 
              onChange={(v) => setPriority(v as TaskPriority)} 
            />
            <Select 
              label="Status" 
              options={STATUS_OPTIONS} 
              value={status} 
              onChange={(v) => setStatus(v as TaskStatus)} 
            />
          </div>
        )}

        {/* Access Context */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <MapPin className="mr-1 inline h-4 w-4" /> Access Context
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCESS_CONTEXTS.map((ctx) => (
              <button 
                key={ctx.value} 
                type="button" 
                onClick={() => handleToggleAccess(ctx.value)} 
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors border",
                  accessContexts.includes(ctx.value) 
                    ? "border-accent-magenta bg-accent-magenta/20 text-accent-magenta" 
                    : "border-border-default bg-bg-secondary text-text-secondary hover:border-accent-magenta/50"
                )}
              >
                {ctx.icon} {ctx.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <Tag className="mr-1 inline h-4 w-4" /> Tags
          </label>
          <div className="flex gap-2">
            <Input 
              placeholder="Add a tag" 
              value={tagInput} 
              onChange={(e) => setTagInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }} 
            />
            <Button type="button" variant="secondary" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span 
                  key={tag} 
                  className="flex items-center gap-1 rounded-full bg-bg-tertiary px-3 py-1 text-sm text-text-secondary"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)} 
                    className="ml-1 text-text-muted hover:text-text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recurrence & Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Repeat" 
            options={RECURRENCE_OPTIONS} 
            value={recurrence} 
            onChange={(v) => setRecurrence(v as RecurrenceType)} 
          />
          <Input 
            label="Due Date" 
            type="date" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
            leftIcon={<Calendar className="h-4 w-4" />} 
          />
        </div>

        {/* Color Picker */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <Palette className="mr-1 inline h-4 w-4" /> Color
          </label>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button 
                key={c} 
                type="button" 
                onClick={() => setColor(c)} 
                className={cn(
                  "h-8 w-8 rounded-full transition-transform",
                  color === c && "scale-125 ring-2 ring-white ring-offset-2 ring-offset-bg-primary"
                )} 
                style={{ backgroundColor: c }} 
              />
            ))}
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Subtasks
          </label>
          <div className="flex gap-2">
            <Input 
              placeholder="Add a subtask" 
              value={subtaskInput} 
              onChange={(e) => setSubtaskInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }} 
            />
            <Button type="button" variant="secondary" onClick={handleAddSubtask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {subtasks.length > 0 && (
            <ul className="mt-2 space-y-2">
              {subtasks.map((st) => (
                <li 
                  key={st.id} 
                  className="flex items-center justify-between rounded-lg bg-bg-secondary px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => handleToggleSubtask(st.id)} 
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border-2",
                        st.completed 
                          ? "border-accent-magenta bg-accent-magenta" 
                          : "border-border-default"
                      )}
                    >
                      {st.completed && (
                        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                      )}
                    </button>
                    <span className={cn(
                      "text-sm text-text-primary",
                      st.completed && "line-through opacity-60"
                    )}>
                      {st.name}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSubtask(st.id)} 
                    className="text-text-muted hover:text-status-error"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notes */}
        <Textarea 
          label="Notes" 
          placeholder="Additional details..." 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          rows={3} 
        />

        {/* Action buttons — fixed above nav, flanking tracking controls (N-0044) */}
        <div className={TASK_EDIT_BOTTOM_BAR} data-testid="task-edit-bottom-bar">
          <Button
            type="button"
            variant="secondary"
            className="h-12 shrink-0 px-5"
            onClick={onBack}
          >
            Cancel
          </Button>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <TrackingControlBar layout="inline" />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="h-12 shrink-0 px-5"
            isLoading={isSubmitting}
            disabled={!name.trim()}
          >
            {isEditMode ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  );
}


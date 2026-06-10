"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Button, Input, Select, Textarea, cn } from "@blocks/ui";
import {
  KANBAN_COLUMNS,
  calculateDuration,
  formatBlockSize,
  type AccessContext,
  type BlockSize,
  type RecurrenceType,
  type Task,
  type TaskPriority,
  type TaskStatus,
  parseLocalDateInput,
} from "@blocks/core";
import {
  Calendar,
  Car,
  Home,
  MapPin,
  Monitor,
  Palette,
  Plus,
  Smartphone,
  Tag,
  Timer,
  Trash2,
  X,
} from "lucide-react";

const PRIORITY_OPTIONS = [
  { value: "1", label: "1 - Urgent" },
  { value: "2", label: "2 - High" },
  { value: "3", label: "3 - Medium" },
  { value: "4", label: "4 - Low" },
  { value: "5", label: "5 - Minimal" },
];

const STATUS_OPTIONS = KANBAN_COLUMNS.map((col) => ({
  value: col.id,
  label: col.title,
}));

const BLOCK_SIZE_OPTIONS = [
  { value: "15min", label: "15 Min" },
  { value: "30min", label: "30 Min" },
  { value: "1hour", label: "1 Hour" },
  { value: "1week", label: "1 Week" },
];

const BLOCK_COUNT_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

const ACCESS_CONTEXTS: { value: AccessContext; label: string; icon: ReactNode }[] = [
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
  "#9b4dca",
  "#00bcd4",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];
const DEFAULT_COLOR = COLOR_OPTIONS[0] ?? "#9b4dca";
type TaskSubtask = Task["subtasks"][number];

const generateSubtaskId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `subtask-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export interface TaskEditorSubmitInput {
  name: string;
  description?: string;
  duration: number;
  priority: TaskPriority;
  status: TaskStatus;
  blockSize: BlockSize;
  blockCount: number;
  accessContexts: AccessContext[];
  location?: string;
  category?: string;
  tags: string[];
  color: string;
  recurrence: RecurrenceType;
  dueDate?: Date;
  notes?: string;
  subtasks: TaskSubtask[];
}

interface TaskEditorProps {
  mode: "create" | "edit";
  initialTask?: Task;
  initialStatus?: TaskStatus;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onCancel: () => void;
  onSubmit: (payload: TaskEditorSubmitInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function TaskEditor({
  mode,
  initialTask,
  initialStatus = "backlog",
  isSubmitting = false,
  isDeleting = false,
  onCancel,
  onSubmit,
  onDelete,
}: TaskEditorProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [name, setName] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("3");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [blockSize, setBlockSize] = useState<BlockSize>("30min");
  const [blockCount, setBlockCount] = useState(1);
  const [accessContexts, setAccessContexts] = useState<AccessContext[]>([]);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");

  useEffect(() => {
    if (initialTask) {
      setName(initialTask.name);
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setBlockSize(initialTask.blockSize || "30min");
      setBlockCount(initialTask.blockCount || 1);
      setAccessContexts(initialTask.accessContexts || []);
      setLocation(initialTask.location || "");
      setCategory(initialTask.category || "");
      setTags(initialTask.tags || []);
      setRecurrence(initialTask.recurrence || "none");
      setDueDate(initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split("T")[0] || "" : "");
      setNotes(initialTask.notes || "");
      setColor(initialTask.color || DEFAULT_COLOR);
      setSubtasks(initialTask.subtasks || []);
      return;
    }

    setName("");
    setPriority("3");
    setStatus(initialStatus);
    setBlockSize("30min");
    setBlockCount(1);
    setAccessContexts([]);
    setLocation("");
    setCategory("");
    setTags([]);
    setTagInput("");
    setRecurrence("none");
    setDueDate("");
    setNotes("");
    setColor(DEFAULT_COLOR);
    setSubtasks([]);
    setSubtaskInput("");
  }, [initialTask, initialStatus]);

  const computedDuration = useMemo(() => {
    return calculateDuration(blockSize, blockCount);
  }, [blockSize, blockCount]);

  const formattedDuration = useMemo(() => {
    const mins = computedDuration;
    if (mins >= 10080) return `${Math.floor(mins / 10080)} week(s)`;
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`;
    return `${mins}m`;
  }, [computedDuration]);

  const handleToggleAccess = (context: AccessContext) => {
    setAccessContexts((prev) =>
      prev.includes(context) ? prev.filter((c) => c !== context) : [...prev, context]
    );
  };

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    setTags([...tags, value]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddSubtask = () => {
    const value = subtaskInput.trim();
    if (!value) return;
    setSubtasks([
      ...subtasks,
      {
        id: generateSubtaskId(),
        name: value,
        completed: false,
      },
    ]);
    setSubtaskInput("");
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    await onSubmit({
      name: name.trim(),
      description: notes.trim() || undefined,
      duration: computedDuration,
      priority,
      status,
      blockSize,
      blockCount,
      accessContexts,
      location: location.trim() || undefined,
      category: category.trim() || undefined,
      tags,
      color,
      recurrence,
      dueDate: dueDate ? parseLocalDateInput(dueDate) : undefined,
      notes: notes.trim() || undefined,
      subtasks,
    });
  };

  const submitLabel = mode === "create" ? "Create Task" : "Save Changes";

  return (
    <div className="px-4 py-6 pb-28">
      {mode === "edit" && onDelete && showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-bg-secondary p-6">
            <h3 className="text-lg font-semibold text-text-primary">Delete Task?</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-status-error hover:bg-status-error/80"
                onClick={onDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === "edit" && onDelete && (
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text-primary">Edit Task</h1>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-status-error transition-colors hover:bg-status-error/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}

        <Input
          label="Task Name *"
          placeholder="What do you need to do?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <MapPin className="mr-1 inline h-4 w-4" />
            Access (where can this be done?)
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCESS_CONTEXTS.map((ctx) => (
              <button
                key={ctx.value}
                type="button"
                onClick={() => handleToggleAccess(ctx.value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  "border",
                  accessContexts.includes(ctx.value)
                    ? "border-accent-magenta bg-accent-magenta/20 text-accent-magenta"
                    : "border-border-default bg-bg-secondary text-text-secondary hover:border-accent-magenta/50"
                )}
              >
                {ctx.icon}
                {ctx.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Location"
            placeholder="Home, Office, etc."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            label="Category"
            placeholder="Work, Personal, etc."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tags</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              leftIcon={<Tag className="h-4 w-4" />}
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <Palette className="mr-1 inline h-4 w-4" />
            Color
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Subtasks</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a subtask"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubtask())}
            />
            <Button type="button" variant="secondary" onClick={handleAddSubtask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {subtasks.length > 0 && (
            <ul className="mt-2 space-y-2">
              {subtasks.map((subtask) => (
                <li key={subtask.id} className="flex items-center justify-between rounded-lg bg-bg-secondary px-3 py-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(subtask.id)}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border-2 transition-all",
                        subtask.completed
                          ? "border-accent-magenta bg-accent-magenta"
                          : "border-border-default hover:border-accent-magenta"
                      )}
                    >
                      {subtask.completed && (
                        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 6L5 9L10 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    <span className={cn("text-sm text-text-primary", subtask.completed && "line-through opacity-60")}>
                      {subtask.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="text-text-muted hover:text-status-error"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Textarea
          label="Notes"
          placeholder="Additional details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div className="sticky bottom-0 z-20 -mx-4 border-t border-border-default bg-bg-primary/95 px-4 py-4 backdrop-blur">
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isSubmitting}
              disabled={!name.trim() || isSubmitting}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

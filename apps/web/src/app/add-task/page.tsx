"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTaskStore, Button, Input, Textarea, Select, cn } from "@blocks/ui";
import type { TaskPriority, TaskStatus, RecurrenceType, BlockSize, AccessContext } from "@blocks/core";
import { KANBAN_COLUMNS, calculateDuration, formatBlockSize } from "@blocks/core";
import { Plus, X, Tag, Calendar, Palette, Timer, MapPin, Home, Car, Monitor, Smartphone } from "lucide-react";

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
  "#9b4dca", // Magenta
  "#00bcd4", // Teal
  "#22c55e", // Green
  "#f59e0b", // Orange
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
];

export default function AddTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createTask = useTaskStore((state) => state.createTask);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get pre-selected status from URL query param (from Kanban column add button)
  const initialStatus = (searchParams.get("status") as TaskStatus) || "backlog";

  // Form state
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("3");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  
  // Anytype-aligned fields
  const [blockSize, setBlockSize] = useState<BlockSize>("30min");
  const [blockCount, setBlockCount] = useState(1);
  const [accessContexts, setAccessContexts] = useState<AccessContext[]>([]);
  
  // Existing fields
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");

  // Calculate duration from block size × block count
  const computedDuration = useMemo(() => {
    return calculateDuration(blockSize, blockCount);
  }, [blockSize, blockCount]);

  // Format duration for display
  const formattedDuration = useMemo(() => {
    const mins = computedDuration;
    if (mins >= 10080) return `${Math.floor(mins / 10080)} week(s)`;
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`;
    return `${mins}m`;
  }, [computedDuration]);

  // Update status if URL param changes
  useEffect(() => {
    const urlStatus = searchParams.get("status") as TaskStatus;
    if (urlStatus && STATUS_OPTIONS.some((opt) => opt.value === urlStatus)) {
      setStatus(urlStatus);
    }
  }, [searchParams]);

  const handleToggleAccess = (context: AccessContext) => {
    if (accessContexts.includes(context)) {
      setAccessContexts(accessContexts.filter((c) => c !== context));
    } else {
      setAccessContexts([...accessContexts, context]);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput("");
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        name: name.trim(),
        description: notes.trim() || undefined,
        duration: computedDuration,
        priority,
        status,
        // Anytype-aligned fields
        blockSize,
        blockCount,
        accessContexts,
        assigneeId: "me", // Default placeholder
        // Existing fields
        location: location.trim() || undefined,
        category: category.trim() || undefined,
        tags,
        color,
        recurrence,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes: notes.trim() || undefined,
        subtasks: subtasks.map((name, index) => ({
          id: `subtask-${index}-${Date.now()}`,
          name,
          completed: false,
        })),
        reminders: [],
        isQuickAdd: false,
        isPutzing: false,
      });

      router.push("/kanban");
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 pb-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name (required) */}
        <Input
          label="Task Name *"
          placeholder="What do you need to do?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        {/* Block Size & Block Count (Anytype-aligned) */}
        <div className="space-y-2">
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <Timer className="mr-1 inline h-4 w-4" />
            Duration: {formatBlockSize(blockSize)} × {blockCount} = <span className="text-accent-magenta">{formattedDuration}</span>
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

        {/* Priority & Status */}
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

        {/* Access Contexts (Anytype-aligned) */}
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

        {/* Location & Category */}
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

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Tags
          </label>
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

        {/* Color */}
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
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubtask())}
            />
            <Button type="button" variant="secondary" onClick={handleAddSubtask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {subtasks.length > 0 && (
            <ul className="mt-2 space-y-2">
              {subtasks.map((subtask, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-bg-secondary px-3 py-2"
                >
                  <span className="text-sm text-text-primary">{subtask}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
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

        {/* Submit buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isSubmitting}
            disabled={!name.trim()}
          >
            Create Task
          </Button>
        </div>
      </form>
    </div>
  );
}

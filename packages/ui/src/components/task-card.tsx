// ============================================================================
// BLOCKS - TaskCard Component
// Updated with Anytype-aligned properties display
// ============================================================================

import * as React from "react";
import type { Task, AccessContext } from "@blocks/core";
import { formatBlockSize, calculateDuration } from "@blocks/core";
import { cn, formatDuration, getPriorityColor } from "../lib/utils";
import { Check, Clock, MapPin, Home, Car, Monitor, Smartphone, Timer } from "lucide-react";

export interface TaskCardProps {
  task: Task;
  onToggleComplete?: (task: Task) => void;
  onPress?: (task: Task) => void;
  className?: string;
  showCheckbox?: boolean;
  compact?: boolean;
}

// Access context icons
const ACCESS_ICONS: Record<AccessContext, React.ReactNode> = {
  home: <Home className="h-3 w-3" />,
  errand: <Car className="h-3 w-3" />,
  computer: <Monitor className="h-3 w-3" />,
  phone: <Smartphone className="h-3 w-3" />,
};

export function TaskCard({
  task,
  onToggleComplete,
  onPress,
  className,
  showCheckbox = true,
  compact = false,
}: TaskCardProps) {
  const isCompleted = task.status === "done";
  const priorityColor = getPriorityColor(task.priority);

  // Calculate display duration from block size × block count
  const displayDuration = React.useMemo(() => {
    if (task.blockSize && task.blockCount) {
      return calculateDuration(task.blockSize, task.blockCount);
    }
    return task.duration || 30;
  }, [task.blockSize, task.blockCount, task.duration]);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete?.(task);
  };

  return (
    <div
      data-testid="task-card"
      className={cn(
        "group relative rounded-lg border border-border-default bg-bg-secondary p-4 transition-all",
        "hover:border-border-hover hover:bg-bg-tertiary",
        isCompleted && "opacity-60",
        onPress && "cursor-pointer active:scale-[0.98]",
        compact && "p-3",
        className
      )}
      onClick={() => onPress?.(task)}
      role={onPress ? "button" : undefined}
      tabIndex={onPress ? 0 : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        {showCheckbox && (
          <button
            onClick={handleCheckboxClick}
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
              isCompleted
                ? "border-accent-magenta bg-accent-magenta"
                : "border-border-default hover:border-accent-magenta"
            )}
            aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          >
            {isCompleted && <Check className="h-3 w-3 text-white" />}
          </button>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Task Name */}
          <h3
            className={cn(
              "font-medium text-text-primary",
              isCompleted && "line-through",
              compact ? "text-sm" : "text-base"
            )}
          >
            {task.name}
          </h3>

          {/* Meta info row 1: Duration, Priority */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-text-secondary">
            {/* Block Size Badge */}
            {task.blockSize && task.blockCount && (
              <span className="flex items-center gap-1 rounded bg-bg-tertiary px-1.5 py-0.5 text-xs">
                <Timer className="h-3 w-3" />
                {formatBlockSize(task.blockSize)} × {task.blockCount}
              </span>
            )}

            {/* Duration */}
            <span className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {formatDuration(displayDuration)}
            </span>

            {/* Priority badge */}
            <span
              className="rounded px-1.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${priorityColor}20`,
                color: priorityColor,
              }}
            >
              P{task.priority}
            </span>
          </div>

          {/* Meta info row 2: Access contexts, Location */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {/* Access Context Badges */}
            {task.accessContexts && task.accessContexts.length > 0 && (
              <div className="flex gap-1">
                {task.accessContexts.map((ctx) => (
                  <span
                    key={ctx}
                    className="flex items-center gap-1 rounded bg-accent-magenta/10 px-1.5 py-0.5 text-xs text-accent-magenta"
                    title={ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                  >
                    {ACCESS_ICONS[ctx]}
                  </span>
                ))}
              </div>
            )}

            {/* Location */}
            {task.location && (
              <span className="flex items-center gap-1 text-xs text-text-tertiary">
                <MapPin className="h-3 w-3" />
                {task.location}
              </span>
            )}
          </div>

          {/* Tags */}
          {task.tags.length > 0 && !compact && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-bg-tertiary px-2 py-0.5 text-xs text-text-tertiary"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs text-text-muted">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Subtask progress */}
          {task.subtasks.length > 0 && !compact && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-bg-tertiary">
                  <div
                    className="h-full bg-accent-magenta transition-all"
                    style={{
                      width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%`,
                    }}
                  />
                </div>
                <span>
                  {task.subtasks.filter((s) => s.completed).length}/
                  {task.subtasks.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Color indicator */}
        {task.color && (
          <div
            className="absolute right-0 top-0 h-full w-1 rounded-r-lg"
            style={{ backgroundColor: task.color }}
          />
        )}
      </div>
    </div>
  );
}

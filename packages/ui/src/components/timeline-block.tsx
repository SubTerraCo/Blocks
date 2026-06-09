// ============================================================================
// BLOCKS - TimelineBlock Component
// ============================================================================

import type { Task, CalendarEvent, TimeBlock } from "@blocks/core";
import { calculateDuration } from "@blocks/core";
import { cn, formatTime, formatDuration } from "../lib/utils";

/**
 * Get task duration, handling optional duration field
 */
function getTaskDuration(task: Task): number {
  if (task.blockSize && task.blockCount) {
    return calculateDuration(task.blockSize, task.blockCount);
  }
  return task.duration ?? 30; // Default 30 minutes
}
import { Calendar, Clock, MapPin, Sparkles, X } from "lucide-react";

export interface TimelineBlockProps {
  block: TimeBlock;
  onPress?: (block: TimeBlock) => void;
  onRemoveFromTimeline?: (block: TimeBlock) => void;
  style?: React.CSSProperties;
  className?: string;
}

export function TimelineBlockComponent({
  block,
  onPress,
  onRemoveFromTimeline,
  style,
  className,
}: TimelineBlockProps) {
  const getBlockColor = (): string => {
    switch (block.type) {
      case "task":
        return block.task?.color ?? "#9b4dca"; // Magenta default
      case "calendar_event":
        return block.calendarEvent?.color ?? "#00bcd4"; // Teal default
      case "ai_suggestion":
        return "rgba(155, 77, 202, 0.3)"; // Translucent magenta
      case "free_time":
        return "transparent";
      default:
        return "#9b4dca";
    }
  };

  const getBlockContent = () => {
    switch (block.type) {
      case "task":
        return <TaskBlockContent task={block.task!} />;
      case "calendar_event":
        return <CalendarBlockContent event={block.calendarEvent!} />;
      case "ai_suggestion":
        return <AISuggestionContent suggestion={block.aiSuggestion!} />;
      case "free_time":
        return <FreeTimeContent startTime={block.startTime} endTime={block.endTime} />;
      default:
        return null;
    }
  };

  const isClickable = block.type !== "free_time";

  return (
    <div
      className={cn(
        "timeline-block relative rounded-lg px-3 py-2 transition-all",
        isClickable && "cursor-pointer hover:brightness-110 active:scale-[0.99]",
        block.type === "ai_suggestion" && "border-2 border-dashed border-accent-magenta",
        block.type === "free_time" && "border border-dashed border-border-default bg-transparent",
        className
      )}
      style={{
        backgroundColor: getBlockColor(),
        ...style,
      }}
      onClick={() => isClickable && onPress?.(block)}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      data-testid={block.type === "task" ? "timeline-block" : undefined}
    >
      {block.type === "task" && onRemoveFromTimeline && (
        <button
          type="button"
          aria-label="Remove from timeline"
          title="Remove from timeline (moves to To Do)"
          className="absolute right-1 top-1 z-10 rounded-md bg-black/30 p-1 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100 focus:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveFromTimeline(block);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {getBlockContent()}
    </div>
  );
}

// Task block content
function TaskBlockContent({ task }: { task: Task }) {
  return (
    <div className="flex h-full flex-col justify-between text-white">
      <div>
        <h4 className="font-medium leading-tight">{task.name}</h4>
        {task.location && (
          <p className="mt-0.5 flex items-center gap-1 text-xs opacity-80">
            <MapPin className="h-3 w-3" />
            {task.location}
          </p>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs opacity-70">
        <span className="font-medium">P{task.priority}</span>
        <span>{formatDuration(getTaskDuration(task))}</span>
      </div>
    </div>
  );
}

// Calendar event content
function CalendarBlockContent({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex h-full flex-col justify-between text-white">
      <div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 opacity-70" />
          <h4 className="font-medium leading-tight">{event.title}</h4>
        </div>
        {event.location && (
          <p className="mt-0.5 flex items-center gap-1 text-xs opacity-80">
            <MapPin className="h-3 w-3" />
            {event.location}
          </p>
        )}
      </div>
      <div className="mt-1 text-xs opacity-70">
        {formatTime(event.startTime)} - {formatTime(event.endTime)}
      </div>
    </div>
  );
}

// AI suggestion content
function AISuggestionContent({
  suggestion,
}: {
  suggestion: NonNullable<TimeBlock["aiSuggestion"]>;
}) {
  return (
    <div className="flex h-full flex-col justify-center text-accent-magenta">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">AI Suggestion</span>
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        {suggestion.suggestedTaskName}
      </p>
      <p className="mt-0.5 text-xs text-text-tertiary">{suggestion.reason}</p>
    </div>
  );
}

// Free time slot content
function FreeTimeContent({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date;
}) {
  const durationMinutes = Math.floor(
    (endTime.getTime() - startTime.getTime()) / 60000
  );

  return (
    <div className="flex h-full items-center justify-center text-text-muted">
      <Clock className="mr-2 h-4 w-4" />
      <span className="text-sm">{formatDuration(durationMinutes)} free</span>
    </div>
  );
}

// Export with simpler name
export { TimelineBlockComponent as TimelineBlock };


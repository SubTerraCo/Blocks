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
import type { ReactNode } from "react";
import { Calendar, Clock, MapPin, Sparkles, X } from "lucide-react";

/** Shared action control sizing on timeline task cards (B-0005) */
export const TIMELINE_CARD_ACTION_CLASS =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black/30 text-white transition-colors hover:bg-black/50";

export interface TimelineBlockProps {
  block: TimeBlock;
  onPress?: (block: TimeBlock) => void;
  onRemoveFromTimeline?: (block: TimeBlock) => void;
  /** Optional slot left of remove (e.g. timer play/pause) — bottom-right row */
  actionSlot?: ReactNode;
  /** Elapsed / status label shown in card footer (left) when tracking */
  trackingFooter?: ReactNode;
  /** N-0009: centered clock in card header when tracking */
  trackingHeader?: ReactNode;
  /** Keep footer actions visible without hover (e.g. active tracking) */
  pinActionsVisible?: boolean;
  /** N-0008: flex ratios for pause gap visual split */
  pauseSegmentLayout?: { beforeRatio: number; gapRatio: number; afterRatio: number } | null;
  style?: React.CSSProperties;
  className?: string;
}

export function TimelineBlockComponent({
  block,
  onPress,
  onRemoveFromTimeline,
  actionSlot,
  trackingFooter,
  trackingHeader,
  pinActionsVisible,
  pauseSegmentLayout,
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
        return (
          <TaskBlockContent
            task={block.task!}
            pauseSegmentLayout={pauseSegmentLayout}
          />
        );
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
  const showTaskFooter =
    block.type === "task" && (trackingFooter || actionSlot);

  return (
    <div
      className={cn(
        "timeline-block group relative flex flex-col rounded-lg px-3 py-2 transition-all",
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
          data-testid="timeline-remove-button"
          aria-label="Remove from timeline"
          title="Remove from timeline (moves to To Do)"
          className={cn(
            TIMELINE_CARD_ACTION_CLASS,
            "absolute right-1.5 top-1.5 z-10 opacity-0 transition-opacity",
            "group-hover:opacity-100 focus-visible:opacity-100",
            pinActionsVisible && "opacity-100",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onRemoveFromTimeline(block);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {block.type === "task" && trackingHeader && (
        <div
          className="mb-1 flex shrink-0 items-center justify-center border-b border-white/15 pb-1"
          data-testid="timeline-card-tracking-header"
        >
          {trackingHeader}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden py-0.5">{getBlockContent()}</div>
      {showTaskFooter && (
        <div
          className={cn(
            "mt-auto flex shrink-0 items-center justify-between gap-1 border-t border-white/20 pt-1",
            !pinActionsVisible &&
              "opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
          )}
          data-testid="timeline-card-actions"
        >
          <div className="min-w-0 truncate">{trackingFooter}</div>
          <div className="flex shrink-0 items-center gap-1">{actionSlot}</div>
        </div>
      )}
    </div>
  );
}

// Task block content
function TaskBlockContent({
  task,
  pauseSegmentLayout,
}: {
  task: Task;
  pauseSegmentLayout?: { beforeRatio: number; gapRatio: number; afterRatio: number } | null;
}) {
  const title = (
    <h4
      className="shrink-0 truncate text-base font-semibold leading-snug"
      data-testid="timeline-task-name"
    >
      {task.name}
    </h4>
  );

  const meta = (
    <div
      className="mt-1 flex min-w-0 items-center gap-2 truncate text-sm font-medium opacity-90"
      data-testid="timeline-task-meta"
    >
      <span className="shrink-0">P{task.priority}</span>
      <span className="shrink-0">{formatDuration(getTaskDuration(task))}</span>
      {task.location && (
        <span className="flex min-w-0 items-center gap-1 truncate text-sm opacity-80">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{task.location}</span>
        </span>
      )}
    </div>
  );

  if (pauseSegmentLayout && pauseSegmentLayout.gapRatio > 0.02) {
    const { beforeRatio, gapRatio, afterRatio } = pauseSegmentLayout;
    return (
      <div
        className="flex h-full min-h-0 flex-col text-white"
        data-testid="timeline-block-pause-split"
      >
        <div className="shrink-0">
          {title}
          {meta}
        </div>
        <div className="mt-1 flex min-h-0 flex-1 flex-col">
          {beforeRatio > 0.02 && (
            <div
              className="min-h-0 overflow-hidden border-b border-white/20 py-0.5"
              style={{ flex: beforeRatio }}
            />
          )}
          <div
            className="shrink-0 border border-dashed border-white/40 bg-black/20"
            style={{ flex: gapRatio }}
            data-testid="timeline-block-pause-gap"
            aria-hidden
          />
          {afterRatio > 0.02 && (
            <div className="min-h-0 overflow-hidden py-0.5" style={{ flex: afterRatio }} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col text-white">
      <div className="shrink-0">
        {title}
        {meta}
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


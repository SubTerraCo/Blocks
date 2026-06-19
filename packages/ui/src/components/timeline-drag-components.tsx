"use client";

import { useDraggable } from "@dnd-kit/core";
import type { TimeBlock } from "@blocks/core";
import type { TimelineDropPreview } from "../lib/timeline-drag-position";
import { cn } from "../lib/utils";
import { TimelineBlock } from "./timeline-block";

export interface DraggableTimelineBlockProps {
  block: TimeBlock;
  onPress: (block: TimeBlock) => void;
  onRemoveFromTimeline?: (block: TimeBlock) => void;
  pauseSegmentLayout?: unknown;
  trackingHeader?: React.ReactNode;
  trackingFooter?: React.ReactNode;
  pinActionsVisible?: boolean;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export function DraggableTimelineBlock({
  block,
  onPress,
  onRemoveFromTimeline,
  pauseSegmentLayout,
  trackingHeader,
  trackingFooter,
  pinActionsVisible,
  className,
  style,
  disabled,
}: DraggableTimelineBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: { type: "timeline-block", block },
    disabled,
  });

  const dragStyle = transform
    ? {
        ...style,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : style?.zIndex,
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragging ? "grabbing" : "grab",
      }
    : { ...style, cursor: disabled ? undefined : "grab" };

  return (
    <div
      ref={setNodeRef}
      {...(!disabled ? attributes : {})}
      {...(!disabled ? listeners : {})}
      style={dragStyle}
      className={cn("absolute left-0 right-4 group overflow-hidden touch-none", className)}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onPress(block);
        }
      }}
    >
      <TimelineBlock
        block={block}
        onPress={() => {}}
        onRemoveFromTimeline={onRemoveFromTimeline}
        pauseSegmentLayout={pauseSegmentLayout as never}
        trackingHeader={trackingHeader}
        trackingFooter={trackingFooter}
        pinActionsVisible={pinActionsVisible}
        className={cn(
          "h-full w-full transition-shadow overflow-hidden",
          isDragging && "ring-2 ring-accent-magenta/60 shadow-lg",
        )}
      />
    </div>
  );
}

export interface TimelineDragDropPreviewProps {
  dropPreview: TimelineDropPreview | null;
  pointer: { x: number; y: number };
  activeBlock: TimeBlock | null;
}

/** Ghost outline at drop target + time label that follows the pointer. */
export function TimelineDragDropPreview({
  dropPreview,
  pointer,
  activeBlock,
}: TimelineDragDropPreviewProps) {
  if (!activeBlock || !dropPreview) return null;

  const label = dropPreview.scheduledAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const labelLeft =
    pointer.x > window.innerWidth / 2
      ? Math.max(8, pointer.x - 128)
      : Math.min(pointer.x + 16, window.innerWidth - 128);
  const labelTop =
    pointer.y > window.innerHeight / 2
      ? Math.max(8, pointer.y - 44)
      : Math.min(pointer.y + 16, window.innerHeight - 48);

  return (
    <>
      <div
        aria-hidden
        data-testid="timeline-drop-ghost"
        className="pointer-events-none absolute left-0 right-4 z-30 rounded-lg border-2 border-dashed border-accent-magenta bg-accent-magenta/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]"
        style={{
          top: `${dropPreview.topPx}px`,
          height: `${dropPreview.heightPx}px`,
        }}
      />
      <div
        data-testid="timeline-drag-time-label"
        className="pointer-events-none fixed z-[100] rounded-lg border border-accent-magenta/40 bg-bg-secondary/95 px-2.5 py-1.5 text-sm font-semibold text-text-primary shadow-lg backdrop-blur-sm"
        style={{ left: labelLeft, top: labelTop }}
      >
        <span className="text-xs font-normal text-text-muted">Move to </span>
        {label}
      </div>
    </>
  );
}

export function TimelineDragOverlay({ block }: { block: TimeBlock | null }) {
  if (!block) return null;
  return (
    <div className="w-[min(280px,calc(100vw-2rem))] opacity-95">
      <TimelineBlock
        block={block}
        onPress={() => {}}
        className="shadow-2xl ring-2 ring-accent-magenta cursor-grabbing"
      />
    </div>
  );
}

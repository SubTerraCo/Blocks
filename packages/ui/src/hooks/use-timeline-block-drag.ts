"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { TimeBlock, TimelineHourSlot } from "@blocks/core";
import {
  resolveTimelineDropFromPointer,
  type TimelineDropPreview,
} from "../lib/timeline-drag-position";

export type { TimelineDropPreview };

export interface UseTimelineBlockDragOptions {
  timeBlocks: TimeBlock[];
  slots: TimelineHourSlot[];
  scrollRef: React.RefObject<HTMLElement | null>;
  onReschedule: (taskId: string, scheduledAt: Date) => Promise<void>;
  canDrag?: (block: TimeBlock) => boolean;
  /** N-0024: pause timeline snap/follow while dragging */
  onDragActiveChange?: (active: boolean) => void;
}

export function useTimelineBlockDrag({
  timeBlocks,
  slots,
  scrollRef,
  onReschedule,
  canDrag = (b) => b.type === "task" && !!b.task,
  onDragActiveChange,
}: UseTimelineBlockDragOptions) {
  const [activeBlock, setActiveBlock] = useState<TimeBlock | null>(null);
  const [dropPreview, setDropPreview] = useState<TimelineDropPreview | null>(null);
  const dropPreviewRef = useRef<TimelineDropPreview | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const activeBlockRef = useRef<TimeBlock | null>(null);

  useEffect(() => {
    dropPreviewRef.current = dropPreview;
  }, [dropPreview]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const updateDropPreview = useCallback(
    (clientX: number, clientY: number, block: TimeBlock) => {
      setPointer({ x: clientX, y: clientY });
      const container = scrollRef.current;
      if (!container) return;
      const preview = resolveTimelineDropFromPointer(
        clientY,
        container,
        slots,
        block,
        undefined,
        timeBlocks,
      );
      setDropPreview(preview);
    },
    [scrollRef, slots, timeBlocks],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const block = timeBlocks.find((b) => b.id === event.active.id);
      if (!block || !canDrag(block)) return;
      activeBlockRef.current = block;
      setActiveBlock(block);
      onDragActiveChange?.(true);
      if (event.activatorEvent instanceof PointerEvent) {
        updateDropPreview(
          event.activatorEvent.clientX,
          event.activatorEvent.clientY,
          block,
        );
      }
    },
    [timeBlocks, canDrag, updateDropPreview, onDragActiveChange],
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const block = activeBlockRef.current;
      if (!block || !(event.activatorEvent instanceof PointerEvent)) return;
      updateDropPreview(
        event.activatorEvent.clientX + event.delta.x,
        event.activatorEvent.clientY + event.delta.y,
        block,
      );
    },
    [updateDropPreview],
  );

  const handleDragEnd = useCallback(
    async (_event: DragEndEvent) => {
      const block = activeBlockRef.current;
      const preview = dropPreviewRef.current;
      activeBlockRef.current = null;
      setActiveBlock(null);
      setDropPreview(null);
      onDragActiveChange?.(false);
      if (!block?.task || !preview) return;
      await onReschedule(block.task.id, preview.scheduledAt);
    },
    [onReschedule, onDragActiveChange],
  );

  const handleDragCancel = useCallback(() => {
    activeBlockRef.current = null;
    setActiveBlock(null);
    setDropPreview(null);
    onDragActiveChange?.(false);
  }, [onDragActiveChange]);

  return {
    sensors,
    activeBlock,
    dropPreview,
    pointer,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleDragCancel,
    canDrag,
  };
}

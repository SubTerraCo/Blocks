// ============================================================================
// BLOCKS Desktop - Rolling Timeline (N-0001 / N-0003)
// ============================================================================

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  useTaskStore,
  TimelineBlock,
  TimelineWeekStrip,
  DueDateCalendar,
  TimelineViewToggle,
  useTimelineViewMode,
  useTimelineNowFollow,
  timelineEntrySnapDay,
  cn,
  formatTime,
  useRollingTimeline,
  useTimelineSelectedDay,
  useTimelineScrollDaySync,
  TIMELINE_HOUR_HEIGHT_PX,
  formatDayHeader,
  TimelineScheduleFab,
} from "@blocks/ui";
import type { Task, TimeBlock as TimeBlockType } from "@blocks/core";
import { isSameCalendarDay, isSameHour, startOfDay } from "@blocks/core";
import { RoutineGroups } from "./RoutineGroups";
import type { WeekStartsOn } from "@blocks/core";
import { useTimelineAutoTrack, useTimelinePauseSync } from "../hooks/useTimelineTracking";
import { useTimerStore } from "../hooks/useTimerStore";
import { computePauseSegmentLayout } from "../lib/timeline-pause-visual";
import type { PauseSegmentLayout } from "../lib/timeline-pause-visual";

const SETTINGS_KEY = "blocks-settings";

function loadWeekStartsOn(): WeekStartsOn {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { weekStartsOn?: WeekStartsOn };
      if (parsed.weekStartsOn === "sunday" || parsed.weekStartsOn === "monday") {
        return parsed.weekStartsOn;
      }
    }
  } catch {
    // ignore
  }
  return "monday";
}

function loadTimelineSnapDelaySec(): number {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { timelineSnapDelaySec?: number };
      const v = parsed.timelineSnapDelaySec;
      if (typeof v === "number" && v >= 0 && v <= 120) return v;
    }
  } catch {
    // ignore
  }
  return 15;
}

function loadTimelineNowBarViewportRatio(): number {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { timelineNowBarViewportRatio?: number };
      const v = parsed.timelineNowBarViewportRatio;
      if (typeof v === "number" && v >= 0.25 && v <= 0.75) return v;
    }
  } catch {
    // ignore
  }
  return 0.5;
}

function DraggableTimelineBlock({
  block,
  onPress,
  onRemoveFromTimeline,
  pauseSegmentLayout,
  style,
}: {
  block: TimeBlockType;
  onPress: (block: TimeBlockType) => void;
  onRemoveFromTimeline: (block: TimeBlockType) => void;
  pauseSegmentLayout?: PauseSegmentLayout | null;
  style?: React.CSSProperties;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: { type: "timeline-block", block },
  });

  const dragStyle = transform
    ? {
        ...style,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : style?.zIndex,
        opacity: isDragging ? 0.8 : 1,
        cursor: isDragging ? "grabbing" : "grab",
      }
    : { ...style, cursor: "grab" };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={dragStyle}
      className="absolute left-0 right-4 group overflow-hidden"
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
        pauseSegmentLayout={pauseSegmentLayout}
        className={cn(
          "h-full w-full transition-shadow overflow-hidden",
          isDragging && "shadow-2xl ring-2 ring-accent-magenta"
        )}
      />
    </div>
  );
}

function DroppableTimeSlot({
  slotIndex,
  slotStart,
  minute,
  isOver,
}: {
  slotIndex: number;
  slotStart: Date;
  minute: number;
  isOver?: boolean;
}) {
  const slotId = `slot-${slotIndex}-${minute}`;
  const { setNodeRef } = useDroppable({
    id: slotId,
    data: { type: "time-slot", slotStart: slotStart.toISOString(), minute, slotIndex },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn("absolute left-0 right-0 h-[20px]", isOver && "bg-accent-magenta/20 rounded")}
      style={{ top: `${(minute / 60) * 100}%` }}
    />
  );
}

export function TimelinePage({ onEditTask }: { onEditTask: (task: Task) => void }) {
  const tasks = useTaskStore((state) => state.tasks);
  const addToTimeline = useTaskStore((state) => state.addToTimeline);
  const removeFromTimeline = useTaskStore((state) => state.removeFromTimeline);
  const scheduleDoingTasks = useTaskStore((state) => state.scheduleDoingTasks);
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(() => loadWeekStartsOn());
  const [snapDelaySec, setSnapDelaySec] = useState(() => loadTimelineSnapDelaySec());
  const [nowBarViewportRatio, setNowBarViewportRatio] = useState(() =>
    loadTimelineNowBarViewportRatio(),
  );
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isScheduling, setIsScheduling] = useState(false);
  const [activeBlock, setActiveBlock] = useState<TimeBlockType | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [previewTime, setPreviewTime] = useState<Date | null>(null);
  const { selectedDay, setSelectedDay } = useTimelineSelectedDay();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { viewMode, toggleViewMode } = useTimelineViewMode();
  const timelineActive = viewMode === "timeline";

  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const sessionWallStart = useTimerStore((s) => s.sessionWallStart);
  const trackingPauseSegments = useTimerStore((s) => s.trackingPauseSegments);

  const { slots, timeBlocks } = useRollingTimeline(tasks, currentTime);
  const { selectionOffset, isTransitioning, stripDays, pauseSync } =
    useTimelineScrollDaySync(
      scrollRef,
      selectedDay,
      weekStartsOn,
      setSelectedDay,
      timelineActive,
    );

  const handleEntrySnap = useCallback(
    (now: Date) => setSelectedDay(timelineEntrySnapDay(now)),
    [setSelectedDay],
  );

  const { pauseFollow, scrollToDay, scrollToNow } = useTimelineNowFollow({
    scrollRef,
    slots,
    hourHeightPx: TIMELINE_HOUR_HEIGHT_PX,
    active: timelineActive,
    snapDelaySec,
    nowBarViewportRatio,
    onEntrySnap: handleEntrySnap,
    pauseScrollSync: pauseSync,
    onNowChange: setCurrentTime,
  });

  useTimelineAutoTrack(timeBlocks, currentTime, timelineActive);
  useTimelinePauseSync(tasks, timelineActive);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const doingTasksCount = useMemo(
    () => tasks.filter((t) => t.status === "doing").length,
    [tasks]
  );

  useEffect(() => {
    const onStorage = () => {
      setWeekStartsOn(loadWeekStartsOn());
      setSnapDelaySec(loadTimelineSnapDelaySec());
      setNowBarViewportRatio(loadTimelineNowBarViewportRatio());
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("blocks-settings-changed", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("blocks-settings-changed", onStorage);
    };
  }, []);

  useEffect(() => {
    if (timelineActive) scrollToNow(new Date(), "smooth");
  }, [nowBarViewportRatio, timelineActive, scrollToNow]);

  const handleDragStart = (event: DragStartEvent) => {
    const block = timeBlocks.find((b) => b.id === event.active.id);
    if (block) setActiveBlock(block);
  };

  const parseDropData = (data: Record<string, unknown> | undefined) => {
    if (!data || data.minute === undefined || typeof data.slotStart !== "string") return null;
    const slotStart = new Date(data.slotStart as string);
    const minute = data.minute as number;
    const roundedMinute = Math.round(minute / 15) * 15;
    const scheduled = new Date(slotStart);
    scheduled.setMinutes(roundedMinute, 0, 0);
    return scheduled;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setOverId(String(over.id));
      const scheduled = parseDropData(over.data.current as Record<string, unknown>);
      if (scheduled) setPreviewTime(scheduled);
    } else {
      setOverId(null);
      setPreviewTime(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);
    setOverId(null);
    setPreviewTime(null);
    if (!over) return;

    const block = timeBlocks.find((b) => b.id === active.id);
    if (!block?.task) return;

    const scheduled = parseDropData(over.data.current as Record<string, unknown>);
    if (!scheduled) return;

    await addToTimeline(block.task.id, scheduled);
  };

  const currentMinutePercent = (currentTime.getMinutes() / 60) * 100;
  let lastDayKey = "";

  const generateDropZones = (slotIndex: number, slotStart: Date) =>
    [0, 15, 30, 45].map((minute) => (
      <DroppableTimeSlot
        key={`${slotIndex}-${minute}`}
        slotIndex={slotIndex}
        slotStart={slotStart}
        minute={minute}
        isOver={overId === `slot-${slotIndex}-${minute}`}
      />
    ));

  if (viewMode === "calendar") {
    return (
      <>
        <DueDateCalendar
          tasks={tasks}
          weekStartsOn={weekStartsOn}
          onTaskPress={onEditTask}
        />
        <TimelineViewToggle mode={viewMode} onToggle={toggleViewMode} />
      </>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex min-h-0 flex-col overflow-hidden"
        style={{
          height:
            "calc(100dvh - var(--title-bar-height) - var(--top-bar-height) - var(--bottom-nav-height))",
        }}
        data-testid="rolling-timeline"
        data-snap-delay={snapDelaySec}
        data-now-bar-ratio={nowBarViewportRatio}
      >
        <TimelineWeekStrip
          days={stripDays}
          selectedDay={selectedDay}
          selectionOffset={selectionOffset}
          isScrollTransitioning={isTransitioning}
          weekStartsOn={weekStartsOn}
          onSelectDay={(day) => {
            pauseFollow();
            pauseSync();
            setSelectedDay(startOfDay(day));
            scrollToDay(day);
          }}
          onJumpToToday={() => {
            const today = new Date();
            pauseFollow();
            pauseSync();
            setSelectedDay(startOfDay(today));
            scrollToNow(today, "smooth");
          }}
        />

        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto overscroll-y-contain px-4 py-4 pb-24"
            data-testid="timeline-scroller"
          >
            {previewTime && activeBlock && (
              <div className="fixed top-20 right-4 z-50 rounded-lg bg-accent-magenta px-3 py-2 text-white text-sm font-medium shadow-lg">
                Move to {previewTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}

            <div className="space-y-0">
            {slots.map((slot) => {
              const showDayHeader = slot.dayKey !== lastDayKey;
              if (showDayHeader) lastDayKey = slot.dayKey;

              const isCurrentHour = isSameHour(slot.startTime, currentTime);
              const blocksInHour = timeBlocks.filter((b) =>
                isSameHour(b.startTime, slot.startTime)
              );

              return (
                <div key={`${slot.dayKey}-${slot.hour}`}>
                  {showDayHeader && (
                    <div
                      className="sticky top-0 z-20 border-b border-border-default bg-bg-primary/95 py-2 text-sm font-semibold text-text-primary backdrop-blur"
                      data-testid="timeline-day-header"
                    >
                      {formatDayHeader(slot.startTime)}
                    </div>
                  )}
                  <div
                    data-slot-time={`${slot.startTime.getFullYear()}-${slot.startTime.getMonth()}-${slot.startTime.getDate()}-${slot.hour}`}
                    id={`hour-${slot.slotIndex}`}
                    className="relative flex border-t border-border-default"
                    style={{ height: `${TIMELINE_HOUR_HEIGHT_PX}px` }}
                  >
                    {slot.hour === 0 && (
                      <div
                        data-day-midnight={slot.dayKey}
                        className="pointer-events-none absolute left-0 top-0 h-px w-full"
                        aria-hidden
                      />
                    )}
                    <div className="w-16 shrink-0 pr-3 pt-2 text-right">
                      <span
                        className={cn(
                          "text-sm",
                          isCurrentHour ? "font-semibold text-accent-magenta" : "text-text-tertiary"
                        )}
                      >
                        {formatTime(slot.startTime)}
                      </span>
                    </div>
                    <div className="relative flex-1">
                      {generateDropZones(slot.slotIndex, slot.startTime)}
                      {isCurrentHour && isSameCalendarDay(slot.startTime, currentTime) && (
                        <div
                          className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                          data-testid="current-time"
                          style={{ top: `${currentMinutePercent}%` }}
                        >
                          <div className="h-3 w-3 rounded-full bg-accent-magenta shadow-glow" />
                          <div className="h-0.5 flex-1 bg-accent-magenta shadow-glow" />
                        </div>
                      )}
                      {blocksInHour.map((block) => {
                        const startMinute = block.startTime.getMinutes();
                        const fullDurationMinutes =
                          (block.endTime.getTime() - block.startTime.getTime()) / 60000;
                        const heightPx = (fullDurationMinutes / 60) * TIMELINE_HOUR_HEIGHT_PX;
                        const topPercent = (startMinute / 60) * 100;
                        const pauseSegmentLayout =
                          block.task?.id === activeTaskId
                            ? computePauseSegmentLayout(
                                block.startTime.getTime(),
                                block.endTime.getTime(),
                                sessionWallStart,
                                trackingPauseSegments,
                                currentTime.getTime(),
                              )
                            : null;

                        return (
                          <DraggableTimelineBlock
                            key={block.id}
                            block={block}
                            onPress={(b) => onEditTask(b.task!)}
                            onRemoveFromTimeline={(b) => void removeFromTimeline(b.task!.id)}
                            pauseSegmentLayout={pauseSegmentLayout}
                            style={{
                              top: `${topPercent}%`,
                              height: `${Math.max(heightPx, 40)}px`,
                              zIndex: 5,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

            <div className="mx-auto mt-8 max-w-md pb-8">
              <RoutineGroups />
            </div>
          </div>
        </div>
        <TimelineViewToggle mode={viewMode} onToggle={toggleViewMode} />
        <TimelineScheduleFab
          doingCount={doingTasksCount}
          isScheduling={isScheduling}
          variant="fixed"
          onSchedule={async () => {
            setIsScheduling(true);
            try {
              await scheduleDoingTasks();
            } finally {
              setIsScheduling(false);
            }
          }}
        />
      </div>

      <DragOverlay>
        {activeBlock && (
          <div className="w-64 opacity-80 rotate-2">
            <TimelineBlock block={activeBlock} onPress={() => {}} className="shadow-2xl ring-2 ring-accent-magenta" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

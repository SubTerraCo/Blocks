// ============================================================================

// BLOCKS Desktop - Rolling Timeline (N-0001 / N-0003)

// ============================================================================



import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { DndContext, DragOverlay } from "@dnd-kit/core";

import {

  useTaskStore,

  TimelineWeekStrip,

  ContinuousScrollCalendar,

  TimelineAllDayStrip,

  TimelineViewToggle,

  useTimelineViewMode,

  useTimelineNowFollow,

  timelineEntrySnapDay,

  cn,

  formatTime,

  useRollingTimeline,

  useTimelineSelectedDay,

  useTimelineScrollDaySync,

  useCalendarSync,

  TIMELINE_HOUR_HEIGHT_PX,

  formatDayHeader,

  TimelineScheduleFab,

  useTimelineBlockDrag,

  DraggableTimelineBlock,

  TimelineDragDropPreview,

  TimelineDragOverlay,

  useTimelineSchedule,

  ScheduleConflictDialog,

} from "@blocks/ui";

import type { Task } from "@blocks/core";

import {
  isSameCalendarDay,
  isSameHour,
  startOfDay,
  computeTimelineOverlapLayout,
  overlapLayoutToStyle,
  isAllDayUserEvent,
  rescheduleUserEventTask,
} from "@blocks/core";

import { RoutineGroups } from "./RoutineGroups";

import type { WeekStartsOn } from "@blocks/core";

import { useTimelineAutoTrack, useTimelinePauseSync } from "../hooks/useTimelineTracking";

import { useTimerStore } from "../hooks/useTimerStore";

import { computePauseSegmentLayout } from "../lib/timeline-pause-visual";



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



function loadUse24HourTime(): boolean {

  try {

    const raw = localStorage.getItem(SETTINGS_KEY);

    if (raw) {

      const parsed = JSON.parse(raw) as { use24HourTime?: boolean };

      return parsed.use24HourTime === true;

    }

  } catch {

    // ignore

  }

  return false;

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



export function TimelinePage({ onEditTask }: { onEditTask: (task: Task) => void }) {

  const tasks = useTaskStore((state) => state.tasks);

  const rescheduleTimelineTaskDrag = useTaskStore(
    (state) => state.rescheduleTimelineTaskDrag,
  );

  const removeFromTimeline = useTaskStore((state) => state.removeFromTimeline);

  const updateTask = useTaskStore((state) => state.updateTask);

  const scheduleDoingTasks = useTaskStore((state) => state.scheduleDoingTasks);

  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(() => loadWeekStartsOn());

  const [snapDelaySec, setSnapDelaySec] = useState(() => loadTimelineSnapDelaySec());

  const [use24HourTime, setUse24HourTime] = useState(() => loadUse24HourTime());

  const [nowBarViewportRatio, setNowBarViewportRatio] = useState(() =>

    loadTimelineNowBarViewportRatio(),

  );

  const [currentTime, setCurrentTime] = useState(() => new Date());

  const [isScheduling, setIsScheduling] = useState(false);

  const { selectedDay, setSelectedDay, hydrated } = useTimelineSelectedDay();

  const scrollRef = useRef<HTMLDivElement>(null);

  const { viewMode, toggleViewMode } = useTimelineViewMode();

  const timelineActive = viewMode === "timeline";



  const activeTaskId = useTimerStore((s) => s.activeTaskId);

  const isTimerRunning = useTimerStore((s) => s.isRunning);

  const sessionWallStart = useTimerStore((s) => s.sessionWallStart);

  const trackingPauseSegments = useTimerStore((s) => s.trackingPauseSegments);



  const { events: calendarEvents } = useCalendarSync(currentTime);

  const { slots, timeBlocks } = useRollingTimeline(

    tasks,

    currentTime,

    undefined,

    calendarEvents,

  );



  const schedule = useTimelineSchedule({

    tasks,

    timeBlocks,

    onCommit: async (taskId, scheduledAt) => {
      await rescheduleTimelineTaskDrag(taskId, scheduledAt);
    },

  });

  const { selectionOffset, isTransitioning, stripDays, pauseSync, alignSelectionToDay } =

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



  const { pauseFollow, resumeFollowAfterDrag, scrollToDay, scrollToNow } = useTimelineNowFollow({

    scrollRef,

    slots,

    hourHeightPx: TIMELINE_HOUR_HEIGHT_PX,

    active: timelineActive,

    snapDelaySec,

    nowBarViewportRatio,

    onEntrySnap: handleEntrySnap,

    pauseScrollSync: pauseSync,

    onNowChange: setCurrentTime,

    entryKey: "timeline",

    entryReady: hydrated,

  });



  useTimelineAutoTrack(timeBlocks, currentTime, timelineActive);

  useTimelinePauseSync(tasks, timelineActive);



  const drag = useTimelineBlockDrag({

    timeBlocks,

    slots,

    scrollRef,

    canDrag: (block) => {

      if (block.type === "calendar_event") return false;

      if (block.type !== "task" || !block.task) return false;

      if (block.task.isEvent && isAllDayUserEvent(block.task)) return false;

      return true;

    },

    onReschedule: async (taskId, scheduledAt) => {

      const task = tasks.find((t) => t.id === taskId);

      if (task?.isEvent) {

        await updateTask(taskId, rescheduleUserEventTask(task, scheduledAt));

        return;

      }

      await schedule.requestSchedule(taskId, scheduledAt);

    },

    onDragActiveChange: (active) => {

      if (active) pauseFollow();

      else resumeFollowAfterDrag();

    },

  });



  const overlapLayout = useMemo(

    () => computeTimelineOverlapLayout(timeBlocks),

    [timeBlocks],

  );



  const doingTasksCount = useMemo(

    () => tasks.filter((t) => t.status === "doing").length,

    [tasks],

  );



  useEffect(() => {

    const onStorage = () => {

      setWeekStartsOn(loadWeekStartsOn());

      setSnapDelaySec(loadTimelineSnapDelaySec());

      setUse24HourTime(loadUse24HourTime());

      setNowBarViewportRatio(loadTimelineNowBarViewportRatio());

    };

    window.addEventListener("storage", onStorage);

    window.addEventListener("blocks-settings-changed", onStorage);

    return () => {

      window.removeEventListener("storage", onStorage);

      window.removeEventListener("blocks-settings-changed", onStorage);

    };

  }, []);



  const ratioScrollInit = useRef(false);
  useEffect(() => {
    if (!timelineActive) return;
    if (!ratioScrollInit.current) {
      ratioScrollInit.current = true;
      return;
    }
    scrollToNow(new Date(), "smooth");
  }, [nowBarViewportRatio, timelineActive, scrollToNow]);



  const selectDay = (day: Date) => {

    pauseFollow();

    pauseSync();

    setSelectedDay(startOfDay(day));

    alignSelectionToDay(day);

    scrollToDay(day);

  };



  const currentMinutePercent = (currentTime.getMinutes() / 60) * 100;

  let lastDayKey = "";



  if (viewMode === "calendar") {

    return (

      <>

        <ContinuousScrollCalendar
          tasks={tasks}
          weekStartsOn={weekStartsOn}
          selectedDay={selectedDay}
          onSelectedDayChange={setSelectedDay}
          snapDelaySec={snapDelaySec}
          nowBarViewportRatio={nowBarViewportRatio}
          onTaskPress={onEditTask}
        />

        <TimelineViewToggle mode={viewMode} onToggle={toggleViewMode} />

      </>

    );

  }



  return (

    <DndContext

      sensors={drag.sensors}

      onDragStart={drag.handleDragStart}

      onDragMove={drag.handleDragMove}

      onDragEnd={drag.handleDragEnd}

      onDragCancel={drag.handleDragCancel}

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

          onSelectDay={selectDay}

          onJumpToToday={() => {

            const today = new Date();

            pauseFollow();

            pauseSync();

            setSelectedDay(startOfDay(today));

            alignSelectionToDay(today);

            scrollToNow(today, "smooth");

          }}

        />



        <div className="relative min-h-0 flex-1">

          <div

            ref={scrollRef}

            className="absolute inset-0 overflow-y-auto overscroll-y-contain px-4 py-4 pb-24"

            data-testid="timeline-scroller"

          >

            <TimelineDragDropPreview

              activeBlock={drag.activeBlock}

              dropPreview={drag.dropPreview}

              pointer={drag.pointer}

            />



            <div className="relative space-y-0">

              {slots.map((slot) => {

                const showDayHeader = slot.dayKey !== lastDayKey;

                if (showDayHeader) lastDayKey = slot.dayKey;



                const isCurrentHour = isSameHour(slot.startTime, currentTime);

                const blocksInHour = timeBlocks.filter((b) =>

                  isSameHour(b.startTime, slot.startTime),

                );



                return (

                  <div key={`${slot.dayKey}-${slot.hour}`}>

                    {showDayHeader && (

                      <>

                      <div

                        className="sticky top-0 z-20 border-b border-border-default bg-bg-primary/95 py-2 text-sm font-semibold text-text-primary backdrop-blur"

                        data-testid="timeline-day-header"

                      >

                        {formatDayHeader(slot.startTime)}

                      </div>

                      <TimelineAllDayStrip

                        tasks={tasks}

                        day={slot.startTime}

                        onTaskPress={onEditTask}

                      />

                      </>

                    )}

                    <div

                      data-timeline-hour-row

                      data-slot-index={slot.slotIndex}

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

                            isCurrentHour

                              ? "font-semibold text-accent-magenta"

                              : "text-text-tertiary",

                          )}

                        >

                          {formatTime(slot.startTime, use24HourTime)}

                        </span>

                      </div>

                      <div className="relative flex-1">

                        {isCurrentHour && isSameCalendarDay(slot.startTime, currentTime) && (

                          <div

                            className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"

                            data-testid="current-time"

                            style={{ top: `${currentMinutePercent}%` }}

                          >

                            <div className="h-3 w-3 shrink-0 rounded-full border-2 border-black bg-accent-magenta shadow-glow" />

                            <div className="h-1 flex-1 border-y-2 border-black bg-accent-magenta shadow-glow" />

                          </div>

                        )}

                        {blocksInHour.map((block) => {

                          const startMinute = block.startTime.getMinutes();

                          const fullDurationMinutes =

                            (block.endTime.getTime() - block.startTime.getTime()) / 60000;

                          const heightPx =

                            (fullDurationMinutes / 60) * TIMELINE_HOUR_HEIGHT_PX;

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

                          const isCalendarEvent = block.type === "calendar_event";

                          const isUserEvent = block.task?.isEvent === true;

                          const overlapStyle = overlapLayoutToStyle(

                            overlapLayout.get(block.id),

                          );



                          return (

                            <DraggableTimelineBlock

                              key={block.id}

                              block={block}

                              disabled={isCalendarEvent}

                              onPress={(b) => onEditTask(b.task!)}

                              onRemoveFromTimeline={

                                isCalendarEvent || isUserEvent

                                  ? undefined

                                  : (b) => void removeFromTimeline(b.task!.id)

                              }

                              pauseSegmentLayout={pauseSegmentLayout}

                              style={{

                                top: `${topPercent}%`,

                                height: `${Math.max(heightPx, 40)}px`,

                                zIndex: 5,

                                ...overlapStyle,

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

              await scheduleDoingTasks({

                activeTrackingTaskId: activeTaskId ?? undefined,

                isTimerRunning,

              });

            } finally {

              setIsScheduling(false);

            }

          }}

        />

      </div>



      <DragOverlay dropAnimation={null}>

        <TimelineDragOverlay block={drag.activeBlock} />

      </DragOverlay>



      <ScheduleConflictDialog

        open={schedule.pending !== null}

        taskName={schedule.pending?.taskName ?? ""}

        scheduledAt={schedule.pending?.scheduledAt ?? new Date()}

        durationMinutes={schedule.pending?.durationMinutes ?? 30}

        calendarConflicts={schedule.pending?.calendarConflicts ?? []}

        onConfirm={() => void schedule.confirmPending()}

        onCancel={schedule.cancelPending}

      />

    </DndContext>

  );

}


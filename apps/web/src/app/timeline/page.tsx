"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  useTaskStore,
  TimelineBlock,
  TimelineWeekStrip,
  DueDateCalendar,
  TimelineViewToggle,
  formatTime,
  cn,
  useRollingTimeline,
  useTimelineSelectedDay,
  useTimelineScrollDaySync,
  useTimelineViewMode,
  useSettingsStore,
  useTimelineNowFollow,
  timelineEntrySnapDay,
  TIMELINE_HOUR_HEIGHT_PX,
  formatDayHeader,
  TimelineScheduleFab,
} from "@blocks/ui";
import { isSameCalendarDay, isSameHour, startOfDay, type TimeBlock as TimeBlockType } from "@blocks/core";

export default function TimelinePage() {
  const router = useRouter();
  const pathname = usePathname();
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const scheduleDoingTasks = useTaskStore((state) => state.scheduleDoingTasks);
  const removeFromTimeline = useTaskStore((state) => state.removeFromTimeline);
  const weekStartsOn = useSettingsStore((state) => state.settings.weekStartsOn);
  const snapDelaySec = useSettingsStore((state) => state.settings.timelineSnapDelaySec ?? 15);
  const nowBarViewportRatio =
    useSettingsStore((state) => state.settings.timelineNowBarViewportRatio) ?? 0.5;
  const { selectedDay, setSelectedDay } = useTimelineSelectedDay();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { viewMode, toggleViewMode } = useTimelineViewMode();
  const timelineActive = viewMode === "timeline";

  const [currentTime, setCurrentTime] = useState(() => new Date());
  const { slots, timeBlocks } = useRollingTimeline(tasks, currentTime);

  const handleEntrySnap = useCallback(
    (now: Date) => {
      setSelectedDay(timelineEntrySnapDay(now));
    },
    [setSelectedDay],
  );

  const { selectionOffset, isTransitioning, stripDays, pauseSync } =
    useTimelineScrollDaySync(
      scrollRef,
      selectedDay,
      weekStartsOn,
      setSelectedDay,
      timelineActive,
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
    entryKey: `${pathname}-${viewMode}`,
  });

  useEffect(() => {
    if (timelineActive) scrollToNow(new Date(), "smooth");
  }, [nowBarViewportRatio, timelineActive, scrollToNow]);

  const [isScheduling, setIsScheduling] = useState(false);
  const doingTasksCount = useMemo(
    () => tasks.filter((t) => t.status === "doing").length,
    [tasks],
  );

  const handleScheduleDoingTasks = async () => {
    setIsScheduling(true);
    try {
      await scheduleDoingTasks();
    } catch (error) {
      console.error("Failed to schedule tasks:", error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleBlockPress = (block: TimeBlockType) => {
    if (block.type === "task" && block.task) {
      router.push(`/edit-task/${block.task.id}`);
    }
  };

  const handleRemoveFromTimeline = async (block: TimeBlockType) => {
    if (block.task) {
      await removeFromTimeline(block.task.id);
    }
  };

  const currentMinutePercent = (currentTime.getMinutes() / 60) * 100;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading timeline...</div>
      </div>
    );
  }

  if (viewMode === "calendar") {
    return (
      <>
        <DueDateCalendar
          tasks={tasks}
          weekStartsOn={weekStartsOn}
          onTaskPress={(task) => router.push(`/edit-task/${task.id}`)}
        />
        <TimelineViewToggle mode={viewMode} onToggle={toggleViewMode} />
      </>
    );
  }

  let lastDayKey = "";

  return (
    <div
      className="flex min-h-0 flex-col overflow-hidden"
      style={{ height: "calc(100dvh - var(--top-bar-height) - var(--bottom-nav-height))" }}
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
          <div className="space-y-0">
          {slots.map((slot) => {
            const showDayHeader = slot.dayKey !== lastDayKey;
            if (showDayHeader) lastDayKey = slot.dayKey;

            const isCurrentHour = isSameHour(slot.startTime, currentTime);
            const blocksInHour = timeBlocks.filter((block) =>
              isSameHour(block.startTime, slot.startTime),
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
                        isCurrentHour ? "font-semibold text-accent-magenta" : "text-text-tertiary",
                      )}
                    >
                      {formatTime(slot.startTime)}
                    </span>
                  </div>
                  <div className="relative flex-1">
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

                      return (
                        <div
                          key={block.id}
                          className="group absolute left-0 right-4 overflow-hidden"
                          style={{
                            top: `${topPercent}%`,
                            height: `${Math.max(heightPx, 40)}px`,
                            zIndex: 5,
                          }}
                        >
                          <TimelineBlock
                            block={block}
                            onPress={handleBlockPress}
                            onRemoveFromTimeline={handleRemoveFromTimeline}
                            className="h-full w-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
      <TimelineViewToggle mode={viewMode} onToggle={toggleViewMode} />
      <TimelineScheduleFab
        doingCount={doingTasksCount}
        isScheduling={isScheduling}
        variant="fixed"
        onSchedule={handleScheduleDoingTasks}
      />
    </div>
  );
}

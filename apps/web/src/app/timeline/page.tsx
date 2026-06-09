"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore, TimelineBlock, formatTime, cn, useDailyTimelineReset } from "@blocks/ui";
import type { TimeBlock as TimeBlockType } from "@blocks/core";
import { tasksToTimeBlocks } from "@blocks/core";
import { Clock, CalendarPlus } from "lucide-react";

// Generate time slots for the day (hourly)
function generateTimeSlots(): Date[] {
  const slots: Date[] = [];
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  for (let hour = 0; hour < 24; hour++) {
    const slot = new Date(startOfDay);
    slot.setHours(hour);
    slots.push(slot);
  }

  return slots;
}

export default function TimelinePage() {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const scheduleDoingTasks = useTaskStore((state) => state.scheduleDoingTasks);
  const removeFromTimeline = useTaskStore((state) => state.removeFromTimeline);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScheduling, setIsScheduling] = useState(false);
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const timeBlocks = useMemo(() => tasksToTimeBlocks(tasks), [tasks]);

  useDailyTimelineReset(true);

  const doingTasksCount = useMemo(
    () => tasks.filter((t) => t.status === "doing").length,
    [tasks]
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentHour = new Date().getHours();
    const element = document.getElementById(`hour-${currentHour}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinutePercent = (currentTime.getMinutes() / 60) * 100;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="relative px-4 py-6 pb-24">
      <div className="space-y-0">
        {timeSlots.map((slot) => {
          const hour = slot.getHours();
          const isCurrentHour = hour === currentHour;
          const blocksInHour = timeBlocks.filter((block) => block.startTime.getHours() === hour);
          const HOUR_HEIGHT = 120;

          return (
            <div
              key={hour}
              id={`hour-${hour}`}
              className="relative flex border-t border-border-default"
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              <div className="w-16 shrink-0 pr-3 pt-2 text-right">
                <span
                  className={cn(
                    "text-sm",
                    isCurrentHour ? "font-semibold text-accent-magenta" : "text-text-tertiary"
                  )}
                >
                  {formatTime(slot)}
                </span>
              </div>
              <div className="relative flex-1">
                {isCurrentHour && (
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
                  const heightPx = (fullDurationMinutes / 60) * HOUR_HEIGHT;
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

                {blocksInHour.length === 0 && !isCurrentHour && (
                  <div className="flex h-full items-center justify-center text-text-muted">
                    <span className="text-xs opacity-50">—</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {timeBlocks.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <Clock className="mb-4 h-16 w-16 text-text-muted" />
          <h3 className="mb-2 text-lg font-semibold text-text-primary">No tasks scheduled</h3>
          <p className="text-center text-sm text-text-secondary">
            Move tasks to <strong>Doing</strong> on the Kanban board, then schedule them here.
            Only <strong>Doing</strong> tasks appear on the timeline.
          </p>
          {doingTasksCount > 0 && (
            <button
              onClick={handleScheduleDoingTasks}
              disabled={isScheduling}
              className="mt-6 flex items-center gap-2 rounded-xl bg-accent-cyan px-6 py-3 font-medium text-bg-primary transition-colors hover:bg-accent-cyan/80 disabled:opacity-50"
            >
              <CalendarPlus className="h-5 w-5" />
              {isScheduling
                ? "Scheduling..."
                : `Schedule ${doingTasksCount} Doing Task${doingTasksCount > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      )}

      {doingTasksCount > 0 && timeBlocks.length > 0 && (
        <button
          onClick={handleScheduleDoingTasks}
          disabled={isScheduling}
          className="fixed bottom-24 right-4 z-20 flex items-center gap-2 rounded-xl bg-accent-cyan px-4 py-3 font-medium text-bg-primary shadow-lg transition-all hover:bg-accent-cyan/80 disabled:opacity-50"
        >
          <CalendarPlus className="h-5 w-5" />
          {isScheduling ? "..." : `Schedule ${doingTasksCount}`}
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore, TimelineBlock, formatTime, cn } from "@blocks/ui";
import type { TimeBlock as TimeBlockType, Task } from "@blocks/core";
import { Clock } from "lucide-react";

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

// Convert tasks to timeline blocks
function tasksToTimeBlocks(tasks: Task[]): TimeBlockType[] {
  return tasks
    .filter((t) => t.scheduledAt && (t.status === "todo" || t.status === "doing"))
    .map((task) => {
      const duration = task.duration ?? 30; // Default 30 minutes
      return {
        id: task.id,
        type: "task" as const,
        startTime: task.scheduledAt!,
        endTime: new Date(task.scheduledAt!.getTime() + duration * 60000),
        task,
      };
    });
}

export default function TimelinePage() {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const timeBlocks = useMemo(() => tasksToTimeBlocks(tasks), [tasks]);

  const handleBlockPress = (block: TimeBlockType) => {
    // Only navigate if it's a task block
    if (block.type === "task" && block.task) {
      router.push(`/edit-task/${block.task.id}`);
    }
  };

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to current time on mount
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
    <div className="relative px-4 py-6">
      {/* Time slots */}
      <div className="space-y-0">
        {timeSlots.map((slot) => {
          const hour = slot.getHours();
          const isCurrentHour = hour === currentHour;
          
          // Find blocks that fall within this hour
          const blocksInHour = timeBlocks.filter((block) => {
            const blockHour = block.startTime.getHours();
            return blockHour === hour;
          });

          return (
            <div
              key={hour}
              id={`hour-${hour}`}
              className="relative flex min-h-[80px] border-t border-border-default"
            >
              {/* Time label */}
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

              {/* Time slot content area */}
              <div className="relative flex-1 py-2">
                {/* Current time indicator */}
                {isCurrentHour && (
                  <div
                    className="absolute left-0 right-0 z-10 flex items-center"
                    style={{ top: `${currentMinutePercent}%` }}
                  >
                    <div className="h-3 w-3 rounded-full bg-accent-magenta shadow-glow" />
                    <div className="h-0.5 flex-1 bg-accent-magenta shadow-glow" />
                  </div>
                )}

                {/* Task blocks */}
                {blocksInHour.map((block) => {
                  const startMinute = block.startTime.getMinutes();
                  const durationMinutes = Math.min(
                    60 - startMinute,
                    (block.endTime.getTime() - block.startTime.getTime()) / 60000
                  );
                  const heightPercent = (durationMinutes / 60) * 100;
                  const topPercent = (startMinute / 60) * 100;

                  return (
                    <div
                      key={block.id}
                      className="absolute left-0 right-4"
                      style={{
                        top: `${topPercent}%`,
                        height: `${Math.max(heightPercent, 30)}%`,
                        minHeight: "40px",
                      }}
                    >
                      <TimelineBlock block={block} onPress={handleBlockPress} className="h-full" />
                    </div>
                  );
                })}

                {/* Empty slot indicator */}
                {blocksInHour.length === 0 && !isCurrentHour && (
                  <div className="flex h-full items-center justify-center text-text-muted">
                    {/* Empty */}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {timeBlocks.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <Clock className="mb-4 h-16 w-16 text-text-muted" />
          <h3 className="mb-2 text-lg font-semibold text-text-primary">No tasks scheduled</h3>
          <p className="text-center text-sm text-text-secondary">
            Add tasks and schedule them to see them on your timeline
          </p>
        </div>
      )}
    </div>
  );
}


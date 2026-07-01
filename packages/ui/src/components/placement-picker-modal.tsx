// ============================================================================
// BLOCKS - Placement Picker Modal (shared)  ·  N-0045
// Shown when a Quick Block is used. Returns the chosen timeline start time.
// "Now" folds in the old N-0011 "schedule immediately" behavior.
// ============================================================================

import { useState, useMemo } from "react";
import type { Task, TimeBlock } from "@blocks/core";
import { calculateDuration } from "@blocks/core";
import { Clock, Calendar, ArrowRight, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "../lib/utils";

export type PlacementOption =
  | "now"
  | "after-active"
  | "next-slot"
  | "end-of-day"
  | "custom";

function roundToNextMinute(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setSeconds(0, 0);
  if (d.getTime() < date.getTime()) d.setMinutes(d.getMinutes() + 1);
  return d;
}

function getActiveTaskEndTime(activeTask: Task | null): Date | null {
  if (!activeTask?.scheduledAt) return null;
  const duration =
    activeTask.duration ||
    calculateDuration(activeTask.blockSize || "30min", activeTask.blockCount || 1);
  const endTime = new Date(activeTask.scheduledAt);
  endTime.setMinutes(endTime.getMinutes() + duration);
  return endTime;
}

function findNextFreeSlot(
  scheduledTasks: TimeBlock[],
  durationMinutes: number,
  startFrom: Date = new Date(),
): Date {
  const sortedTasks = [...scheduledTasks].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );
  const roundedStart = new Date(startFrom);
  const roundedMinutes = Math.ceil(roundedStart.getMinutes() / 15) * 15;
  roundedStart.setMinutes(roundedMinutes, 0, 0);
  let searchTime = roundedStart;
  for (const task of sortedTasks) {
    const gapDuration = (task.startTime.getTime() - searchTime.getTime()) / 60000;
    if (gapDuration >= durationMinutes) return searchTime;
    if (task.endTime.getTime() > searchTime.getTime()) searchTime = new Date(task.endTime);
  }
  return searchTime;
}

function getEndOfWorkday(workEndTime: string): Date {
  const [hours, minutes] = workEndTime.split(":").map(Number);
  const endOfDay = new Date();
  endOfDay.setHours(hours ?? 17, minutes ?? 0, 0, 0);
  return endOfDay;
}

function formatTimePreview(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

export interface PlacementPickerModalProps {
  isOpen: boolean;
  /** Title of the task/block being placed. */
  title: string;
  durationMinutes: number;
  activeTask: Task | null;
  scheduledTasks: TimeBlock[];
  workEndTime?: string; // e.g. "17:00"
  onClose: () => void;
  onSchedule: (scheduledAt: Date) => void;
}

export function PlacementPickerModal({
  isOpen,
  title,
  durationMinutes,
  activeTask,
  scheduledTasks,
  workEndTime = "17:00",
  onClose,
  onSchedule,
}: PlacementPickerModalProps) {
  const [selectedOption, setSelectedOption] = useState<PlacementOption>("now");
  const [customTime, setCustomTime] = useState(() => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    return now.toTimeString().slice(0, 5);
  });

  const blockDuration = durationMinutes || 30;

  const optionTimes = useMemo(() => {
    const now = new Date();
    const endOfDay = getEndOfWorkday(workEndTime);
    const endOfDayStart = new Date(endOfDay);
    endOfDayStart.setMinutes(endOfDayStart.getMinutes() - blockDuration);
    return {
      now: roundToNextMinute(now),
      "after-active": getActiveTaskEndTime(activeTask) || now,
      "next-slot": findNextFreeSlot(scheduledTasks, blockDuration, now),
      "end-of-day": endOfDayStart,
    } as Record<Exclude<PlacementOption, "custom">, Date>;
  }, [activeTask, scheduledTasks, blockDuration, workEndTime]);

  const handleSchedule = () => {
    let scheduledAt: Date;
    if (selectedOption === "custom") {
      const [hours, minutes] = customTime.split(":").map(Number);
      scheduledAt = new Date();
      scheduledAt.setHours(hours ?? 0, minutes ?? 0, 0, 0);
    } else {
      scheduledAt = optionTimes[selectedOption];
    }
    onSchedule(scheduledAt);
    onClose();
  };

  if (!isOpen) return null;

  const options: {
    id: PlacementOption;
    label: string;
    description: string;
    time?: Date;
  }[] = [
    {
      id: "now",
      label: "Now",
      description: "Start at the current time (now bar)",
      time: optionTimes.now,
    },
    {
      id: "after-active",
      label: "After current task",
      description: activeTask ? `After "${activeTask.name}" ends` : "After the active task ends",
      time: optionTimes["after-active"],
    },
    {
      id: "next-slot",
      label: "Next free slot",
      description: "First available gap on timeline",
      time: optionTimes["next-slot"],
    },
    {
      id: "end-of-day",
      label: "End of day",
      description: `Ends at ${workEndTime}`,
      time: optionTimes["end-of-day"],
    },
    { id: "custom", label: "Custom time", description: "Choose a specific time" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      data-testid="placement-picker"
    >
      <div className="w-full max-w-md rounded-2xl bg-bg-secondary shadow-xl">
        <div className="flex items-center justify-between border-b border-border-default p-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Schedule "{title}"</h2>
            <p className="text-sm text-text-secondary">Duration: {blockDuration} minutes</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 p-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              data-testid={`placement-option-${option.id}`}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all",
                selectedOption === option.id
                  ? "border-accent-magenta bg-accent-magenta/10"
                  : "border-border-default bg-bg-tertiary hover:border-accent-magenta/50",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2",
                    selectedOption === option.id
                      ? "border-accent-magenta bg-accent-magenta"
                      : "border-border-default",
                  )}
                >
                  {selectedOption === option.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{option.label}</p>
                  <p className="text-sm text-text-secondary">{option.description}</p>
                </div>
              </div>
              {option.time && (
                <div className="flex items-center gap-2 text-accent-cyan">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{formatTimePreview(option.time)}</span>
                </div>
              )}
            </button>
          ))}

          {selectedOption === "custom" && (
            <div className="mt-4 rounded-xl bg-bg-tertiary p-4">
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                <Calendar className="mr-2 inline h-4 w-4" />
                Select time
              </label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-bg-primary px-4 py-3 text-text-primary focus:border-accent-magenta focus:outline-none"
                step="900"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-border-default p-4">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1 gap-2"
            onClick={handleSchedule}
            data-testid="placement-confirm"
          >
            Schedule
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

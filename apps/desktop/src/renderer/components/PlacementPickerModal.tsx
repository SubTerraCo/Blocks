// ============================================================================
// BLOCKS - Placement Picker Modal
// Shows when user taps a Quick Block tile
// Allows user to choose where on the timeline to schedule the task
// ============================================================================

import { useState, useMemo } from "react";
import { Button, cn } from "@blocks/ui";
import type { QuickAddBlock, Task, TimeBlock } from "@blocks/core";
import { calculateDuration } from "@blocks/core";
import { Clock, Calendar, ArrowRight, X } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

type PlacementOption = "after-active" | "next-slot" | "end-of-day" | "custom";

interface PlacementPickerModalProps {
  isOpen: boolean;
  block: QuickAddBlock | null;
  activeTask: Task | null;
  scheduledTasks: TimeBlock[];
  workEndTime: string; // e.g., "17:00"
  onClose: () => void;
  onSchedule: (block: QuickAddBlock, scheduledAt: Date) => void;
}

// ============================================================================
// Helper functions
// ============================================================================

function getActiveTaskEndTime(activeTask: Task | null): Date | null {
  if (!activeTask?.scheduledAt) return null;
  
  const duration = activeTask.duration || calculateDuration(
    activeTask.blockSize || "30min",
    activeTask.blockCount || 1
  );
  
  const endTime = new Date(activeTask.scheduledAt);
  endTime.setMinutes(endTime.getMinutes() + duration);
  
  return endTime;
}

function findNextFreeSlot(
  scheduledTasks: TimeBlock[],
  durationMinutes: number,
  startFrom: Date = new Date()
): Date {
  // Sort tasks by start time
  const sortedTasks = [...scheduledTasks].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
  
  // Round startFrom to next 15-minute increment
  const roundedStart = new Date(startFrom);
  const minutes = roundedStart.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  roundedStart.setMinutes(roundedMinutes, 0, 0);
  
  let searchTime = roundedStart;
  
  // Check each possible slot
  for (const task of sortedTasks) {
    // If there's enough time before this task starts
    const gapEnd = new Date(task.startTime);
    const gapDuration = (gapEnd.getTime() - searchTime.getTime()) / 60000;
    
    if (gapDuration >= durationMinutes) {
      return searchTime;
    }
    
    // Move search time to after this task
    searchTime = new Date(task.endTime);
  }
  
  // No conflicts, use the search time
  return searchTime;
}

function getEndOfWorkday(workEndTime: string): Date {
  const [hours, minutes] = workEndTime.split(":").map(Number);
  const endOfDay = new Date();
  endOfDay.setHours(hours, minutes, 0, 0);
  return endOfDay;
}

function formatTimePreview(date: Date): string {
  return date.toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true 
  });
}

// ============================================================================
// Component
// ============================================================================

export function PlacementPickerModal({
  isOpen,
  block,
  activeTask,
  scheduledTasks,
  workEndTime = "17:00",
  onClose,
  onSchedule,
}: PlacementPickerModalProps) {
  const [selectedOption, setSelectedOption] = useState<PlacementOption>("after-active");
  const [customTime, setCustomTime] = useState(() => {
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes, 0, 0);
    return now.toTimeString().slice(0, 5);
  });
  
  const blockDuration = block?.defaultDuration || 30;
  
  // Calculate times for each option
  const optionTimes = useMemo(() => {
    const now = new Date();
    
    // After active task
    const activeEndTime = getActiveTaskEndTime(activeTask);
    const afterActiveTime = activeEndTime || now;
    
    // Next free slot
    const nextSlotTime = findNextFreeSlot(scheduledTasks, blockDuration, now);
    
    // End of workday (minus duration so it ends at EOD)
    const endOfDay = getEndOfWorkday(workEndTime);
    const endOfDayStart = new Date(endOfDay);
    endOfDayStart.setMinutes(endOfDayStart.getMinutes() - blockDuration);
    
    return {
      "after-active": afterActiveTime,
      "next-slot": nextSlotTime,
      "end-of-day": endOfDayStart,
    };
  }, [activeTask, scheduledTasks, blockDuration, workEndTime]);
  
  const handleSchedule = () => {
    if (!block) return;
    
    let scheduledAt: Date;
    
    if (selectedOption === "custom") {
      const [hours, minutes] = customTime.split(":").map(Number);
      scheduledAt = new Date();
      scheduledAt.setHours(hours, minutes, 0, 0);
    } else {
      scheduledAt = optionTimes[selectedOption];
    }
    
    onSchedule(block, scheduledAt);
    onClose();
  };
  
  if (!isOpen || !block) return null;
  
  const options: { id: PlacementOption; label: string; description: string; time?: Date }[] = [
    {
      id: "after-active",
      label: "After current task",
      description: activeTask 
        ? `After "${activeTask.name}" ends`
        : "Start immediately",
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
    {
      id: "custom",
      label: "Custom time",
      description: "Choose a specific time",
    },
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-bg-secondary shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default p-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Schedule "{block.name}"
            </h2>
            <p className="text-sm text-text-secondary">
              Duration: {blockDuration} minutes
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Options */}
        <div className="p-4 space-y-2">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={cn(
                "w-full flex items-center justify-between rounded-xl p-4 text-left transition-all",
                "border-2",
                selectedOption === option.id
                  ? "border-accent-magenta bg-accent-magenta/10"
                  : "border-border-default bg-bg-tertiary hover:border-accent-magenta/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2",
                  selectedOption === option.id
                    ? "border-accent-magenta bg-accent-magenta"
                    : "border-border-default"
                )}>
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
                  <span className="text-sm font-medium">
                    {formatTimePreview(option.time)}
                  </span>
                </div>
              )}
            </button>
          ))}
          
          {/* Custom time picker */}
          {selectedOption === "custom" && (
            <div className="mt-4 rounded-xl bg-bg-tertiary p-4">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                Select time
              </label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-bg-primary px-4 py-3 text-text-primary focus:border-accent-magenta focus:outline-none"
                step="900" // 15-minute increments
              />
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 border-t border-border-default p-4">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            className="flex-1 gap-2"
            onClick={handleSchedule}
          >
            Schedule
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


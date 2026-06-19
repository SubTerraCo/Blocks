"use client";

import type { TaskScheduleBehavior } from "@blocks/core";
import { cn } from "../lib/utils";

export interface TaskScheduleBehaviorFieldProps {
  value: TaskScheduleBehavior;
  onChange: (value: TaskScheduleBehavior) => void;
  className?: string;
}

const OPTIONS: { value: TaskScheduleBehavior; label: string; description: string }[] = [
  {
    value: "lock_current",
    label: "Lock Current Task",
    description:
      "When scheduling Doing tasks, keep the task under the now-bar with an active timer in place.",
  },
  {
    value: "reschedule_all",
    label: "Reschedule All Tasks",
    description: "Schedule every Doing task from now, including the active task.",
  },
];

export function TaskScheduleBehaviorField({
  value,
  onChange,
  className,
}: TaskScheduleBehaviorFieldProps) {
  return (
    <div className={cn("space-y-2", className)} data-testid="task-schedule-behavior-setting">
      <label className="text-sm font-medium text-text-primary" htmlFor="task-schedule-behavior">
        Task Schedule Behavior
      </label>
      <select
        id="task-schedule-behavior"
        data-testid="task-schedule-behavior-select"
        value={value}
        onChange={(e) => onChange(e.target.value as TaskScheduleBehavior)}
        className="w-full rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-magenta focus:outline-none"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-text-muted">
        {OPTIONS.find((o) => o.value === value)?.description}
      </p>
    </div>
  );
}

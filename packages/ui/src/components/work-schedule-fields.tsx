"use client";

import {
  getOrderedWeekDays,
  isWorkDaySelected,
  toggleWorkDayNumber,
  WEEK_DAY_LABELS,
  type WeekDayKey,
  type WeekStartsOn,
} from "@blocks/core";
import { cn } from "../lib/utils";

export interface WorkScheduleFieldsProps {
  workDays: number[];
  weekStartsOn: WeekStartsOn;
  onWorkDaysChange: (workDays: number[]) => void;
  onWeekStartsOnChange: (value: WeekStartsOn) => void;
}

export function WorkScheduleFields({
  workDays,
  weekStartsOn,
  onWorkDaysChange,
  onWeekStartsOnChange,
}: WorkScheduleFieldsProps) {
  const orderedDays = getOrderedWeekDays(weekStartsOn);

  const toggleDay = (day: WeekDayKey) => {
    onWorkDaysChange(toggleWorkDayNumber(day, workDays));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-text-secondary">Start week on</p>
        <div className="flex gap-2" data-testid="week-start-options">
          <button
            type="button"
            data-testid="week-start-monday"
            onClick={() => onWeekStartsOnChange("monday")}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              weekStartsOn === "monday"
                ? "bg-accent-magenta text-white"
                : "bg-bg-tertiary text-text-secondary hover:bg-border-hover"
            )}
          >
            Monday
          </button>
          <button
            type="button"
            data-testid="week-start-sunday"
            onClick={() => onWeekStartsOnChange("sunday")}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              weekStartsOn === "sunday"
                ? "bg-accent-magenta text-white"
                : "bg-bg-tertiary text-text-secondary hover:bg-border-hover"
            )}
          >
            Sunday
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-text-secondary">Work days</p>
        <div className="flex gap-1" data-testid="work-days-row">
          {orderedDays.map((day) => (
            <button
              key={day}
              type="button"
              data-testid={`work-day-${day}`}
              onClick={() => toggleDay(day)}
              className={cn(
                "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                isWorkDaySelected(day, workDays)
                  ? "bg-accent-magenta text-white"
                  : "bg-bg-tertiary text-text-secondary hover:bg-bg-primary"
              )}
            >
              {WEEK_DAY_LABELS[day]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

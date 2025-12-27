// ============================================================================
// BLOCKS - Recurrence Selector Component
// UI for configuring recurring task patterns
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { cn } from "@blocks/ui";
import type { RecurrenceType, DayOfWeek, RecurrencePattern } from "@blocks/core";
import { getNextOccurrences, buildRecurrencePattern } from "@blocks/core";
import { 
  RefreshCw, 
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface RecurrenceSelectorProps {
  value: RecurrencePattern | undefined;
  onChange: (pattern: RecurrencePattern | undefined) => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom..." },
];

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: "sunday", label: "Sunday", short: "S" },
  { value: "monday", label: "Monday", short: "M" },
  { value: "tuesday", label: "Tuesday", short: "T" },
  { value: "wednesday", label: "Wednesday", short: "W" },
  { value: "thursday", label: "Thursday", short: "T" },
  { value: "friday", label: "Friday", short: "F" },
  { value: "saturday", label: "Saturday", short: "S" },
];

// ============================================================================
// Component
// ============================================================================

export function RecurrenceSelector({ value, onChange, className }: RecurrenceSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [type, setType] = useState<RecurrenceType>(value?.type || "none");
  const [interval, setInterval] = useState(value?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>(value?.daysOfWeek || []);
  const [dayOfMonth, setDayOfMonth] = useState(value?.dayOfMonth || 1);
  const [endDate, setEndDate] = useState<string>(
    value?.endDate ? value.endDate.toISOString().split("T")[0] : ""
  );
  const [occurrences] = useState<number | undefined>(value?.occurrences);
  const [preview, setPreview] = useState<Date[]>([]);
  
  // Update preview when pattern changes
  useEffect(() => {
    if (type === "none") {
      setPreview([]);
      return;
    }
    
    const pattern = buildRecurrencePattern(type, {
      interval,
      daysOfWeek: type === "weekly" ? daysOfWeek : undefined,
      dayOfMonth: type === "monthly" ? dayOfMonth : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      occurrences,
    });
    
    const nextDates = getNextOccurrences(pattern, 5);
    setPreview(nextDates);
  }, [type, interval, daysOfWeek, dayOfMonth, endDate, occurrences]);
  
  // Update parent when values change
  const updatePattern = useCallback(() => {
    if (type === "none") {
      onChange(undefined);
      return;
    }
    
    const pattern = buildRecurrencePattern(type, {
      interval,
      daysOfWeek: type === "weekly" ? daysOfWeek : undefined,
      dayOfMonth: type === "monthly" ? dayOfMonth : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      occurrences,
    });
    
    onChange(pattern);
  }, [type, interval, daysOfWeek, dayOfMonth, endDate, occurrences, onChange]);
  
  useEffect(() => {
    updatePattern();
  }, [updatePattern]);
  
  const toggleDay = (day: DayOfWeek) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };
  
  const getPatternLabel = () => {
    if (type === "none") return "Does not repeat";
    if (type === "daily") {
      return interval === 1 ? "Every day" : `Every ${interval} days`;
    }
    if (type === "weekly") {
      if (daysOfWeek.length === 0) {
        return interval === 1 ? "Every week" : `Every ${interval} weeks`;
      }
      const dayLabels = daysOfWeek.map(
        (d) => DAYS_OF_WEEK.find((day) => day.value === d)?.short || d
      );
      return interval === 1
        ? `Weekly on ${dayLabels.join(", ")}`
        : `Every ${interval} weeks on ${dayLabels.join(", ")}`;
    }
    if (type === "monthly") {
      return interval === 1
        ? `Monthly on day ${dayOfMonth}`
        : `Every ${interval} months on day ${dayOfMonth}`;
    }
    return "Custom recurrence";
  };
  
  return (
    <div className={cn("rounded-lg border border-border-default bg-bg-secondary", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <RefreshCw className={cn(
            "h-4 w-4",
            type !== "none" ? "text-accent-magenta" : "text-text-muted"
          )} />
          <span className="text-sm font-medium text-text-primary">
            {getPatternLabel()}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border-default px-4 py-4 space-y-4">
          {/* Recurrence type */}
          <div>
            <label className="text-xs text-text-muted mb-2 block">Repeat</label>
            <div className="grid grid-cols-2 gap-2">
              {RECURRENCE_OPTIONS.filter((o) => o.value !== "custom").map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors",
                    type === option.value
                      ? "bg-accent-magenta text-white"
                      : "bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Interval (for non-none types) */}
          {type !== "none" && (
            <div>
              <label className="text-xs text-text-muted mb-2 block">Every</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={interval}
                  onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary"
                />
                <span className="text-sm text-text-secondary">
                  {type === "daily" && (interval === 1 ? "day" : "days")}
                  {type === "weekly" && (interval === 1 ? "week" : "weeks")}
                  {type === "monthly" && (interval === 1 ? "month" : "months")}
                </span>
              </div>
            </div>
          )}
          
          {/* Days of week (for weekly) */}
          {type === "weekly" && (
            <div>
              <label className="text-xs text-text-muted mb-2 block">On days</label>
              <div className="flex gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "h-8 w-8 rounded-full text-xs font-medium transition-colors",
                      daysOfWeek.includes(day.value)
                        ? "bg-accent-magenta text-white"
                        : "bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80"
                    )}
                    title={day.label}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Day of month (for monthly) */}
          {type === "monthly" && (
            <div>
              <label className="text-xs text-text-muted mb-2 block">On day</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary"
              />
            </div>
          )}
          
          {/* End date */}
          {type !== "none" && (
            <div>
              <label className="text-xs text-text-muted mb-2 block">Ends</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary"
                />
                {endDate && (
                  <button
                    type="button"
                    onClick={() => setEndDate("")}
                    className="p-1 text-text-muted hover:text-text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Leave empty for no end date
              </p>
            </div>
          )}
          
          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <label className="text-xs text-text-muted mb-2 block">Next occurrences</label>
              <div className="flex flex-wrap gap-2">
                {preview.map((date, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-bg-tertiary px-3 py-1 text-xs text-text-secondary"
                  >
                    {formatDate(date)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


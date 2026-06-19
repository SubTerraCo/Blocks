"use client";

import { cn } from "../lib/utils";
import { ClockTimePicker, bumpEndTimeAfterStart } from "./clock-time-picker";
import { SlideToggle } from "./slide-toggle";
import { useLocalSettingsFlag } from "../hooks/use-local-settings-flag";

export interface TaskEventFieldsProps {
  isEvent: boolean;
  onIsEventChange: (value: boolean) => void;
  eventAllDay: boolean;
  onEventAllDayChange: (value: boolean) => void;
  /** HH:mm 24h */
  eventStartTime: string;
  eventEndTime: string;
  onEventStartTimeChange: (value: string) => void;
  onEventEndTimeChange: (value: string) => void;
  className?: string;
}

/** B-0019 / B-0020 / B-0023 / B-0024 · Event fields with slide toggles + clock times. */
export function TaskEventFields({
  isEvent,
  onIsEventChange,
  eventAllDay,
  onEventAllDayChange,
  eventStartTime,
  eventEndTime,
  onEventStartTimeChange,
  onEventEndTimeChange,
  className,
}: TaskEventFieldsProps) {
  const use24Hour = useLocalSettingsFlag("use24HourTime", false);
  const timedEvent = isEvent && !eventAllDay;

  const handleStartChange = (value: string) => {
    onEventStartTimeChange(value);
    onEventEndTimeChange(bumpEndTimeAfterStart(value, eventEndTime || "10:00", 15));
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border-default bg-bg-secondary p-4 space-y-3",
        className,
      )}
      data-testid="task-event-fields"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-text-primary">Event</span>
        <SlideToggle
          checked={isEvent}
          onChange={(checked) => {
            onIsEventChange(checked);
            if (checked) onEventAllDayChange(true);
          }}
          data-testid="add-task-is-event"
          aria-label="Event"
        />
      </div>

      {isEvent && (
        <>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-text-secondary">All Day</span>
            <SlideToggle
              checked={eventAllDay}
              onChange={onEventAllDayChange}
              data-testid="add-task-event-all-day"
              aria-label="All day event"
            />
          </div>

          {timedEvent && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-medium text-text-secondary">Start</span>
                <ClockTimePicker
                  value={eventStartTime || "09:00"}
                  onChange={handleStartChange}
                  use24Hour={use24Hour}
                  data-testid="add-task-event-start"
                />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-text-secondary">End</span>
                <ClockTimePicker
                  value={eventEndTime || "10:00"}
                  onChange={onEventEndTimeChange}
                  minTime={eventStartTime || "09:00"}
                  use24Hour={use24Hour}
                  data-testid="add-task-event-end"
                />
              </div>
            </div>
          )}

          <p className="text-xs text-text-muted">
            Defaults to All Day until you set start/end times on the clock.
          </p>
        </>
      )}
    </div>
  );
}

/** Build event timestamps from form state (shared DT + WB). */
export function buildEventTimestamps(
  isEvent: boolean,
  dueDate: string,
  eventAllDay: boolean,
  eventStartTime: string,
  eventEndTime: string,
): {
  eventAllDay: boolean;
  eventStartAt?: Date;
  eventEndAt?: Date;
} {
  if (!isEvent) {
    return { eventAllDay: false, eventStartAt: undefined, eventEndAt: undefined };
  }

  const allDay = eventAllDay || (!eventStartTime && !eventEndTime);
  if (!dueDate) {
    return { eventAllDay: allDay, eventStartAt: undefined, eventEndAt: undefined };
  }

  if (allDay) {
    return {
      eventAllDay: true,
      eventStartAt: new Date(`${dueDate}T00:00:00`),
      eventEndAt: new Date(`${dueDate}T23:59:59`),
    };
  }

  return {
    eventAllDay: false,
    eventStartAt: eventStartTime
      ? new Date(`${dueDate}T${eventStartTime}`)
      : new Date(`${dueDate}T00:00:00`),
    eventEndAt: eventEndTime
      ? new Date(`${dueDate}T${eventEndTime}`)
      : eventStartTime
        ? new Date(`${dueDate}T${eventStartTime}`)
        : new Date(`${dueDate}T23:59:59`),
  };
}

/** Parse HH:mm from Date for edit forms. */
export function timeStringFromDate(d?: Date): string {
  if (!d) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

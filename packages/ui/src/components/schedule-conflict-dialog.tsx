"use client";

import type { CalendarScheduleConflict } from "@blocks/core";
import { formatTime } from "../lib/utils";
import { Button } from "./button";
import { AlertTriangle, Calendar, X } from "lucide-react";

export interface ScheduleConflictDialogProps {
  open: boolean;
  taskName: string;
  scheduledAt: Date;
  durationMinutes: number;
  calendarConflicts: CalendarScheduleConflict[];
  onConfirm: () => void;
  onCancel: () => void;
}

/** N-0020 · Confirm scheduling over static calendar events */
export function ScheduleConflictDialog({
  open,
  taskName,
  scheduledAt,
  durationMinutes,
  calendarConflicts,
  onConfirm,
  onCancel,
}: ScheduleConflictDialogProps) {
  if (!open) return null;

  const end = new Date(scheduledAt.getTime() + durationMinutes * 60_000);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      data-testid="schedule-conflict-dialog"
      role="alertdialog"
      aria-labelledby="schedule-conflict-title"
      aria-describedby="schedule-conflict-desc"
    >
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-bg-secondary shadow-xl">
        <div className="flex items-start gap-3 border-b border-border-default p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-warning/15 text-status-warning">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="schedule-conflict-title"
              className="text-lg font-semibold text-text-primary"
            >
              Double booking
            </h2>
            <p id="schedule-conflict-desc" className="mt-1 text-sm text-text-secondary">
              <span className="font-medium text-text-primary">{taskName}</span> overlaps a
              calendar event. You can still schedule it — the task will appear beside the
              event on the timeline.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
            aria-label="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-lg bg-bg-tertiary px-3 py-2 text-sm">
            <p className="font-medium text-text-primary">Your task</p>
            <p className="text-text-secondary">
              {formatTime(scheduledAt)} – {formatTime(end)}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Conflicts with
            </p>
            {calendarConflicts.map((conflict) => (
              <div
                key={conflict.eventId}
                className="flex items-start gap-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-2"
                data-testid="schedule-conflict-event"
              >
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan" />
                <div className="min-w-0">
                  <p className="font-medium text-text-primary">{conflict.title}</p>
                  <p className="text-xs text-text-secondary">
                    {formatTime(conflict.start)} – {formatTime(conflict.end)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border-default p-4">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            data-testid="schedule-conflict-confirm"
          >
            Schedule anyway
          </Button>
        </div>
      </div>
    </div>
  );
}

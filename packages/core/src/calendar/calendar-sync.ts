// ============================================================================
// BLOCKS - Calendar sync (Google → Blocks CalendarEvent cache)
// ============================================================================

import type { CalendarEvent } from "../types";
import { CalendarService } from "./calendar-service";
import type { CalendarCredentials } from "./calendar-service";

export interface CalendarSyncInput {
  calendarIds: string[];
  startDate: Date;
  endDate: Date;
  credentials: CalendarCredentials;
}

/**
 * Fetch events from Google and normalize to Blocks CalendarEvent schema.
 */
export async function syncCalendarEvents(
  input: CalendarSyncInput,
): Promise<CalendarEvent[]> {
  const service = new CalendarService();
  service.setCredentials(input.credentials);
  return service.getEvents({
    calendarIds: input.calendarIds,
    startDate: input.startDate,
    endDate: input.endDate,
  });
}

export function calendarEventsToTimeBlocks(
  events: CalendarEvent[],
  window: { start: Date; end: Date },
): import("../types").TimeBlock[] {
  return events
    .filter((e) => {
      const t = e.startTime.getTime();
      return t >= window.start.getTime() && t <= window.end.getTime();
    })
    .map((event) => ({
      id: `cal-${event.calendarId}-${event.id}`,
      type: "calendar_event" as const,
      startTime: event.startTime,
      endTime: event.endTime,
      calendarEvent: event,
    }));
}

export function mergeTimelineBlocks(
  taskBlocks: import("../types").TimeBlock[],
  eventBlocks: import("../types").TimeBlock[],
): import("../types").TimeBlock[] {
  return [...taskBlocks, ...eventBlocks].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );
}

export function credentialsFromTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}): CalendarCredentials {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? "",
    expiresAt: tokens.expiresAt,
  };
}

// ============================================================================
// BLOCKS - Calendar Service (Google Calendar Integration)
// ============================================================================

import type { CalendarEvent } from "../types";

export interface CalendarCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface CalendarInfo {
  id: string;
  name: string;
  color: string;
  primary: boolean;
}

export interface CalendarSyncOptions {
  calendarIds: string[];
  startDate: Date;
  endDate: Date;
}

/**
 * CalendarService handles Google Calendar integration
 */
export class CalendarService {
  private credentials: CalendarCredentials | null = null;
  private readonly baseUrl = "https://www.googleapis.com/calendar/v3";

  /**
   * Set OAuth credentials
   */
  setCredentials(credentials: CalendarCredentials): void {
    this.credentials = credentials;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.credentials !== null && this.credentials.expiresAt > new Date();
  }

  /**
   * Get list of user's calendars
   */
  async getCalendars(): Promise<CalendarInfo[]> {
    if (!this.credentials) {
      throw new Error("Not authenticated with Google Calendar");
    }

    const response = await fetch(`${this.baseUrl}/users/me/calendarList`, {
      headers: {
        Authorization: `Bearer ${this.credentials.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendars: ${response.status}`);
    }

    const data = await response.json() as {
      items: Array<{
        id: string;
        summary: string;
        backgroundColor: string;
        primary?: boolean;
      }>;
    };

    return data.items.map((cal) => ({
      id: cal.id,
      name: cal.summary,
      color: cal.backgroundColor,
      primary: cal.primary ?? false,
    }));
  }

  /**
   * Fetch events from specified calendars
   */
  async getEvents(options: CalendarSyncOptions): Promise<CalendarEvent[]> {
    if (!this.credentials) {
      throw new Error("Not authenticated with Google Calendar");
    }

    const allEvents: CalendarEvent[] = [];

    for (const calendarId of options.calendarIds) {
      const events = await this.fetchCalendarEvents(
        calendarId,
        options.startDate,
        options.endDate
      );
      allEvents.push(...events);
    }

    // Sort by start time
    return allEvents.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
  }

  /**
   * Fetch events from a single calendar
   */
  private async fetchCalendarEvents(
    calendarId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "250",
    });

    const response = await fetch(
      `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${this.credentials!.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch events for calendar ${calendarId}`);
      return [];
    }

    const data = await response.json() as {
      items: Array<{
        id: string;
        summary?: string;
        description?: string;
        location?: string;
        start: { dateTime?: string; date?: string };
        end: { dateTime?: string; date?: string };
        colorId?: string;
      }>;
    };

    return data.items.map((event) => {
      const isAllDay = !event.start.dateTime;
      
      return {
        id: event.id,
        calendarId,
        title: event.summary ?? "Untitled Event",
        description: event.description,
        startTime: new Date(event.start.dateTime ?? event.start.date ?? ""),
        endTime: new Date(event.end.dateTime ?? event.end.date ?? ""),
        isAllDay,
        location: event.location,
        color: this.getColorFromId(event.colorId),
        isReadOnly: true,
        source: "google" as const,
      };
    });
  }

  /**
   * Create a new event in Google Calendar
   */
  async createEvent(
    calendarId: string,
    event: Omit<CalendarEvent, "id" | "calendarId" | "source" | "isReadOnly">
  ): Promise<CalendarEvent> {
    if (!this.credentials) {
      throw new Error("Not authenticated with Google Calendar");
    }

    const response = await fetch(
      `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.credentials.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          location: event.location,
          start: event.isAllDay
            ? { date: event.startTime.toISOString().split("T")[0] }
            : { dateTime: event.startTime.toISOString() },
          end: event.isAllDay
            ? { date: event.endTime.toISOString().split("T")[0] }
            : { dateTime: event.endTime.toISOString() },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.status}`);
    }

    const data = await response.json() as { id: string };

    return {
      ...event,
      id: data.id,
      calendarId,
      isReadOnly: false,
      source: "google",
    };
  }

  /**
   * Delete an event from Google Calendar
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    if (!this.credentials) {
      throw new Error("Not authenticated with Google Calendar");
    }

    const response = await fetch(
      `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.credentials.accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete event: ${response.status}`);
    }
  }

  /**
   * Find free time slots between events
   */
  findFreeSlots(
    events: CalendarEvent[],
    startTime: Date,
    endTime: Date,
    minDurationMinutes: number = 15
  ): Array<{ start: Date; end: Date; durationMinutes: number }> {
    const freeSlots: Array<{ start: Date; end: Date; durationMinutes: number }> = [];
    
    // Filter to non-all-day events and sort
    const sortedEvents = events
      .filter((e) => !e.isAllDay)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    let currentTime = startTime;

    for (const event of sortedEvents) {
      if (event.startTime > currentTime) {
        const durationMinutes = Math.floor(
          (event.startTime.getTime() - currentTime.getTime()) / 60000
        );
        
        if (durationMinutes >= minDurationMinutes) {
          freeSlots.push({
            start: currentTime,
            end: event.startTime,
            durationMinutes,
          });
        }
      }
      
      if (event.endTime > currentTime) {
        currentTime = event.endTime;
      }
    }

    // Check for free time after last event
    if (currentTime < endTime) {
      const durationMinutes = Math.floor(
        (endTime.getTime() - currentTime.getTime()) / 60000
      );
      
      if (durationMinutes >= minDurationMinutes) {
        freeSlots.push({
          start: currentTime,
          end: endTime,
          durationMinutes,
        });
      }
    }

    return freeSlots;
  }

  /**
   * Map Google Calendar color ID to hex color
   */
  private getColorFromId(colorId?: string): string {
    const colorMap: Record<string, string> = {
      "1": "#7986cb", // Lavender
      "2": "#33b679", // Sage
      "3": "#8e24aa", // Grape
      "4": "#e67c73", // Flamingo
      "5": "#f6bf26", // Banana
      "6": "#f4511e", // Tangerine
      "7": "#039be5", // Peacock
      "8": "#616161", // Graphite
      "9": "#3f51b5", // Blueberry
      "10": "#0b8043", // Basil
      "11": "#d60000", // Tomato
    };
    
    return colorMap[colorId ?? ""] ?? "#9b4dca"; // Default to our magenta
  }
}


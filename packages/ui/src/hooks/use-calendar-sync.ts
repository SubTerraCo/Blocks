import { useCallback, useEffect, useRef, useState } from "react";
import type { CalendarEvent, CalendarInfo } from "@blocks/core";
import {
  DexieStorage,
  CalendarService,
  syncCalendarEvents,
  credentialsFromTokens,
  getTimelineWindow,
  DEFAULT_TIMELINE_WINDOW_DAYS,
} from "@blocks/core";
import { useGoogleCalendarAuth } from "./use-google-calendar-auth";
import { useSettingsStore } from "./use-settings-store";

export function useCalendarSync(
  now: Date = new Date(),
  windowDays: number = DEFAULT_TIMELINE_WINDOW_DAYS,
) {
  const { settings } = useSettingsStore();
  const { getValidTokens, isConnected } = useGoogleCalendarAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadCached = useCallback(async () => {
    const db = DexieStorage.getInstance();
    await db.init();
    const window = getTimelineWindow(now, windowDays);
    const cached = await db.getCalendarEventsInRange(window.start, window.end);
    setEvents(cached);
  }, [now.getTime(), windowDays]);

  const syncNow = useCallback(async () => {
    if (!settings.googleCalendarEnabled || !isConnected) {
      await loadCached();
      return;
    }

    const calendarIds =
      settings.selectedCalendars.length > 0
        ? settings.selectedCalendars
        : ["primary"];

    setIsSyncing(true);
    setError(null);
    try {
      const tokens = await getValidTokens();
      if (!tokens) {
        setError("Google Calendar not connected");
        return;
      }

      const window = getTimelineWindow(now, windowDays);
      const fetched = await syncCalendarEvents({
        calendarIds,
        startDate: window.start,
        endDate: window.end,
        credentials: credentialsFromTokens(tokens),
      });

      const db = DexieStorage.getInstance();
      await db.upsertCalendarEvents(fetched);
      setEvents(fetched);
      setLastSyncAt(new Date());

      const service = new CalendarService();
      service.setCredentials(credentialsFromTokens(tokens));
      const list = await service.getCalendars();
      setCalendars(list);
    } catch (err) {
      setError((err as Error).message);
      await loadCached();
    } finally {
      setIsSyncing(false);
    }
  }, [
    settings.googleCalendarEnabled,
    settings.selectedCalendars,
    isConnected,
    getValidTokens,
    now.getTime(),
    windowDays,
    loadCached,
  ]);

  useEffect(() => {
    void loadCached();
  }, [loadCached]);

  useEffect(() => {
    if (!settings.googleCalendarEnabled) return;
    void syncNow();
  }, [settings.googleCalendarEnabled, settings.selectedCalendars.join(",")]);

  useEffect(() => {
    if (!settings.googleCalendarEnabled) return;
    const minutes = settings.calendarSyncInterval ?? 15;
    if (minutes <= 0) return;
    intervalRef.current = setInterval(() => void syncNow(), minutes * 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.googleCalendarEnabled, settings.calendarSyncInterval, syncNow]);

  return {
    events,
    calendars,
    isSyncing,
    lastSyncAt,
    error,
    syncNow,
    loadCached,
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";

export type TimelineViewMode = "timeline" | "calendar";

const STORAGE_KEY = "blocks:timelineViewMode";
export const CALENDAR_SCROLL_RESET_KEY = "blocks:calendarScrollReset";
export const EXIT_CALENDAR_EVENT = "blocks-exit-calendar-view";

/** N-0031 · Clear calendar scroll session when exiting calendar via nav. */
export function resetCalendarScrollSession(): void {
  try {
    sessionStorage.setItem(CALENDAR_SCROLL_RESET_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

/** N-0031 · Force timeline day view + reset calendar scroll (Timeline nav). */
export function exitToTimelineView(): void {
  resetCalendarScrollSession();
  try {
    sessionStorage.setItem(STORAGE_KEY, "timeline");
  } catch {
    // ignore
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EXIT_CALENDAR_EVENT));
  }
}

/** Re-read scroll reset token when calendar session is cleared. */
export function useCalendarScrollResetToken(): number {
  const [token, setToken] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        const raw = sessionStorage.getItem(CALENDAR_SCROLL_RESET_KEY);
        setToken(raw ? parseInt(raw, 10) : 0);
      } catch {
        setToken(0);
      }
    };
    read();
    window.addEventListener(EXIT_CALENDAR_EVENT, read);
    return () => window.removeEventListener(EXIT_CALENDAR_EVENT, read);
  }, []);

  return token;
}

export function useTimelineViewMode(defaultMode: TimelineViewMode = "timeline") {
  const [viewMode, setViewModeState] = useState<TimelineViewMode>(defaultMode);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw === "timeline" || raw === "calendar") {
        setViewModeState(raw);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onExit = () => setViewModeState("timeline");
    window.addEventListener(EXIT_CALENDAR_EVENT, onExit);
    return () => window.removeEventListener(EXIT_CALENDAR_EVENT, onExit);
  }, []);

  const setViewMode = useCallback((mode: TimelineViewMode) => {
    setViewModeState(mode);
    try {
      sessionStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewModeState((current) => {
      const next: TimelineViewMode = current === "timeline" ? "calendar" : "timeline";
      try {
        sessionStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { viewMode, setViewMode, toggleViewMode };
}

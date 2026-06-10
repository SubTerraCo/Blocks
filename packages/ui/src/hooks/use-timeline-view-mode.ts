"use client";

import { useCallback, useEffect, useState } from "react";

export type TimelineViewMode = "timeline" | "calendar";

const STORAGE_KEY = "blocks:timelineViewMode";

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

"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDayKey, startOfDay } from "@blocks/core";

const STORAGE_KEY = "blocks:timelineSelectedDay";

export function useTimelineSelectedDay(defaultDate: Date = new Date()) {
  const [selectedDay, setSelectedDayState] = useState<Date>(() => startOfDay(defaultDate));

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = new Date(raw);
        if (!Number.isNaN(parsed.getTime())) {
          setSelectedDayState(startOfDay(parsed));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const setSelectedDay = useCallback((date: Date) => {
    const day = startOfDay(date);
    setSelectedDayState(day);
    try {
      sessionStorage.setItem(STORAGE_KEY, day.toISOString());
    } catch {
      // ignore
    }
  }, []);

  return { selectedDay, setSelectedDay, selectedDayKey: formatDayKey(selectedDay) };
}

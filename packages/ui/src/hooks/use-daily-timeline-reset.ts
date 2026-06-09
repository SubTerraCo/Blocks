// ============================================================================
// BLOCKS - Daily Timeline Reset Hook
// Triggers clear timeline at local midnight (00:00)
// ============================================================================

import { useEffect, useRef } from "react";
import { msUntilMidnight } from "@blocks/core";
import { useTaskStore } from "./use-task-store";

const LAST_CLEAR_KEY = "blocks:lastTimelineClear";

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function wasClearedToday(): boolean {
  try {
    return localStorage.getItem(LAST_CLEAR_KEY) === getTodayKey();
  } catch {
    return false;
  }
}

function markClearedToday(): void {
  try {
    localStorage.setItem(LAST_CLEAR_KEY, getTodayKey());
  } catch {
    // ignore storage errors
  }
}

/**
 * Schedules daily timeline clear at 00:00 local time.
 * Also runs on mount if the app was closed overnight.
 */
export function useDailyTimelineReset(enabled = true): void {
  const clearDailyTimeline = useTaskStore((s) => s.clearDailyTimeline);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const runClear = async () => {
      if (wasClearedToday()) return;
      const count = await clearDailyTimeline();
      if (count > 0) {
        markClearedToday();
        console.info(`[Blocks] Cleared ${count} task(s) from timeline at midnight`);
      } else {
        markClearedToday();
      }
    };

    // Catch up if app opens after midnight without running clear
    void runClear();

    const scheduleMidnight = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        await runClear();
        scheduleMidnight();
      }, msUntilMidnight());
    };

    scheduleMidnight();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, clearDailyTimeline]);
}

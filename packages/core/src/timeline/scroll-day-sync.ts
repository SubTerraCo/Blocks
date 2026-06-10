// ============================================================================
// BLOCKS - Timeline scroll / week-strip day sync (N-0004 / SH.EN.02.010.010)
// ============================================================================

import { addDays, formatDayKey, startOfDay } from "./timeline-window";

export interface MidnightBoundary {
  dayKey: string;
  /** Distance from the top of the scroll container's visible viewport to midnight (px) */
  relativeY: number;
}

export interface MidnightBoundaryProgress {
  fromDayKey: string;
  toDayKey: string;
  /** 0 = on fromDay, 0.5 = midnight centered, 1 = locked on toDay */
  progress: number;
  isTransitioning: boolean;
}

export function dayKeyToDate(dayKey: string): Date {
  const parts = dayKey.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return startOfDay(new Date(y, m - 1, d));
}

export function previousDayKey(dayKey: string): string {
  return formatDayKey(addDays(dayKeyToDate(dayKey), -1));
}

/**
 * Maps midnight position in the scroll viewport to a fractional day selection.
 * Indicator moves only while 00:00 is visible; locks on toDay when midnight reaches the top.
 */
export function computeMidnightBoundaryProgress(
  viewportHeight: number,
  boundaries: MidnightBoundary[],
): MidnightBoundaryProgress | null {
  if (boundaries.length === 0 || viewportHeight <= 0) return null;

  const sorted = [...boundaries].sort((a, b) => a.relativeY - b.relativeY);

  for (const boundary of sorted) {
    if (boundary.relativeY >= 0 && boundary.relativeY <= viewportHeight) {
      return {
        fromDayKey: previousDayKey(boundary.dayKey),
        toDayKey: boundary.dayKey,
        progress: 1 - boundary.relativeY / viewportHeight,
        isTransitioning: true,
      };
    }
  }

  const below = sorted.find((b) => b.relativeY > viewportHeight);
  if (below) {
    return {
      fromDayKey: previousDayKey(below.dayKey),
      toDayKey: below.dayKey,
      progress: 0,
      isTransitioning: false,
    };
  }

  const above = [...sorted].reverse().find((b) => b.relativeY < 0);
  if (above) {
    return {
      fromDayKey: previousDayKey(above.dayKey),
      toDayKey: above.dayKey,
      progress: 1,
      isTransitioning: false,
    };
  }

  const first = sorted[0]!;
  return {
    fromDayKey: previousDayKey(first.dayKey),
    toDayKey: first.dayKey,
    progress: 0,
    isTransitioning: false,
  };
}

/** Fractional index into a 7-day week strip for the sliding selection indicator. */
export function weekStripSelectionOffset(
  stripDays: Date[],
  progress: MidnightBoundaryProgress,
): number | null {
  const fromIndex = stripDays.findIndex((d) => formatDayKey(d) === progress.fromDayKey);
  if (fromIndex < 0) return null;
  return fromIndex + progress.progress;
}

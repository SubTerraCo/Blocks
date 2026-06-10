// ============================================================================
// BLOCKS - Timeline scroll positioning (N-0006 / N-0007 / SB.EN.02.040.040)
// ============================================================================

import type { TimelineHourSlot } from "./timeline-window";

/** Matches sticky day header row in timeline pages */
export const TIMELINE_DAY_HEADER_HEIGHT_PX = 41;

/** Matches `py-4` on timeline scroll containers */
export const TIMELINE_SCROLL_PADDING_Y_PX = 16;

/** Y offset from top of scroll content to the given instant */
export function getTimelineYOffsetForTime(
  time: Date,
  slots: TimelineHourSlot[],
  hourHeightPx: number,
  dayHeaderHeightPx: number = TIMELINE_DAY_HEADER_HEIGHT_PX,
): number {
  const targetMs = time.getTime();
  let y = 0;
  let lastDayKey = "";

  for (const slot of slots) {
    if (slot.dayKey !== lastDayKey) {
      y += dayHeaderHeightPx;
      lastDayKey = slot.dayKey;
    }

    const slotStartMs = slot.startTime.getTime();
    const slotEndMs = slotStartMs + 60 * 60 * 1000;

    if (targetMs >= slotStartMs && targetMs < slotEndMs) {
      const minutesIntoHour = (targetMs - slotStartMs) / 60000;
      y += (minutesIntoHour / 60) * hourHeightPx;
      return y;
    }

    y += hourHeightPx;
  }

  return y;
}

/** N-0014: now-bar may sit between ¼ from top and ¼ from bottom of the viewport */
export const TIMELINE_NOW_BAR_MIN_RATIO = 0.25;
export const TIMELINE_NOW_BAR_MAX_RATIO = 0.75;
export const TIMELINE_NOW_BAR_SNAP_POINTS = [1 / 3, 0.5, 2 / 3] as const;
export const TIMELINE_NOW_BAR_SNAP_THRESHOLD = 0.025;

export function clampTimelineNowBarRatio(ratio: number): number {
  return Math.min(
    TIMELINE_NOW_BAR_MAX_RATIO,
    Math.max(TIMELINE_NOW_BAR_MIN_RATIO, ratio),
  );
}

/** Soft magnet to ⅓, center, and ⅔ when within threshold */
export function softSnapTimelineNowBarRatio(ratio: number): number {
  const clamped = clampTimelineNowBarRatio(ratio);
  for (const point of TIMELINE_NOW_BAR_SNAP_POINTS) {
    if (Math.abs(clamped - point) < TIMELINE_NOW_BAR_SNAP_THRESHOLD) return point;
  }
  return clamped;
}

/** scrollTop so `time` aligns at `viewportRatio` of viewport height (0.5 = center) */
export function getScrollTopToAlignTime(
  time: Date,
  slots: TimelineHourSlot[],
  hourHeightPx: number,
  viewportHeight: number,
  viewportRatio: number,
  dayHeaderHeightPx: number = TIMELINE_DAY_HEADER_HEIGHT_PX,
  scrollPaddingTopPx: number = TIMELINE_SCROLL_PADDING_Y_PX,
): number {
  const y = getTimelineYOffsetForTime(time, slots, hourHeightPx, dayHeaderHeightPx);
  const ratio = clampTimelineNowBarRatio(viewportRatio);
  return Math.max(0, scrollPaddingTopPx + y - viewportHeight * ratio);
}

/** scrollTop so `time` sits at vertical center of the viewport */
export function getScrollTopToCenterTime(
  time: Date,
  slots: TimelineHourSlot[],
  hourHeightPx: number,
  viewportHeight: number,
  dayHeaderHeightPx: number = TIMELINE_DAY_HEADER_HEIGHT_PX,
  scrollPaddingTopPx: number = TIMELINE_SCROLL_PADDING_Y_PX,
): number {
  return getScrollTopToAlignTime(
    time,
    slots,
    hourHeightPx,
    viewportHeight,
    0.5,
    dayHeaderHeightPx,
    scrollPaddingTopPx,
  );
}

/** scrollTop so the start of `day` is near the top (week-strip day jump) */
export function getScrollTopForDayStart(
  day: Date,
  slots: TimelineHourSlot[],
  hourHeightPx: number,
  dayHeaderHeightPx: number = TIMELINE_DAY_HEADER_HEIGHT_PX,
): number {
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  return getTimelineYOffsetForTime(d, slots, hourHeightPx, dayHeaderHeightPx);
}

/** Task whose scheduled window contains `now` */
export function findActiveTimelineTaskAtTime(
  tasks: { id: string; status: string; scheduledAt?: Date | string | null }[],
  now: Date,
): { id: string; scheduledAt: Date } | null {
  const nowMs = now.getTime();
  for (const task of tasks) {
    if (task.status !== "doing" || !task.scheduledAt) continue;
    const start = new Date(task.scheduledAt);
    const durationMs = 30 * 60000; // fallback; callers with blocks should prefer block bounds
    const endMs = start.getTime() + durationMs;
    if (nowMs >= start.getTime() && nowMs < endMs) {
      return { id: task.id, scheduledAt: start };
    }
  }
  return null;
}

/** Doing tasks with scheduledAt >= anchor, sorted by time */
export function getDownstreamTimelineTasks<
  T extends { id: string; status: string; scheduledAt?: Date | string | null },
>(tasks: T[], anchorTaskId: string): T[] {
  const anchor = tasks.find((t) => t.id === anchorTaskId);
  if (!anchor?.scheduledAt) return [];

  const anchorMs = new Date(anchor.scheduledAt).getTime();
  return tasks
    .filter((t) => t.status === "doing" && t.scheduledAt)
    .filter((t) => new Date(t.scheduledAt!).getTime() >= anchorMs)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime(),
    );
}

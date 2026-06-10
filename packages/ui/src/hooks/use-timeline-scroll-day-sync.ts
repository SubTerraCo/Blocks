"use client";

import {
  computeMidnightBoundaryProgress,
  dayKeyToDate,
  formatDayKey,
  getWeekStripDays,
  weekStripSelectionOffset,
  type WeekStartsOn,
} from "@blocks/core";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export interface TimelineScrollDaySyncState {
  /** Fractional index (0–6) for the sliding week-strip indicator */
  selectionOffset: number;
  isTransitioning: boolean;
  /** Week strip days anchored to the scroll-visible day */
  stripDays: Date[];
  /** Pause scroll-driven updates during programmatic scroll (ms) */
  pauseSync: (ms?: number) => void;
}

export function useTimelineScrollDaySync(
  scrollRef: RefObject<HTMLElement | null>,
  selectedDay: Date,
  weekStartsOn: WeekStartsOn,
  setSelectedDay: (day: Date) => void,
  /** When false (e.g. calendar view), listeners detach; true rebinds on remount — B-0004 */
  active = true,
): TimelineScrollDaySyncState {
  const skipSyncRef = useRef(false);
  const rafRef = useRef<number>();
  const lastLockedDayRef = useRef(formatDayKey(selectedDay));

  const [selectionOffset, setSelectionOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [stripDays, setStripDays] = useState(() =>
    getWeekStripDays(selectedDay, weekStartsOn),
  );

  const pauseSync = useCallback((ms = 700) => {
    skipSyncRef.current = true;
    window.setTimeout(() => {
      skipSyncRef.current = false;
    }, ms);
  }, []);

  const update = useCallback(() => {
    const container = scrollRef.current;
    if (!container || skipSyncRef.current) return;

    const viewportHeight = container.clientHeight;
    const containerTop = container.getBoundingClientRect().top;
    const markers = container.querySelectorAll("[data-day-midnight]");

    const boundaries = Array.from(markers).map((marker) => {
      const rect = marker.getBoundingClientRect();
      return {
        dayKey: marker.getAttribute("data-day-midnight") ?? "",
        relativeY: rect.top - containerTop,
      };
    });

    const progress = computeMidnightBoundaryProgress(viewportHeight, boundaries);
    if (!progress) return;

    const anchorDay = dayKeyToDate(
      progress.progress >= 0.5 ? progress.toDayKey : progress.fromDayKey,
    );
    const days = getWeekStripDays(anchorDay, weekStartsOn);
    const offset = weekStripSelectionOffset(days, progress);

    if (offset === null) return;

    setStripDays(days);
    setSelectionOffset(offset);
    setIsTransitioning(progress.isTransitioning);

    if (!progress.isTransitioning && progress.progress >= 1) {
      if (lastLockedDayRef.current !== progress.toDayKey) {
        lastLockedDayRef.current = progress.toDayKey;
        setSelectedDay(dayKeyToDate(progress.toDayKey));
      }
    } else if (!progress.isTransitioning && progress.progress <= 0) {
      if (lastLockedDayRef.current !== progress.fromDayKey) {
        lastLockedDayRef.current = progress.fromDayKey;
        setSelectedDay(dayKeyToDate(progress.fromDayKey));
      }
    }
  }, [scrollRef, weekStartsOn, setSelectedDay]);

  useEffect(() => {
    lastLockedDayRef.current = formatDayKey(selectedDay);
    if (!skipSyncRef.current) return;
    const days = getWeekStripDays(selectedDay, weekStartsOn);
    setStripDays(days);
    const index = days.findIndex((d) => formatDayKey(d) === formatDayKey(selectedDay));
    if (index >= 0) {
      setSelectionOffset(index);
    }
  }, [selectedDay, weekStartsOn]);

  useEffect(() => {
    if (!active) return;

    let container: HTMLElement | null = null;
    let mountRaf: number | undefined;
    let observer: ResizeObserver | null = null;

    const onScroll = () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    const bind = () => {
      container = scrollRef.current;
      if (!container) {
        mountRaf = requestAnimationFrame(bind);
        return;
      }

      container.addEventListener("scroll", onScroll, { passive: true });
      observer = new ResizeObserver(() => update());
      observer.observe(container);
      update();
    };

    bind();

    return () => {
      if (mountRaf !== undefined) cancelAnimationFrame(mountRaf);
      if (container) {
        container.removeEventListener("scroll", onScroll);
      }
      observer?.disconnect();
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollRef, update, active]);

  return { selectionOffset, isTransitioning, stripDays, pauseSync };
}

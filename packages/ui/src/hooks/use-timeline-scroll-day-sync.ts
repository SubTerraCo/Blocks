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
  selectionOffset: number;
  isTransitioning: boolean;
  stripDays: Date[];
  pauseSync: (ms?: number) => void;
  /** Snap week-strip indicator to an explicitly chosen day (click / persisted restore) */
  alignSelectionToDay: (day: Date) => void;
}

export function useTimelineScrollDaySync(
  scrollRef: RefObject<HTMLElement | null>,
  selectedDay: Date,
  weekStartsOn: WeekStartsOn,
  setSelectedDay: (day: Date) => void,
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

  const alignSelectionToDay = useCallback(
    (day: Date) => {
      const days = getWeekStripDays(day, weekStartsOn);
      setStripDays(days);
      const index = days.findIndex((d) => formatDayKey(d) === formatDayKey(day));
      if (index >= 0) {
        setSelectionOffset(index);
        setIsTransitioning(false);
        lastLockedDayRef.current = formatDayKey(day);
      }
    },
    [weekStartsOn],
  );

  const update = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

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
      progress.isTransitioning
        ? progress.fromDayKey
        : progress.progress >= 0.5
          ? progress.toDayKey
          : progress.fromDayKey,
    );
    const days = getWeekStripDays(anchorDay, weekStartsOn);
    const offset = weekStripSelectionOffset(days, progress);

    setStripDays(days);
    setIsTransitioning(progress.isTransitioning);
    if (offset !== null) {
      setSelectionOffset(offset);
    }

    if (skipSyncRef.current) return;

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
    alignSelectionToDay(selectedDay);
  }, [selectedDay, alignSelectionToDay]);

  useEffect(() => {
    if (!active) return;

    let container: HTMLElement | null = null;
    let mountRaf: number | undefined;
    let observer: ResizeObserver | null = null;

    const onScroll = () => {
      update();
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

  return { selectionOffset, isTransitioning, stripDays, pauseSync, alignSelectionToDay };
}

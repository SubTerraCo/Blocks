"use client";

import {
  getScrollTopForDayStart,
  getScrollTopToAlignTime,
  startOfDay,
  type TimelineHourSlot,
} from "@blocks/core";
import {
  scrollTimelineContainerToDay,
  scrollTimelineContainerToNow,
} from "../lib/timeline-scroll-dom";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export interface UseTimelineNowFollowOptions {
  scrollRef: RefObject<HTMLElement | null>;
  slots: TimelineHourSlot[];
  hourHeightPx: number;
  /** Timeline view is mounted and visible */
  active: boolean;
  /** 0 = no snap-back after manual scroll; re-entry always snaps */
  snapDelaySec: number;
  /** N-0014: 0.25–0.75 viewport ratio for now-bar alignment on snap-back */
  nowBarViewportRatio?: number;
  onEntrySnap?: (now: Date) => void;
  pauseScrollSync?: (ms?: number) => void;
  /** Keep rolling timeline slots in sync with the follow clock */
  onNowChange?: (now: Date) => void;
  /** Changes while active re-trigger N-0006 entry snap (e.g. route pathname) */
  entryKey?: string;
  /** Wait until sessionStorage day selection is restored before entry snap */
  entryReady?: boolean;
  /** Skip scroll-to-now on entry when restoring a persisted week-strip day */
  suppressEntryScroll?: boolean;
}

export interface TimelineNowFollowState {
  now: Date;
  /** Pause live follow until re-entry or snap-back (week-strip day tap) */
  pauseFollow: () => void;
  /** N-0024: resume snap-delay follow after drag ends */
  resumeFollowAfterDrag: () => void;
  scrollToDay: (day: Date, behavior?: ScrollBehavior) => void;
  scrollToNow: (time?: Date, behavior?: ScrollBehavior) => void;
}

export function useTimelineNowFollow({
  scrollRef,
  slots,
  hourHeightPx,
  active,
  snapDelaySec,
  nowBarViewportRatio = 0.5,
  onEntrySnap,
  pauseScrollSync,
  onNowChange,
  entryKey,
  entryReady = true,
  suppressEntryScroll = false,
}: UseTimelineNowFollowOptions): TimelineNowFollowState {
  const [now, setNow] = useState(() => new Date());

  const publishNow = useCallback(
    (value: Date) => {
      setNow(value);
      onNowChange?.(value);
    },
    [onNowChange],
  );
  const userPausedRef = useRef(false);
  const hasUserScrolledRef = useRef(false);
  const programmaticRef = useRef(false);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wasActiveRef = useRef(false);
  const prevActiveRef = useRef(false);
  const prevEntryReadyRef = useRef(false);
  const lastEntryKeyRef = useRef<string | null>(null);
  const prevSlotsLenRef = useRef(0);

  const applyScrollTop = useCallback(
    (top: number, behavior: ScrollBehavior = "auto") => {
      const el = scrollRef.current;
      if (!el) return;

      programmaticRef.current = true;
      pauseScrollSync?.(behavior === "smooth" ? 1500 : 500);

      if (behavior === "smooth") {
        el.scrollTo({ top, behavior: "smooth" });
        window.setTimeout(() => {
          programmaticRef.current = false;
        }, 700);
      } else {
        el.scrollTop = top;
        window.setTimeout(() => {
          programmaticRef.current = false;
        }, 200);
      }
    },
    [scrollRef, pauseScrollSync],
  );

  const scrollToNow = useCallback(
    (time: Date = new Date(), behavior: ScrollBehavior = "auto") => {
      const el = scrollRef.current;
      if (!el) return;

      if (scrollTimelineContainerToNow(el, time, behavior, nowBarViewportRatio)) {
        programmaticRef.current = true;
        pauseScrollSync?.(behavior === "smooth" ? 1500 : 500);
        window.setTimeout(
          () => {
            programmaticRef.current = false;
          },
          behavior === "smooth" ? 700 : 200,
        );
        return;
      }

      const top = getScrollTopToAlignTime(
        time,
        slots,
        hourHeightPx,
        el.clientHeight,
        nowBarViewportRatio,
      );
      applyScrollTop(top, behavior);
    },
    [scrollRef, slots, hourHeightPx, nowBarViewportRatio, applyScrollTop, pauseScrollSync],
  );

  const scrollToDay = useCallback(
    (day: Date, behavior: ScrollBehavior = "smooth") => {
      const el = scrollRef.current;
      if (!el) return;

      if (scrollTimelineContainerToDay(el, day, behavior)) {
        programmaticRef.current = true;
        pauseScrollSync?.(behavior === "smooth" ? 1500 : 500);
        window.setTimeout(
          () => {
            programmaticRef.current = false;
          },
          behavior === "smooth" ? 700 : 200,
        );
        return;
      }

      const top = getScrollTopForDayStart(day, slots, hourHeightPx);
      applyScrollTop(top, behavior);
    },
    [scrollRef, slots, hourHeightPx, applyScrollTop, pauseScrollSync],
  );

  const pauseFollow = useCallback(() => {
    hasUserScrolledRef.current = true;
    userPausedRef.current = true;
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
  }, []);

  const resumeFollowAfterDrag = useCallback(() => {
    if (snapDelaySec <= 0) {
      userPausedRef.current = false;
      hasUserScrolledRef.current = false;
      return;
    }
    userPausedRef.current = true;
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(() => {
      userPausedRef.current = false;
      hasUserScrolledRef.current = false;
      scrollToNow(new Date(), "smooth");
    }, snapDelaySec * 1000);
  }, [snapDelaySec, scrollToNow]);

  // N-0006: snap to now on timeline entry (mount, calendar toggle back, route remount)
  useEffect(() => {
    const becameActive = active && !prevActiveRef.current;
    prevActiveRef.current = active;

    if (!active) {
      wasActiveRef.current = false;
      lastEntryKeyRef.current = null;
      prevSlotsLenRef.current = 0;
      return;
    }

    const entryReadyEdge = entryReady && !prevEntryReadyRef.current;
    prevEntryReadyRef.current = entryReady;

    if (!entryReady) return;

    if (slots.length === 0) return;

    const key = entryKey ?? "default";
    const isEntry =
      becameActive ||
      entryReadyEdge ||
      !wasActiveRef.current ||
      lastEntryKeyRef.current !== key;
    const slotsJustReady = prevSlotsLenRef.current === 0 && slots.length > 0;
    prevSlotsLenRef.current = slots.length;

    if (!isEntry && !slotsJustReady) return;

    const entryNow = new Date();
    publishNow(entryNow);
    userPausedRef.current = false;
    hasUserScrolledRef.current = false;

    onEntrySnap?.(entryNow);

    if (suppressEntryScroll) {
      wasActiveRef.current = true;
      lastEntryKeyRef.current = key;
      return;
    }

    const runSnap = (attempt = 0) => {
      const el = scrollRef.current;
      if (!el) {
        requestAnimationFrame(() => runSnap(attempt));
        return;
      }

      const minScrollable = el.scrollHeight - el.clientHeight;
      if (minScrollable < 100 && attempt < 60) {
        requestAnimationFrame(() => runSnap(attempt + 1));
        return;
      }

      scrollToNow(entryNow, "auto");
      wasActiveRef.current = true;
      lastEntryKeyRef.current = key;
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(runSnap);
    });
  }, [
    active,
    entryKey,
    entryReady,
    slots.length,
    onEntrySnap,
    scrollToNow,
    publishNow,
    suppressEntryScroll,
  ]);

  // N-0007: clock tick — update now-line only; do not fight user scroll every second
  useEffect(() => {
    if (!active) return;

    const tick = () => {
      publishNow(new Date());
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [active, publishNow]);

  // User scroll → pause follow; optional snap-back after delay (wheel/touch only — not scroll events)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !active) return;

    let wheelIdleTimer: ReturnType<typeof setTimeout> | undefined;

    const onUserScrollIntent = () => {
      if (programmaticRef.current) return;

      hasUserScrolledRef.current = true;
      userPausedRef.current = true;
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);

      if (snapDelaySec <= 0) return;

      snapTimerRef.current = setTimeout(() => {
        userPausedRef.current = false;
        hasUserScrolledRef.current = false;
        scrollToNow(new Date(), "smooth");
      }, snapDelaySec * 1000);
    };

    const onWheel = () => {
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(onUserScrollIntent, 120);
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchmove", onUserScrollIntent, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", onUserScrollIntent);
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, [active, snapDelaySec, scrollRef, scrollToNow]);

  return {
    now,
    pauseFollow,
    resumeFollowAfterDrag,
    scrollToDay,
    scrollToNow,
  };
}

/** Convenience for entry snap: set selected day to today */
export function timelineEntrySnapDay(now: Date): Date {
  return startOfDay(now);
}

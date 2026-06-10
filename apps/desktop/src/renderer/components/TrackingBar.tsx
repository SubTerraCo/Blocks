// ============================================================================
// N-0010 / N-0013 · App tracking clock + music-player control row
// ============================================================================

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Clock,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import {
  useTaskStore,
  cn,
  TIMELINE_BOTTOM_ACTION_BTN,
  TIMELINE_BOTTOM_ACTION_BTN_SM,
  TIMELINE_TRACKING_PLAYER_ROW,
} from "@blocks/ui";
import {
  buildDownstreamScheduleShiftUpdates,
  getRemainingTimelineSlotMs,
  getTaskDurationMinutes,
} from "@blocks/core";
import { useTimerStore, formatTimerDisplay } from "../hooks/useTimerStore";

const SETTINGS_KEY = "blocks-settings";
/** Top → bottom: +30 … +5 (N-0016) */
const TIME_ADD_OPTIONS = [30, 15, 10, 5] as const;
const DOUBLE_TAP_MS = 600;

export function loadTimelineTimerDisplayMode(): "elapsed" | "remaining" {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { timelineTimerDisplayMode?: string };
      if (parsed.timelineTimerDisplayMode === "remaining") return "remaining";
    }
  } catch {
    // ignore
  }
  return "elapsed";
}

function useTrackingTimerDisplay() {
  const {
    activeTaskId,
    isRunning,
    isPaused,
    getElapsedTime,
    getRemainingTime,
  } = useTimerStore();
  const [displayMode, setDisplayMode] = useState(loadTimelineTimerDisplayMode);
  const [elapsed, setElapsed] = useState(0);

  const isTracking = !!activeTaskId && (isRunning || isPaused);

  useEffect(() => {
    const onSettingsChange = () => setDisplayMode(loadTimelineTimerDisplayMode());
    window.addEventListener("storage", onSettingsChange);
    window.addEventListener("blocks-settings-changed", onSettingsChange);
    return () => {
      window.removeEventListener("storage", onSettingsChange);
      window.removeEventListener("blocks-settings-changed", onSettingsChange);
    };
  }, []);

  useEffect(() => {
    if (!isTracking) return;
    const tick = () => setElapsed(getElapsedTime());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isTracking, isRunning, isPaused, getElapsedTime]);

  const remaining = isTracking ? getRemainingTime() : 0;
  const isOvertime = remaining < 0;
  const showRemaining = displayMode === "remaining";
  const displayMs = showRemaining ? Math.max(0, remaining) : elapsed;
  const clockLabel = showRemaining
    ? isOvertime
      ? `+${formatTimerDisplay(Math.abs(remaining))}`
      : formatTimerDisplay(displayMs)
    : formatTimerDisplay(displayMs);

  return {
    isTracking,
    isRunning,
    isPaused,
    activeTaskId,
    showRemaining,
    isOvertime,
    clockLabel,
  };
}

/** Replaces page title in app header while a task is being tracked */
export function AppTrackingClock() {
  const { isTracking, isRunning, showRemaining, isOvertime, clockLabel } =
    useTrackingTimerDisplay();

  if (!isTracking) return null;

  return (
    <div
      className="flex items-center justify-center gap-2.5"
      data-testid="app-tracking-clock"
    >
      <Clock
        className={cn(
          "h-5 w-5 text-accent-magenta",
          isRunning && "animate-pulse",
        )}
      />
      <span
        className={cn(
          "font-mono text-2xl font-bold tabular-nums tracking-tight text-text-primary",
          showRemaining && isOvertime && "text-status-warning",
        )}
        data-testid="app-tracking-clock-value"
      >
        {clockLabel}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {showRemaining ? "left" : isRunning ? "elapsed" : "paused"}
      </span>
    </div>
  );
}

/**
 * Music-player row: extend time (prev) · pause/resume · complete (next, double-tap).
 */
export function TrackingControlBar() {
  const { isTracking, isRunning, isPaused, activeTaskId } = useTrackingTimerDisplay();
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const shiftTimelineSchedules = useTaskStore((s) => s.shiftTimelineSchedules);
  const {
    pauseTimer,
    resumeTimer,
    stopTimer,
    beginTimelinePauseSync,
    endTimelinePauseSync,
  } = useTimerStore();

  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [nextConfirmPending, setNextConfirmPending] = useState(false);
  const nextTapRef = useRef(0);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const timeMenuRef = useRef<HTMLDivElement>(null);

  const closeTimeMenu = useCallback(() => {
    if (!showTimeMenu) return;
    setMenuClosing(true);
    window.setTimeout(() => {
      setShowTimeMenu(false);
      setMenuClosing(false);
    }, 200);
  }, [showTimeMenu]);

  const openTimeMenu = useCallback(() => {
    setMenuClosing(false);
    setShowTimeMenu(true);
  }, []);

  const toggleTimeMenu = useCallback(() => {
    if (showTimeMenu) closeTimeMenu();
    else openTimeMenu();
  }, [showTimeMenu, closeTimeMenu, openTimeMenu]);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const handlePauseResume = useCallback(() => {
    if (!activeTaskId) return;
    if (isRunning) {
      pauseTimer();
      beginTimelinePauseSync(activeTaskId, tasks);
    } else if (isPaused) {
      resumeTimer();
      endTimelinePauseSync();
    }
  }, [
    activeTaskId,
    isRunning,
    isPaused,
    pauseTimer,
    resumeTimer,
    beginTimelinePauseSync,
    endTimelinePauseSync,
    tasks,
  ]);

  const handleAddTime = useCallback(
    async (minutes: number) => {
      if (!activeTaskId || !activeTask) return;
      closeTimeMenu();

      const newDuration = getTaskDurationMinutes(activeTask) + minutes;
      await updateTask(activeTaskId, { duration: newDuration });

      const forward = buildDownstreamScheduleShiftUpdates(
        tasks,
        activeTaskId,
        minutes * 60_000,
      );
      if (forward.length > 0) {
        await shiftTimelineSchedules(forward);
      }
    },
    [activeTask, activeTaskId, tasks, updateTask, shiftTimelineSchedules, closeTimeMenu],
  );

  const handleCompleteTask = useCallback(async () => {
    if (!activeTaskId || !activeTask?.scheduledAt) return;

    const freedMs = getRemainingTimelineSlotMs(activeTask);
    const backward = buildDownstreamScheduleShiftUpdates(
      tasks,
      activeTaskId,
      -freedMs,
    );

    stopTimer();
    endTimelinePauseSync();
    await completeTask(activeTaskId);

    if (backward.length > 0) {
      await shiftTimelineSchedules(backward);
    }

    setNextConfirmPending(false);
    nextTapRef.current = 0;
  }, [
    activeTask,
    activeTaskId,
    tasks,
    stopTimer,
    endTimelinePauseSync,
    completeTask,
    shiftTimelineSchedules,
  ]);

  const handleNextTap = useCallback(() => {
    const now = Date.now();
    if (now - nextTapRef.current < DOUBLE_TAP_MS) {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      void handleCompleteTask();
    } else {
      nextTapRef.current = now;
      setNextConfirmPending(true);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = setTimeout(() => {
        setNextConfirmPending(false);
        nextTapRef.current = 0;
      }, DOUBLE_TAP_MS);
    }
  }, [handleCompleteTask]);

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showTimeMenu) return;
    const onPointerDown = (e: MouseEvent) => {
      if (timeMenuRef.current?.contains(e.target as Node)) return;
      closeTimeMenu();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showTimeMenu, closeTimeMenu]);

  if (!isTracking) return null;

  return (
    <div
      className={TIMELINE_TRACKING_PLAYER_ROW}
      data-testid="tracking-control-bar"
    >
      {/* B-0013: fixed h-10 slot; menu grows upward via absolute positioning */}
      <div ref={timeMenuRef} className="relative h-10 w-10 shrink-0">
        <div
          className={cn(
            "absolute bottom-full left-0 flex w-10 flex-col overflow-hidden rounded-t-xl bg-accent-magenta text-white shadow-md origin-bottom transition-[max-height] duration-300 ease-[cubic-bezier(0.34,1.45,0.64,1)]",
            showTimeMenu && !menuClosing && "animate-time-menu-open max-h-[8.5rem]",
            menuClosing && "animate-time-menu-close max-h-0",
            !showTimeMenu && !menuClosing && "max-h-0 pointer-events-none",
          )}
          data-testid="tracking-time-add-menu"
        >
          {TIME_ADD_OPTIONS.map((mins) => (
            <button
              key={mins}
              type="button"
              data-testid={`tracking-add-time-${mins}`}
              aria-label={`Add ${mins} minutes`}
              className="flex h-8 w-10 shrink-0 items-center justify-center text-sm font-bold tabular-nums hover:bg-white/15"
              onClick={() => void handleAddTime(mins)}
            >
              +{mins}
            </button>
          ))}
        </div>
        <button
          type="button"
          data-testid="tracking-prev-time"
          aria-label="Add time to task"
          title="Add time"
          aria-expanded={showTimeMenu}
          onClick={toggleTimeMenu}
          className={cn(
            TIMELINE_BOTTOM_ACTION_BTN_SM,
            "h-10 w-10 shadow-none hover:bg-accent-magenta/90",
            showTimeMenu && !menuClosing ? "rounded-t-none" : "rounded-xl",
          )}
        >
          <SkipBack className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      </div>

      <button
        type="button"
        data-testid="tracking-pause-resume"
        onClick={handlePauseResume}
        aria-label={isRunning ? "Pause tracking" : "Resume tracking"}
        title={isRunning ? "Pause" : "Resume"}
        className={cn(TIMELINE_BOTTOM_ACTION_BTN, isRunning && "animate-pulse")}
      >
        {isRunning ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" />
        )}
      </button>

      <button
        type="button"
        data-testid="tracking-next-complete"
        aria-label={
          nextConfirmPending
            ? "Tap again to complete task"
            : "Complete task (double tap)"
        }
        title={nextConfirmPending ? "Tap again to confirm" : "Complete task"}
        onClick={handleNextTap}
        className={cn(
          TIMELINE_BOTTOM_ACTION_BTN_SM,
          nextConfirmPending && "ring-2 ring-white ring-offset-2 ring-offset-accent-magenta",
        )}
      >
        <SkipForward className="h-4 w-4" />
      </button>
    </div>
  );
}

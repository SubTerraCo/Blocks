// ============================================================================
// BLOCKS - Active Timer Component
// Floating timer display for the currently tracked task
// Shows elapsed time, controls, and overtime warnings
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { useTimerStore, formatTimerDisplay, formatMinutesDisplay } from "../hooks/useTimerStore";
import { useTaskStore, cn, Button } from "@blocks/ui";
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  AlertTriangle,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface ActiveTimerProps {
  onTaskClick?: (taskId: string) => void;
  /** Hide floating panel on Timeline — tracking lives on card footers (B-0007) */
  hidden?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ActiveTimer({ onTaskClick, hidden }: ActiveTimerProps) {
  const {
    activeTaskId,
    isRunning,
    isPaused,
    estimatedDuration,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getElapsedTime,
    getRemainingTime,
    getProgress,
  } = useTimerStore();
  
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  
  const [elapsed, setElapsed] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false);
  
  // Get the active task
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  
  // Update elapsed time every second
  useEffect(() => {
    if (!isRunning && !isPaused) return;
    
    const interval = setInterval(() => {
      setElapsed(getElapsedTime());
    }, 1000);
    
    // Initial update
    setElapsed(getElapsedTime());
    
    return () => clearInterval(interval);
  }, [isRunning, isPaused, getElapsedTime]);
  
  // Check for overtime
  useEffect(() => {
    const remaining = getRemainingTime();
    if (remaining < 0 && !showOvertimeWarning && isRunning) {
      setShowOvertimeWarning(true);
      // Show notification
      if (Notification.permission === "granted") {
        new Notification("Time's up!", {
          body: `"${activeTask?.name}" has exceeded its estimated time.`,
          icon: "/icons/icon-192.png",
        });
      }
    }
  }, [elapsed, getRemainingTime, showOvertimeWarning, isRunning, activeTask?.name]);
  
  const handlePauseResume = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else if (isPaused) {
      resumeTimer();
    }
  }, [isRunning, isPaused, pauseTimer, resumeTimer]);
  
  const handleStop = useCallback(async () => {
    const result = stopTimer();
    if (result && activeTask) {
      // Update task with time spent
      const currentTimeSpent = activeTask.timeSpent || 0;
      await updateTask(activeTask.id, {
        timeSpent: currentTimeSpent + result.timeSpent,
      });
    }
    setShowOvertimeWarning(false);
  }, [stopTimer, activeTask, updateTask]);
  
  const handleTaskClick = useCallback(() => {
    if (activeTaskId && onTaskClick) {
      onTaskClick(activeTaskId);
    }
  }, [activeTaskId, onTaskClick]);
  
  // Don't render if no active timer or hidden on timeline view
  if (hidden || !activeTaskId || !activeTask) return null;
  
  const remaining = getRemainingTime();
  const progress = getProgress();
  const isOvertime = remaining < 0;
  
  return (
    <div
      className={cn(
        "fixed z-40 transition-all duration-300 shadow-lg",
        isMinimized 
          ? "bottom-20 left-4 w-auto"
          : "bottom-20 left-4 w-80"
      )}
    >
      {/* Overtime warning banner */}
      {showOvertimeWarning && !isMinimized && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-status-warning/20 px-3 py-2 text-status-warning">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Time exceeded!</span>
          </div>
          <button
            onClick={() => setShowOvertimeWarning(false)}
            className="text-status-warning/60 hover:text-status-warning"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Timer card */}
      <div className={cn(
        "rounded-xl border bg-bg-secondary",
        isOvertime 
          ? "border-status-warning" 
          : "border-border-default"
      )}>
        {/* Minimized view */}
        {isMinimized ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <button
              onClick={handlePauseResume}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                isRunning 
                  ? "bg-accent-magenta text-white" 
                  : "bg-accent-green text-white"
              )}
            >
              {isRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>
            
            <span className={cn(
              "font-mono text-lg font-bold",
              isOvertime ? "text-status-warning" : "text-text-primary"
            )}>
              {formatTimerDisplay(elapsed)}
            </span>
            
            <button
              onClick={() => setIsMinimized(false)}
              className="text-text-muted hover:text-text-primary"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
              <div className="flex items-center gap-2">
                <Clock className={cn(
                  "h-4 w-4",
                  isRunning ? "text-accent-green animate-pulse" : "text-text-muted"
                )} />
                <span className="text-sm font-medium text-text-primary">
                  {isRunning ? "Tracking" : isPaused ? "Paused" : "Timer"}
                </span>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-text-muted hover:text-text-primary"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            
            {/* Task info */}
            <button
              onClick={handleTaskClick}
              className="w-full px-4 py-3 text-left hover:bg-bg-tertiary transition-colors"
            >
              <p className="text-sm font-medium text-text-primary truncate">
                {activeTask.name}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Est: {formatMinutesDisplay(estimatedDuration)}
              </p>
            </button>
            
            {/* Timer display */}
            <div className="px-4 py-4">
              <div className="text-center mb-4">
                <span className={cn(
                  "font-mono text-4xl font-bold",
                  isOvertime ? "text-status-warning" : "text-text-primary"
                )}>
                  {formatTimerDisplay(elapsed)}
                </span>
                {isOvertime && (
                  <p className="text-xs text-status-warning mt-1">
                    {formatTimerDisplay(Math.abs(remaining))} overtime
                  </p>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden mb-4">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    isOvertime 
                      ? "bg-status-warning" 
                      : progress > 80 
                        ? "bg-accent-cyan" 
                        : "bg-accent-green"
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              
              {/* Time breakdown */}
              <div className="flex justify-between text-xs text-text-muted mb-4">
                <span>Elapsed: {formatMinutesDisplay(Math.floor(elapsed / 60000))}</span>
                <span>
                  {isOvertime 
                    ? `Over by ${formatMinutesDisplay(Math.floor(Math.abs(remaining) / 60000))}`
                    : `${formatMinutesDisplay(Math.floor(remaining / 60000))} left`
                  }
                </span>
              </div>
              
              {/* Controls */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1 gap-2"
                  onClick={handlePauseResume}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Resume
                    </>
                  )}
                </Button>
                
                <Button
                  variant="primary"
                  className="flex-1 gap-2 bg-status-error hover:bg-status-error/80"
                  onClick={handleStop}
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// N-0009 · Centered tracking clock in timeline card header (desktop)
// ============================================================================

interface TimelineCardTrackingHeaderProps {
  taskId: string;
}

const SETTINGS_KEY = "blocks-settings";

function loadTimelineTimerDisplayMode(): "elapsed" | "remaining" {
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

export function TimelineCardTrackingHeader({ taskId }: TimelineCardTrackingHeaderProps) {
  const [displayMode, setDisplayMode] = useState(loadTimelineTimerDisplayMode);
  const {
    activeTaskId,
    isRunning,
    isPaused,
    getElapsedTime,
    getRemainingTime,
  } = useTimerStore();

  const [elapsed, setElapsed] = useState(0);

  const isActive = activeTaskId === taskId;

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
    if (!isActive || (!isRunning && !isPaused)) return;

    const tick = () => setElapsed(getElapsedTime());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActive, isRunning, isPaused, getElapsedTime]);

  if (!isActive) return null;

  const remaining = getRemainingTime();
  const isOvertime = remaining < 0;
  const showRemaining = displayMode === "remaining";
  const displayMs = showRemaining ? Math.max(0, remaining) : elapsed;

  return (
    <div
      className="flex w-full items-center justify-center gap-1.5 text-white"
      data-testid="timeline-card-tracking"
    >
      <Clock
        className={cn(
          "h-3.5 w-3.5 shrink-0 opacity-90",
          isRunning && "animate-pulse text-accent-green",
        )}
      />
      <span
        className={cn(
          "font-mono text-sm font-semibold tabular-nums",
          showRemaining && isOvertime && "text-status-warning",
        )}
        data-testid="timeline-card-tracking-clock"
      >
        {showRemaining && isOvertime
          ? `+${formatTimerDisplay(Math.abs(remaining))}`
          : formatTimerDisplay(displayMs)}
      </span>
      <span className="text-[10px] uppercase tracking-wide opacity-70">
        {showRemaining ? "left" : isRunning ? "elapsed" : "paused"}
      </span>
    </div>
  );
}

/** @deprecated Use TimelineCardTrackingHeader */
export const TimelineCardTrackingFooter = TimelineCardTrackingHeader;

// ============================================================================
// Timer Button for Timeline/Kanban cards
// ============================================================================

interface TimerButtonProps {
  task: {
    id: string;
    name: string;
    duration?: number;
    timeSpent?: number;
  };
  size?: "sm" | "md";
  className?: string;
}

export function TimerButton({ task, size = "sm", className }: TimerButtonProps) {
  const { activeTaskId, isRunning, isPaused, startTimer, pauseTimer, resumeTimer, stopTimer, beginTimelinePauseSync } = useTimerStore();
  const updateTask = useTaskStore((state) => state.updateTask);
  const tasks = useTaskStore((state) => state.tasks);
  
  const isActive = activeTaskId === task.id;
  const isThisRunning = isActive && isRunning;
  const isThisPaused = isActive && isPaused;
  
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isThisRunning) {
      pauseTimer();
      beginTimelinePauseSync(task.id, tasks);
    } else if (isThisPaused) {
      resumeTimer();
    } else if (isActive) {
      // Already active but not running/paused - shouldn't happen
      resumeTimer();
    } else {
      // Start new timer - first stop any existing
      const result = stopTimer();
      if (result) {
        // Save time from previous task
        await updateTask(result.taskId, {
          timeSpent: result.timeSpent,
        });
      }
      // Start timer for this task
      startTimer(task as Parameters<typeof startTimer>[0]);
    }
  };
  
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const buttonSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <button
      type="button"
      data-testid="timeline-timer-button"
      onClick={handleClick}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md transition-all",
        buttonSize,
        isThisRunning
          ? "bg-accent-green text-white hover:bg-accent-green/80 animate-pulse"
          : isThisPaused
            ? "bg-accent-cyan text-white hover:bg-accent-cyan/80"
            : "bg-black/30 text-white hover:bg-black/50",
        className
      )}
      title={isThisRunning ? "Pause timer" : isThisPaused ? "Resume timer" : "Start timer"}
    >
      {isThisRunning ? (
        <Pause className={iconSize} />
      ) : (
        <Play className={cn(iconSize, "ml-0.5")} />
      )}
    </button>
  );
}


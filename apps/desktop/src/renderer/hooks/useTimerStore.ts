// ============================================================================
// BLOCKS - Timer Store (Zustand)
// Manages active time tracking for tasks
// Persists timer state to localStorage to survive refreshes
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task } from "@blocks/core";

// ============================================================================
// Types
// ============================================================================

interface TimerState {
  // Current timer state
  activeTaskId: string | null;
  startedAt: number | null; // Unix timestamp
  pausedAt: number | null; // Unix timestamp when paused
  accumulatedTime: number; // Milliseconds accumulated before current session
  
  // Timer settings
  isRunning: boolean;
  isPaused: boolean;
  
  // Overtime tracking
  estimatedDuration: number; // Minutes (from task)
  isOvertime: boolean;
  overtimeNotified: boolean;
  
  // Actions
  startTimer: (task: Task) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => { taskId: string; timeSpent: number } | null;
  resetTimer: () => void;
  
  // Computed
  getElapsedTime: () => number; // Returns milliseconds
  getElapsedMinutes: () => number;
  getRemainingTime: () => number; // Returns milliseconds (negative if overtime)
  getProgress: () => number; // 0-100+
}

// ============================================================================
// Constants
// ============================================================================

const TIMER_STORAGE_KEY = "blocks-timer";

// ============================================================================
// Store
// ============================================================================

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeTaskId: null,
      startedAt: null,
      pausedAt: null,
      accumulatedTime: 0,
      isRunning: false,
      isPaused: false,
      estimatedDuration: 0,
      isOvertime: false,
      overtimeNotified: false,
      
      // Start timer for a task
      startTimer: (task: Task) => {
        const duration = task.duration || 30; // Default 30 minutes
        
        set({
          activeTaskId: task.id,
          startedAt: Date.now(),
          pausedAt: null,
          accumulatedTime: task.timeSpent ? task.timeSpent * 60 * 1000 : 0, // Convert minutes to ms
          isRunning: true,
          isPaused: false,
          estimatedDuration: duration,
          isOvertime: false,
          overtimeNotified: false,
        });
      },
      
      // Pause the timer
      pauseTimer: () => {
        const { isRunning, startedAt, accumulatedTime } = get();
        if (!isRunning || !startedAt) return;
        
        const now = Date.now();
        const sessionTime = now - startedAt;
        
        set({
          pausedAt: now,
          accumulatedTime: accumulatedTime + sessionTime,
          isRunning: false,
          isPaused: true,
        });
      },
      
      // Resume the timer
      resumeTimer: () => {
        const { isPaused } = get();
        if (!isPaused) return;
        
        set({
          startedAt: Date.now(),
          pausedAt: null,
          isRunning: true,
          isPaused: false,
        });
      },
      
      // Stop the timer and return time spent
      stopTimer: () => {
        const { activeTaskId, startedAt, accumulatedTime, isRunning } = get();
        if (!activeTaskId) return null;
        
        let totalTime = accumulatedTime;
        if (isRunning && startedAt) {
          totalTime += Date.now() - startedAt;
        }
        
        const result = {
          taskId: activeTaskId,
          timeSpent: Math.round(totalTime / 60000), // Convert to minutes
        };
        
        // Reset state
        set({
          activeTaskId: null,
          startedAt: null,
          pausedAt: null,
          accumulatedTime: 0,
          isRunning: false,
          isPaused: false,
          estimatedDuration: 0,
          isOvertime: false,
          overtimeNotified: false,
        });
        
        return result;
      },
      
      // Reset without returning time
      resetTimer: () => {
        set({
          activeTaskId: null,
          startedAt: null,
          pausedAt: null,
          accumulatedTime: 0,
          isRunning: false,
          isPaused: false,
          estimatedDuration: 0,
          isOvertime: false,
          overtimeNotified: false,
        });
      },
      
      // Get elapsed time in milliseconds
      getElapsedTime: () => {
        const { startedAt, accumulatedTime, isRunning } = get();
        
        if (!isRunning || !startedAt) {
          return accumulatedTime;
        }
        
        return accumulatedTime + (Date.now() - startedAt);
      },
      
      // Get elapsed time in minutes
      getElapsedMinutes: () => {
        return Math.floor(get().getElapsedTime() / 60000);
      },
      
      // Get remaining time in milliseconds (negative if overtime)
      getRemainingTime: () => {
        const { estimatedDuration } = get();
        const elapsed = get().getElapsedTime();
        const estimated = estimatedDuration * 60 * 1000; // Convert to ms
        
        return estimated - elapsed;
      },
      
      // Get progress percentage (can exceed 100)
      getProgress: () => {
        const { estimatedDuration } = get();
        if (estimatedDuration === 0) return 0;
        
        const elapsed = get().getElapsedTime();
        const estimated = estimatedDuration * 60 * 1000;
        
        return Math.round((elapsed / estimated) * 100);
      },
    }),
    {
      name: TIMER_STORAGE_KEY,
      partialize: (state) => ({
        activeTaskId: state.activeTaskId,
        startedAt: state.startedAt,
        pausedAt: state.pausedAt,
        accumulatedTime: state.accumulatedTime,
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        estimatedDuration: state.estimatedDuration,
        isOvertime: state.isOvertime,
        overtimeNotified: state.overtimeNotified,
      }),
    }
  )
);

// ============================================================================
// Helper hook for formatted time display
// ============================================================================

export function formatTimerDisplay(milliseconds: number): string {
  const totalSeconds = Math.floor(Math.abs(milliseconds) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const sign = milliseconds < 0 ? "-" : "";
  
  if (hours > 0) {
    return `${sign}${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  
  return `${sign}${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatMinutesDisplay(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${minutes}m`;
}


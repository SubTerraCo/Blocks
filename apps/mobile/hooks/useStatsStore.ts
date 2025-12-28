// ============================================================================
// BLOCKS Mobile - Stats Store Hook
// Zustand store for user statistics and analytics
// ============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================================
// Types
// ============================================================================

interface DailyStats {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  timeTracked: number; // minutes
  productiveTime: number; // minutes
  putzingTime: number; // minutes
}

interface StatsState {
  // Lifetime stats
  tasksCompletedTotal: number;
  totalTimeTracked: number; // minutes
  productiveTime: number; // minutes
  putzingTime: number; // minutes
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  
  // Daily history (last 30 days)
  dailyHistory: DailyStats[];
  
  // Actions
  recordTaskCompletion: (duration: number, isPutzing: boolean) => void;
  recordTimeTracked: (minutes: number, isPutzing: boolean) => void;
  getTodayStats: () => DailyStats;
  getWeekStats: () => DailyStats[];
  getMonthStats: () => DailyStats[];
  resetStats: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

const getDateKey = (date: Date = new Date()): string => {
  return date.toISOString().split("T")[0];
};

const getDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// ============================================================================
// Store
// ============================================================================

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasksCompletedTotal: 0,
      totalTimeTracked: 0,
      productiveTime: 0,
      putzingTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      dailyHistory: [],
      
      // Actions
      recordTaskCompletion: (duration, isPutzing) => {
        const today = getDateKey();
        
        set((state) => {
          // Update streak
          let newStreak = state.currentStreak;
          let newLongestStreak = state.longestStreak;
          
          if (state.lastActiveDate !== today) {
            const yesterday = getDateKey(getDaysAgo(1));
            if (state.lastActiveDate === yesterday) {
              newStreak = state.currentStreak + 1;
            } else if (state.lastActiveDate !== today) {
              newStreak = 1;
            }
            newLongestStreak = Math.max(newLongestStreak, newStreak);
          }
          
          // Update daily history
          const existingDayIndex = state.dailyHistory.findIndex(
            (d) => d.date === today
          );
          
          let newDailyHistory = [...state.dailyHistory];
          
          if (existingDayIndex >= 0) {
            newDailyHistory[existingDayIndex] = {
              ...newDailyHistory[existingDayIndex],
              tasksCompleted: newDailyHistory[existingDayIndex].tasksCompleted + 1,
              timeTracked: newDailyHistory[existingDayIndex].timeTracked + duration,
              productiveTime: isPutzing
                ? newDailyHistory[existingDayIndex].productiveTime
                : newDailyHistory[existingDayIndex].productiveTime + duration,
              putzingTime: isPutzing
                ? newDailyHistory[existingDayIndex].putzingTime + duration
                : newDailyHistory[existingDayIndex].putzingTime,
            };
          } else {
            newDailyHistory.push({
              date: today,
              tasksCompleted: 1,
              timeTracked: duration,
              productiveTime: isPutzing ? 0 : duration,
              putzingTime: isPutzing ? duration : 0,
            });
          }
          
          // Keep only last 30 days
          const thirtyDaysAgo = getDateKey(getDaysAgo(30));
          newDailyHistory = newDailyHistory.filter((d) => d.date >= thirtyDaysAgo);
          
          return {
            tasksCompletedTotal: state.tasksCompletedTotal + 1,
            totalTimeTracked: state.totalTimeTracked + duration,
            productiveTime: isPutzing
              ? state.productiveTime
              : state.productiveTime + duration,
            putzingTime: isPutzing
              ? state.putzingTime + duration
              : state.putzingTime,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastActiveDate: today,
            dailyHistory: newDailyHistory,
          };
        });
      },
      
      recordTimeTracked: (minutes, isPutzing) => {
        set((state) => ({
          totalTimeTracked: state.totalTimeTracked + minutes,
          productiveTime: isPutzing
            ? state.productiveTime
            : state.productiveTime + minutes,
          putzingTime: isPutzing
            ? state.putzingTime + minutes
            : state.putzingTime,
        }));
      },
      
      getTodayStats: () => {
        const today = getDateKey();
        const found = get().dailyHistory.find((d) => d.date === today);
        return (
          found || {
            date: today,
            tasksCompleted: 0,
            timeTracked: 0,
            productiveTime: 0,
            putzingTime: 0,
          }
        );
      },
      
      getWeekStats: () => {
        const weekAgo = getDateKey(getDaysAgo(7));
        return get().dailyHistory.filter((d) => d.date >= weekAgo);
      },
      
      getMonthStats: () => {
        return get().dailyHistory;
      },
      
      resetStats: () =>
        set({
          tasksCompletedTotal: 0,
          totalTimeTracked: 0,
          productiveTime: 0,
          putzingTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          dailyHistory: [],
        }),
    }),
    {
      name: "blocks-stats",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


// ============================================================================
// BLOCKS Mobile - Settings Store Hook
// Zustand store for app settings and preferences
// ============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================================
// Types
// ============================================================================

export type ThemeMode = "dark" | "light" | "system";
export type AIProvider = "gemini" | "openai" | "offline";

interface WorkSchedule {
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  workDays: number[]; // 0-6 (Sunday = 0)
}

interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  timerAlerts: boolean;
  dailySummary: boolean;
  summaryTime: string; // "20:00"
}

interface AISettings {
  enabled: boolean;
  provider: AIProvider;
  apiKey: string;
}

interface SettingsState {
  // Appearance
  theme: ThemeMode;
  
  // Work schedule
  workSchedule: WorkSchedule;
  
  // Notifications
  notifications: NotificationSettings;
  
  // AI
  ai: AISettings;
  
  // Sync
  lastSyncDate: Date | null;
  syncEnabled: boolean;
  
  // Actions
  setTheme: (theme: ThemeMode) => void;
  setWorkSchedule: (schedule: Partial<WorkSchedule>) => void;
  setNotifications: (settings: Partial<NotificationSettings>) => void;
  setAISettings: (settings: Partial<AISettings>) => void;
  setSyncEnabled: (enabled: boolean) => void;
  updateLastSync: () => void;
  resetSettings: () => void;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_WORK_SCHEDULE: WorkSchedule = {
  startTime: "09:00",
  endTime: "17:00",
  workDays: [1, 2, 3, 4, 5], // Monday - Friday
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: true,
  taskReminders: true,
  timerAlerts: true,
  dailySummary: false,
  summaryTime: "20:00",
};

const DEFAULT_AI_SETTINGS: AISettings = {
  enabled: true,
  provider: "gemini",
  apiKey: "",
};

// ============================================================================
// Store
// ============================================================================

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      theme: "system",
      workSchedule: DEFAULT_WORK_SCHEDULE,
      notifications: DEFAULT_NOTIFICATIONS,
      ai: DEFAULT_AI_SETTINGS,
      lastSyncDate: null,
      syncEnabled: false,
      
      // Actions
      setTheme: (theme) => set({ theme }),
      
      setWorkSchedule: (schedule) =>
        set((state) => ({
          workSchedule: { ...state.workSchedule, ...schedule },
        })),
      
      setNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
      
      setAISettings: (settings) =>
        set((state) => ({
          ai: { ...state.ai, ...settings },
        })),
      
      setSyncEnabled: (enabled) => set({ syncEnabled: enabled }),
      
      updateLastSync: () => set({ lastSyncDate: new Date() }),
      
      resetSettings: () =>
        set({
          theme: "system",
          workSchedule: DEFAULT_WORK_SCHEDULE,
          notifications: DEFAULT_NOTIFICATIONS,
          ai: DEFAULT_AI_SETTINGS,
          syncEnabled: false,
        }),
    }),
    {
      name: "blocks-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


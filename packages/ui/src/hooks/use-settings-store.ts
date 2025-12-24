// ============================================================================
// BLOCKS - Settings Store Hook (Zustand)
// ============================================================================

import { create } from "zustand";
import type { Settings, Theme, AIProvider } from "@blocks/core";
import { DexieStorage, SettingsSchema } from "@blocks/core";

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setAIProvider: (provider: AIProvider) => Promise<void>;
  setAIApiKey: (key: string) => Promise<void>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  let storage: DexieStorage | null = null;

  const getStorage = async () => {
    if (!storage) {
      storage = DexieStorage.getInstance();
      await storage.init();
    }
    return storage;
  };

  const defaultSettings = SettingsSchema.parse({});

  return {
    settings: defaultSettings,
    isLoading: false,
    error: null,

    loadSettings: async () => {
      set({ isLoading: true, error: null });
      try {
        const db = await getStorage();
        const settings = await db.getSettings();
        set({ settings, isLoading: false });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    updateSettings: async (updates: Partial<Settings>) => {
      try {
        const db = await getStorage();
        const updated = await db.updateSettings(updates);
        set({ settings: updated });
      } catch (error) {
        set({ error: (error as Error).message });
        throw error;
      }
    },

    setTheme: async (theme: Theme) => {
      await get().updateSettings({ theme });
    },

    setAIProvider: async (provider: AIProvider) => {
      await get().updateSettings({ aiProvider: provider });
    },

    setAIApiKey: async (key: string) => {
      await get().updateSettings({ aiApiKey: key });
    },

    toggleNotifications: async (enabled: boolean) => {
      await get().updateSettings({ notificationsEnabled: enabled });
    },

    resetSettings: async () => {
      const db = await getStorage();
      const defaultSettings = SettingsSchema.parse({});
      await db.updateSettings(defaultSettings);
      set({ settings: defaultSettings });
    },
  };
});


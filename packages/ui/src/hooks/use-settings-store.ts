// ============================================================================
// BLOCKS - Settings Store Hook (Zustand)
// ============================================================================

import { create } from "zustand";
import type { Settings, Theme, AIProvider } from "@blocks/core";
import { DexieStorage, SettingsSchema } from "@blocks/core";

const LEGACY_SETTINGS_KEY = "blocks-settings";

/** Desktop / TimelinePage read timeline prefs from localStorage */
function mirrorLegacySettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      LEGACY_SETTINGS_KEY,
      JSON.stringify({
        theme: settings.theme,
        weekStartsOn: settings.weekStartsOn,
        workDays: settings.workDays,
        timelineSnapDelaySec: settings.timelineSnapDelaySec,
        timelineNowBarViewportRatio: settings.timelineNowBarViewportRatio,
        use24HourTime: settings.use24HourTime,
        timelineTimerDisplayMode: settings.timelineTimerDisplayMode,
        calendarWeekLookback: settings.calendarWeekLookback,
        accentPrimary: settings.accentPrimary,
        accentSecondary: settings.accentSecondary,
      }),
    );
    window.dispatchEvent(new Event("blocks-settings-changed"));
  } catch {
    // ignore quota / private mode
  }
}

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  isHydrated: boolean;
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

function buildSettingsStore() {
  let settingsChain: Promise<void> = Promise.resolve();

  const enqueueSettings = <T>(fn: () => Promise<T>): Promise<T> => {
    const next = settingsChain.then(fn, fn);
    settingsChain = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  };

  return create<SettingsState>((set, get) => {
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
    isHydrated: false,
    error: null,

    loadSettings: async () => {
      return enqueueSettings(async () => {
        set({ isLoading: true, error: null });
        try {
          const db = await getStorage();
          const settings = await db.getSettings();
          set({ settings, isLoading: false, isHydrated: true });
          mirrorLegacySettings(settings);
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      });
    },

    updateSettings: async (updates: Partial<Settings>) => {
      return enqueueSettings(async () => {
        const previous = get().settings;
        const optimistic = { ...previous, ...updates };
        set({ settings: optimistic, error: null, isHydrated: true });
        mirrorLegacySettings(optimistic);
        try {
          const db = await getStorage();
          const updated = await db.updateSettings(updates);
          set({ settings: updated });
          mirrorLegacySettings(updated);
        } catch (error) {
          set({ settings: previous, error: (error as Error).message });
          mirrorLegacySettings(previous);
          throw error;
        }
      });
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
      return enqueueSettings(async () => {
        const db = await getStorage();
        const defaultSettings = SettingsSchema.parse({});
        await db.updateSettings(defaultSettings);
        set({ settings: defaultSettings, isHydrated: true });
        mirrorLegacySettings(defaultSettings);
      });
    },
  };
  });
}

const SETTINGS_STORE_KEY = "__blocksSettingsStore__";

type SettingsStore = ReturnType<typeof buildSettingsStore>;

function getSettingsStore(): SettingsStore {
  const g = globalThis as typeof globalThis & {
    [SETTINGS_STORE_KEY]?: SettingsStore;
  };
  if (!g[SETTINGS_STORE_KEY]) {
    g[SETTINGS_STORE_KEY] = buildSettingsStore();
  }
  return g[SETTINGS_STORE_KEY];
}

export const useSettingsStore = getSettingsStore();


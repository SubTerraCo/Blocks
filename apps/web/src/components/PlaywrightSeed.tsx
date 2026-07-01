"use client";

import {
  DexieStorage,
  DexieYjsBridge,
  mergeGoogleProviderIntoUser,
  tokensToGoogleProvider,
} from "@blocks/core";
import { useSettingsStore } from "@blocks/ui";

declare global {
  interface Window {
    blocksPlaywright?: {
      getDb: () => ReturnType<typeof DexieStorage.getInstance>;
      getSettings: () => ReturnType<typeof useSettingsStore.getState>["settings"];
      updateSettings: ReturnType<typeof useSettingsStore.getState>["updateSettings"];
      isSettingsHydrated: () => boolean;
      mergeGoogleProviderIntoUser: typeof mergeGoogleProviderIntoUser;
      tokensToGoogleProvider: typeof tokensToGoogleProvider;
      DexieYjsBridge: typeof DexieYjsBridge;
    };
  }
}

if (
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
) {
  window.blocksPlaywright = {
    getDb: () => DexieStorage.getInstance(),
    getSettings: () => useSettingsStore.getState().settings,
    updateSettings: (updates) => useSettingsStore.getState().updateSettings(updates),
    isSettingsHydrated: () => useSettingsStore.getState().isHydrated,
    mergeGoogleProviderIntoUser,
    tokensToGoogleProvider,
    DexieYjsBridge,
  };
}

export function PlaywrightSeed() {
  return null;
}

"use client";

import { useEffect } from "react";
import { useSettingsStore } from "../hooks/use-settings-store";
import {
  applyThemePreference,
  subscribeSystemTheme,
} from "../lib/theme";

/** Applies settings.theme to the document on web (Dexie-backed settings) */
export function ThemeSync() {
  const theme = useSettingsStore((state) => state.settings.theme);

  useEffect(() => {
    applyThemePreference(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    return subscribeSystemTheme(() => {
      applyThemePreference("system");
    });
  }, [theme]);

  return null;
}

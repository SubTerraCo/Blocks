// ============================================================================
// BLOCKS - Theme Hook (SH.UI.08.001)
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import {
  type Theme,
  type ResolvedTheme,
  loadStoredTheme,
  saveStoredTheme,
  applyThemePreference,
  resolveTheme,
  subscribeSystemTheme,
} from "../lib/theme";

export type { Theme, ResolvedTheme };

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => loadStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(loadStoredTheme())
  );

  useEffect(() => {
    setResolvedTheme(applyThemePreference(theme));
  }, [theme]);

  useEffect(() => {
    return subscribeSystemTheme((next) => {
      if (theme === "system") {
        applyThemePreference("system");
        setResolvedTheme(next);
      }
    });
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    saveStoredTheme(newTheme);
    const resolved = applyThemePreference(newTheme);
    setResolvedTheme(resolved);
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
    isSystem: theme === "system",
  };
}

/** Sync theme from settings store (web) or external preference source */
export function useThemePreference(theme: Theme | undefined) {
  useEffect(() => {
    if (theme) applyThemePreference(theme);
  }, [theme]);
}

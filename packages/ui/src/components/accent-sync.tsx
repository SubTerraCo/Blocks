"use client";

import { useEffect } from "react";
import { useSettingsStore } from "../hooks/use-settings-store";
import {
  applyAccentColorsToDocument,
  DEFAULT_ACCENT_PRIMARY,
  DEFAULT_ACCENT_SECONDARY,
  normalizeHexColor,
  readAccentColorsFromStorage,
} from "../lib/accent-colors";

/** Applies accent CSS variables from Dexie + DT localStorage. */
export function AccentSync() {
  const dexiePrimary = useSettingsStore((s) => s.settings.accentPrimary);
  const dexieSecondary = useSettingsStore((s) => s.settings.accentSecondary);

  useEffect(() => {
    const apply = () => {
      const local = readAccentColorsFromStorage();
      applyAccentColorsToDocument({
        accentPrimary: normalizeHexColor(dexiePrimary, local.accentPrimary || DEFAULT_ACCENT_PRIMARY),
        accentSecondary: normalizeHexColor(
          dexieSecondary,
          local.accentSecondary || DEFAULT_ACCENT_SECONDARY,
        ),
      });
    };
    apply();
    window.addEventListener("blocks-settings-changed", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("blocks-settings-changed", apply);
      window.removeEventListener("storage", apply);
    };
  }, [dexiePrimary, dexieSecondary]);

  return null;
}

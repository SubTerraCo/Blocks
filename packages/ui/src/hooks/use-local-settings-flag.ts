"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "./use-settings-store";

const SETTINGS_KEY = "blocks-settings";

function readLocalFlag(key: string): boolean | undefined {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return typeof parsed[key] === "boolean" ? (parsed[key] as boolean) : undefined;
  } catch {
    return undefined;
  }
}

/** DT localStorage + WB Dexie — reactive boolean setting (e.g. use24HourTime). */
export function useLocalSettingsFlag(
  key: "use24HourTime",
  dexieFallback = false,
): boolean {
  const dexieValue = useSettingsStore((s) => {
    const settings = s.settings as Record<string, unknown>;
    return settings[key] === true;
  });

  const [localValue, setLocalValue] = useState<boolean | undefined>(() => readLocalFlag(key));

  useEffect(() => {
    const refresh = () => setLocalValue(readLocalFlag(key));
    window.addEventListener("blocks-settings-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("blocks-settings-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [key]);

  if (localValue !== undefined) return localValue;
  return dexieValue ?? dexieFallback;
}

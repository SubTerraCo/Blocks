export const DEFAULT_ACCENT_PRIMARY = "#9b4dca";
export const DEFAULT_ACCENT_SECONDARY = "#00bcd4";

const SETTINGS_KEY = "blocks-settings";

export interface AccentColorSettings {
  accentPrimary: string;
  accentSecondary: string;
}

export function normalizeHexColor(value: string | undefined, fallback: string): string {
  if (!value || !/^#[0-9A-Fa-f]{6}$/.test(value)) return fallback;
  return value.toLowerCase();
}

export function readAccentColorsFromStorage(): AccentColorSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return { accentPrimary: DEFAULT_ACCENT_PRIMARY, accentSecondary: DEFAULT_ACCENT_SECONDARY };
    }
    const parsed = JSON.parse(raw) as Partial<AccentColorSettings>;
    return {
      accentPrimary: normalizeHexColor(parsed.accentPrimary, DEFAULT_ACCENT_PRIMARY),
      accentSecondary: normalizeHexColor(parsed.accentSecondary, DEFAULT_ACCENT_SECONDARY),
    };
  } catch {
    return { accentPrimary: DEFAULT_ACCENT_PRIMARY, accentSecondary: DEFAULT_ACCENT_SECONDARY };
  }
}

export function applyAccentColorsToDocument(colors: AccentColorSettings): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--accent-primary", colors.accentPrimary);
  root.style.setProperty("--accent-secondary", colors.accentSecondary);
  root.style.setProperty("--accent-magenta", colors.accentPrimary);
  root.style.setProperty("--accent-teal", colors.accentSecondary);
}

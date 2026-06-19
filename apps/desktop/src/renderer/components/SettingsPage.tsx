// ============================================================================
// BLOCKS - Settings Page
// Settings per FEATURE_REGISTRY DT.UI.06.* · spec ROADMAP.md
// ============================================================================

import { useState, useEffect } from "react";
import {
  Button,
  cn,
  WorkScheduleFields,
  TimelineSnapDelayField,
  TimelineNowBarOffsetField,
  HourFormat24Field,
  AccentColorFields,
  TaskScheduleBehaviorField,
  CalendarWeekLookbackField,
  SlideToggle,
  applyAccentColorsToDocument,
  DEFAULT_ACCENT_PRIMARY,
  DEFAULT_ACCENT_SECONDARY,
  normalizeHexColor,
  useSettingsStore,
} from "@blocks/ui";
import type { WeekStartsOn } from "@blocks/core";
import { WEEK_DAY_TO_NUMBER } from "@blocks/core";
import { 
  Moon, 
  Sun, 
  Monitor,
  Clock,
  Bell,
  Bot,
  Download,
  RefreshCw,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme, type Theme } from "../hooks/useTheme";
import { useNotifications } from "../hooks/useNotifications";

// ============================================================================
// Types
// ============================================================================

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface SettingsData {
  // Appearance
  theme: Theme;
  accentPrimary: string;
  accentSecondary: string;
  
  // Work Schedule
  workStartTime: string;
  workEndTime: string;
  workDays: number[];
  weekStartsOn: WeekStartsOn;
  timelineSnapDelaySec: number;
  timelineNowBarViewportRatio: number;
  timelineTimerDisplayMode: "elapsed" | "remaining";
  calendarWeekLookback: 1 | 2 | 3;
  use24HourTime: boolean;

  // Notifications
  notificationsEnabled: boolean;
  taskReminders: boolean;
  timerAlerts: boolean;
  dailySummary: boolean;
  dailySummaryTime: string;
  
  // AI Assistant
  aiEnabled: boolean;
  aiProvider: "gemini" | "openai" | "anthropic";
  aiApiKey: string;
  
  // Data
  lastSyncTime?: Date;
}

const DEFAULT_SETTINGS: SettingsData = {
  theme: "dark",
  accentPrimary: DEFAULT_ACCENT_PRIMARY,
  accentSecondary: DEFAULT_ACCENT_SECONDARY,
  workStartTime: "09:00",
  workEndTime: "17:00",
  workDays: [1, 2, 3, 4, 5],
  weekStartsOn: "monday",
  timelineSnapDelaySec: 15,
  timelineNowBarViewportRatio: 0.5,
  timelineTimerDisplayMode: "elapsed",
  calendarWeekLookback: 1,
  use24HourTime: false,
  notificationsEnabled: true,
  taskReminders: true,
  timerAlerts: true,
  dailySummary: false,
  dailySummaryTime: "20:00",
  aiEnabled: true,
  aiProvider: "gemini",
  aiApiKey: "",
};

const AI_PROVIDERS = [
  { value: "gemini", label: "Google Gemini" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic Claude" },
];

// ============================================================================
// Local Storage helpers
// ============================================================================

const SETTINGS_KEY = "blocks-settings";

function normalizeSettings(raw: Partial<SettingsData> & { workDays?: unknown }): SettingsData {
  const merged = { ...DEFAULT_SETTINGS, ...raw };
  if (Array.isArray(raw.workDays) && raw.workDays.length > 0) {
    if (typeof raw.workDays[0] === "string") {
      merged.workDays = (raw.workDays as unknown as DayOfWeek[]).map((d) => WEEK_DAY_TO_NUMBER[d]);
    }
  }
  if (merged.weekStartsOn !== "monday" && merged.weekStartsOn !== "sunday") {
    merged.weekStartsOn = "monday";
  }
  if (
    typeof merged.timelineSnapDelaySec !== "number" ||
    merged.timelineSnapDelaySec < 0 ||
    merged.timelineSnapDelaySec > 120
  ) {
    merged.timelineSnapDelaySec = 15;
  }
  if (merged.timelineTimerDisplayMode !== "elapsed" && merged.timelineTimerDisplayMode !== "remaining") {
    merged.timelineTimerDisplayMode = "remaining";
  }
  merged.accentPrimary = normalizeHexColor(merged.accentPrimary, DEFAULT_ACCENT_PRIMARY);
  merged.accentSecondary = normalizeHexColor(merged.accentSecondary, DEFAULT_ACCENT_SECONDARY);
  if (
    typeof merged.timelineNowBarViewportRatio !== "number" ||
    merged.timelineNowBarViewportRatio < 0.25 ||
    merged.timelineNowBarViewportRatio > 0.75
  ) {
    merged.timelineNowBarViewportRatio = 0.5;
  }
  if (merged.calendarWeekLookback !== 1 && merged.calendarWeekLookback !== 2 && merged.calendarWeekLookback !== 3) {
    merged.calendarWeekLookback = 1;
  }
  return merged;
}

function loadSettings(): SettingsData {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return normalizeSettings(JSON.parse(stored));
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: SettingsData): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyAccentColorsToDocument({
      accentPrimary: settings.accentPrimary,
      accentSecondary: settings.accentSecondary,
    });
    window.dispatchEvent(new Event("blocks-settings-changed"));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}

// ============================================================================
// Components
// ============================================================================

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ enabled, onChange, disabled }: ToggleSwitchProps) {
  return <SlideToggle checked={enabled} onChange={onChange} disabled={disabled} />;
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingsSection({ title, icon, children }: SettingsSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent-magenta">{icon}</span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          {title}
        </h3>
      </div>
      <div className="rounded-xl bg-bg-secondary border border-border-default divide-y divide-border-default px-4">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(loadSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isExporting, setIsExporting] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const dexieSettings = useSettingsStore((s) => s.settings);
  const loadDexieSettings = useSettingsStore((s) => s.loadSettings);
  const updateDexieSettings = useSettingsStore((s) => s.updateSettings);
  
  // Theme hook
  const { theme: currentTheme, setTheme } = useTheme();
  
  // Notifications hook
  const { 
    permissionStatus, 
    isEnabled: notificationsEnabled,
    settings: notifSettings,
    requestPermission: requestNotificationPermission,
    updateSettings: updateNotificationSettings,
  } = useNotifications();
  
  // Get app version
  const [appVersion, setAppVersion] = useState("0.0.2");
  
  useEffect(() => {
    window.electronAPI?.getVersion?.().then((v: string) => {
      if (v) setAppVersion(v);
    });
  }, []);

  useEffect(() => {
    void loadDexieSettings();
  }, [loadDexieSettings]);
  
  const updateSetting = <K extends keyof SettingsData>(
    key: K, 
    value: SettingsData[K]
  ) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      saveSettings(updated);
      return updated;
    });
    
    // Show save indicator
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 300);
    setTimeout(() => setSaveStatus("idle"), 1500);
  };
  
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    updateSetting("theme", newTheme);
  };
  
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      // For now, just export settings
      const data = {
        settings,
        exportedAt: new Date().toISOString(),
        version: appVersion,
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blocks-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // For now, just show coming soon
      alert("CSV export coming soon!");
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    try {
      if (window.electronAPI?.forceCheckUpdates) {
        await window.electronAPI.forceCheckUpdates();
      } else {
        alert("Update check not available");
      }
    } catch (e) {
      console.error("Update check failed:", e);
    } finally {
      setIsCheckingUpdate(false);
    }
  };
  
  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Save indicator */}
        {saveStatus !== "idle" && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-accent-green/20 px-3 py-2 text-accent-green text-sm">
            {saveStatus === "saving" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {saveStatus === "saving" ? "Saving..." : "Saved"}
          </div>
        )}
        
        {/* Appearance */}
        <SettingsSection title="Appearance" icon={<Moon className="h-4 w-4" />}>
          <SettingRow label="Theme" description="Choose your preferred color scheme">
            <div className="flex gap-2">
              {(["dark", "light", "system"] as Theme[]).map((themeOption) => (
                <button
                  key={themeOption}
                  type="button"
                  data-testid={`theme-${themeOption}`}
                  onClick={() => handleThemeChange(themeOption)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm capitalize transition-colors",
                    currentTheme === themeOption
                      ? "bg-accent-magenta text-white"
                      : "bg-bg-tertiary text-text-secondary hover:bg-bg-primary"
                  )}
                >
                  {themeOption === "dark" && <Moon className="h-4 w-4" />}
                  {themeOption === "light" && <Sun className="h-4 w-4" />}
                  {themeOption === "system" && <Monitor className="h-4 w-4" />}
                  {themeOption}
                </button>
              ))}
            </div>
          </SettingRow>
          <div className="px-4 py-3">
            <AccentColorFields
              accentPrimary={settings.accentPrimary}
              accentSecondary={settings.accentSecondary}
              onAccentPrimaryChange={(accentPrimary) => updateSetting("accentPrimary", accentPrimary)}
              onAccentSecondaryChange={(accentSecondary) =>
                updateSetting("accentSecondary", accentSecondary)
              }
            />
          </div>
        </SettingsSection>
        
        {/* Work Schedule */}
        <SettingsSection title="Work Schedule" icon={<Clock className="h-4 w-4" />}>
          <SettingRow label="Work Start Time">
            <input
              type="time"
              value={settings.workStartTime}
              onChange={(e) => updateSetting("workStartTime", e.target.value)}
              className="rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-magenta focus:outline-none"
            />
          </SettingRow>
          
          <SettingRow label="Work End Time">
            <input
              type="time"
              value={settings.workEndTime}
              onChange={(e) => updateSetting("workEndTime", e.target.value)}
              className="rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-magenta focus:outline-none"
            />
          </SettingRow>

          <div className="py-3">
            <WorkScheduleFields
              workDays={settings.workDays}
              weekStartsOn={settings.weekStartsOn}
              onWorkDaysChange={(workDays) => updateSetting("workDays", workDays)}
              onWeekStartsOnChange={(weekStartsOn) => updateSetting("weekStartsOn", weekStartsOn)}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Timeline" icon={<Clock className="h-4 w-4" />}>
          <div className="px-4 py-3">
            <TimelineSnapDelayField
              value={settings.timelineSnapDelaySec}
              onChange={(timelineSnapDelaySec) =>
                updateSetting("timelineSnapDelaySec", timelineSnapDelaySec)
              }
            />
            <div className="mt-4">
              <TimelineNowBarOffsetField
                value={settings.timelineNowBarViewportRatio}
                onChange={(timelineNowBarViewportRatio) =>
                  updateSetting("timelineNowBarViewportRatio", timelineNowBarViewportRatio)
                }
              />
            </div>
            <div className="mt-4">
              <TaskScheduleBehaviorField
                value={dexieSettings.taskScheduleBehavior}
                onChange={(value) => void updateDexieSettings({ taskScheduleBehavior: value })}
              />
            </div>
            <div className="mt-4">
              <HourFormat24Field
                value={settings.use24HourTime ?? false}
                onChange={(use24HourTime) => updateSetting("use24HourTime", use24HourTime)}
              />
            </div>
            <div className="mt-4">
              <CalendarWeekLookbackField
                value={settings.calendarWeekLookback}
                onChange={(value) => updateSetting("calendarWeekLookback", value)}
              />
            </div>
          </div>
        </SettingsSection>
        
        {/* Notifications */}
        <SettingsSection title="Notifications" icon={<Bell className="h-4 w-4" />}>
          {/* Permission status */}
          {permissionStatus !== "granted" && (
            <SettingRow 
              label="Permission Required" 
              description={
                permissionStatus === "denied" 
                  ? "Notifications are blocked. Enable in system settings." 
                  : "Click to enable notifications"
              }
            >
              <Button 
                variant="secondary" 
                size="sm"
                onClick={requestNotificationPermission}
                disabled={permissionStatus === "denied"}
              >
                {permissionStatus === "denied" ? "Blocked" : "Enable"}
              </Button>
            </SettingRow>
          )}
          
          <SettingRow label="Enable Notifications" description="Allow Blocks to send notifications">
            <ToggleSwitch
              enabled={notifSettings.enabled}
              onChange={(v) => updateNotificationSettings({ enabled: v })}
              disabled={permissionStatus !== "granted"}
            />
          </SettingRow>
          
          <SettingRow label="Task Reminders" description="Remind you before scheduled tasks">
            <ToggleSwitch
              enabled={notifSettings.taskReminders}
              onChange={(v) => updateNotificationSettings({ taskReminders: v })}
              disabled={!notificationsEnabled}
            />
          </SettingRow>
          
          <SettingRow label="Timer Alerts" description="Alert when task time is up">
            <ToggleSwitch
              enabled={notifSettings.timerAlerts}
              onChange={(v) => updateNotificationSettings({ timerAlerts: v })}
              disabled={!notificationsEnabled}
            />
          </SettingRow>
          
          <SettingRow label="Daily Summary" description="End of day task summary">
            <ToggleSwitch
              enabled={notifSettings.dailySummary}
              onChange={(v) => updateNotificationSettings({ dailySummary: v })}
              disabled={!notificationsEnabled}
            />
          </SettingRow>
          
          {notifSettings.dailySummary && notificationsEnabled && (
            <SettingRow label="Summary Time">
              <input
                type="time"
                value={notifSettings.dailySummaryTime}
                onChange={(e) => updateNotificationSettings({ dailySummaryTime: e.target.value })}
                className="rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-magenta focus:outline-none"
              />
            </SettingRow>
          )}
        </SettingsSection>
        
        {/* AI Assistant */}
        <SettingsSection title="AI Assistant" icon={<Bot className="h-4 w-4" />}>
          <SettingRow label="AI Enabled" description="Enable AI-powered task scheduling">
            <ToggleSwitch
              enabled={settings.aiEnabled}
              onChange={(v) => updateSetting("aiEnabled", v)}
            />
          </SettingRow>
          
          <SettingRow label="AI Provider">
            <select
              value={settings.aiProvider}
              onChange={(e) => updateSetting("aiProvider", e.target.value as SettingsData["aiProvider"])}
              disabled={!settings.aiEnabled}
              className="rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-magenta focus:outline-none disabled:opacity-50"
            >
              {AI_PROVIDERS.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </SettingRow>
          
          <SettingRow label="API Key" description="Your AI provider API key">
            <div className="flex items-center gap-2">
              <input
                type={showApiKey ? "text" : "password"}
                value={settings.aiApiKey}
                onChange={(e) => updateSetting("aiApiKey", e.target.value)}
                placeholder="Enter API key..."
                disabled={!settings.aiEnabled}
                className="w-48 rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-magenta focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="rounded-lg p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </SettingRow>
        </SettingsSection>
        
        {/* Data */}
        <SettingsSection title="Data" icon={<Download className="h-4 w-4" />}>
          <SettingRow label="Export Data (JSON)">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleExportJSON}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export JSON"}
            </Button>
          </SettingRow>
          
          <SettingRow label="Export Data (CSV)">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleExportCSV}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </SettingRow>
          
          <SettingRow 
            label="Last Sync" 
            description={settings.lastSyncTime ? new Date(settings.lastSyncTime).toLocaleString() : "Never"}
          >
            <span className="text-sm text-text-muted">Not synced</span>
          </SettingRow>
        </SettingsSection>
        
        {/* About */}
        <SettingsSection title="About" icon={<Monitor className="h-4 w-4" />}>
          <SettingRow label="Version">
            <span className="text-sm text-text-secondary">{appVersion}</span>
          </SettingRow>
          
          <SettingRow label="Check for Updates">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleCheckForUpdates}
              disabled={isCheckingUpdate}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isCheckingUpdate && "animate-spin")} />
              {isCheckingUpdate ? "Checking..." : "Check Now"}
            </Button>
          </SettingRow>
        </SettingsSection>
        
        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-8">
          Blocks © 2024 • Made with ♥
        </p>
      </div>
    </div>
  );
}


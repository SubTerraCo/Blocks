"use client";

import { useState } from "react";
import { useSettingsStore, Button, Input, Select, cn } from "@blocks/ui";
import type { Theme, AIProvider } from "@blocks/core";
import {
  Moon,
  Sun,
  Monitor,
  Bot,
  Bell,
  Calendar,
  Download,
  Trash2,
  Info,
  Key,
  ChevronRight,
} from "lucide-react";

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

const AI_PROVIDER_OPTIONS: { value: AIProvider; label: string }[] = [
  { value: "openai", label: "OpenAI (GPT-4)" },
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "ollama", label: "Ollama (Local)" },
];

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        {title}
      </h2>
      <div className="rounded-lg bg-bg-secondary">{children}</div>
    </div>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  description,
  children,
  onClick,
}: {
  icon: typeof Sun;
  label: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      className={cn(
        "flex w-full items-center justify-between border-b border-border-default px-4 py-3 last:border-b-0",
        onClick && "hover:bg-bg-tertiary"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-text-secondary" />
        <div className="text-left">
          <p className="text-sm font-medium text-text-primary">{label}</p>
          {description && (
            <p className="text-xs text-text-muted">{description}</p>
          )}
        </div>
      </div>
      {children ?? (onClick && <ChevronRight className="h-4 w-4 text-text-muted" />)}
    </Wrapper>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        checked ? "bg-accent-magenta" : "bg-border-default"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const handleThemeChange = async (theme: Theme) => {
    await updateSettings({ theme });
    // Apply theme to document
    document.documentElement.classList.remove("dark", "light");
    if (theme !== "system") {
      document.documentElement.classList.add(theme);
    }
  };

  const handleSaveApiKey = async () => {
    await updateSettings({ aiApiKey: apiKey });
    setShowApiKeyInput(false);
    setApiKey("");
  };

  const handleExportData = async () => {
    try {
      const { DexieStorage } = await import("@blocks/core");
      const storage = DexieStorage.getInstance();
      await storage.init();
      const data = await storage.exportData();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blocks-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to delete all data? This cannot be undone.")) {
      return;
    }
    try {
      const { DexieStorage } = await import("@blocks/core");
      const storage = DexieStorage.getInstance();
      await storage.init();
      await storage.clearAllData();
      await resetSettings();
      window.location.reload();
    } catch (error) {
      console.error("Clear data failed:", error);
    }
  };

  return (
    <div className="px-4 py-6 pb-24">
      {/* Theme */}
      <SettingsSection title="Appearance">
        <div className="p-4">
          <p className="mb-3 text-sm text-text-secondary">Theme</p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = settings.theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-lg p-3 transition-colors",
                    isActive
                      ? "bg-accent-magenta text-white"
                      : "bg-bg-tertiary text-text-secondary hover:bg-border-hover"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      {/* AI Configuration */}
      <SettingsSection title="AI Assistant">
        <SettingsItem
          icon={Bot}
          label="AI Provider"
          description={AI_PROVIDER_OPTIONS.find((o) => o.value === settings.aiProvider)?.label}
        >
          <Select
            options={AI_PROVIDER_OPTIONS}
            value={settings.aiProvider}
            onChange={(v) => updateSettings({ aiProvider: v as AIProvider })}
            className="w-40"
          />
        </SettingsItem>
        <SettingsItem
          icon={Key}
          label="API Key"
          description={settings.aiApiKey ? "••••••••" : "Not configured"}
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
        />
        {showApiKeyInput && (
          <div className="border-t border-border-default p-4">
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveApiKey} disabled={!apiKey}>
                Save
              </Button>
            </div>
          </div>
        )}
        <SettingsItem
          icon={Bot}
          label="AI Suggestions"
          description="Get AI-powered task recommendations"
        >
          <Toggle
            checked={settings.aiEnabled}
            onChange={(checked) => updateSettings({ aiEnabled: checked })}
          />
        </SettingsItem>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications">
        <SettingsItem
          icon={Bell}
          label="Enable Notifications"
          description="Get reminders and alerts"
        >
          <Toggle
            checked={settings.notificationsEnabled}
            onChange={(checked) => updateSettings({ notificationsEnabled: checked })}
          />
        </SettingsItem>
        <SettingsItem
          icon={Bell}
          label="Task Reminders"
          description="Remind before scheduled tasks"
        >
          <Toggle
            checked={settings.reminderNotifications}
            onChange={(checked) => updateSettings({ reminderNotifications: checked })}
          />
        </SettingsItem>
        <SettingsItem
          icon={Bot}
          label="Switch Suggestions"
          description="Suggest switching when overtime"
        >
          <Toggle
            checked={settings.taskSwitchSuggestions}
            onChange={(checked) => updateSettings({ taskSwitchSuggestions: checked })}
          />
        </SettingsItem>
      </SettingsSection>

      {/* Calendar */}
      <SettingsSection title="Calendar Sync">
        <SettingsItem
          icon={Calendar}
          label="Google Calendar"
          description={settings.googleCalendarEnabled ? "Connected" : "Not connected"}
        >
          <Toggle
            checked={settings.googleCalendarEnabled}
            onChange={(checked) => updateSettings({ googleCalendarEnabled: checked })}
          />
        </SettingsItem>
      </SettingsSection>

      {/* Data */}
      <SettingsSection title="Data">
        <SettingsItem
          icon={Download}
          label="Export Data"
          description="Download your data as JSON"
          onClick={handleExportData}
        />
        <SettingsItem
          icon={Trash2}
          label="Clear All Data"
          description="Delete all tasks and settings"
          onClick={handleClearData}
        />
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About">
        <SettingsItem
          icon={Info}
          label="Version"
          description="Blocks v0.1.0"
        />
      </SettingsSection>
    </div>
  );
}


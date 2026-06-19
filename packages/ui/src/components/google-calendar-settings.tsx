"use client";

import { useEffect, useState } from "react";
import { Calendar, Loader2, RefreshCw, Unlink } from "lucide-react";
import { Button } from "./button";
import { SlideToggle } from "./slide-toggle";
import { cn } from "../lib/utils";
import { useSettingsStore } from "../hooks/use-settings-store";
import { useGoogleCalendarAuth } from "../hooks/use-google-calendar-auth";
import { useCalendarSync } from "../hooks/use-calendar-sync";

export interface GoogleCalendarSettingsProps {
  className?: string;
  /** Return URL after OAuth (web: /settings, desktop: loopback) */
  oauthReturnUrl: string;
  onConnect?: () => void;
  connecting?: boolean;
  connectError?: string | null;
}

export function GoogleCalendarSettings({
  className,
  oauthReturnUrl,
  onConnect,
  connecting = false,
  connectError = null,
}: GoogleCalendarSettingsProps) {
  const { settings, updateSettings } = useSettingsStore();
  const {
    isConnected,
    isLoading,
    connectGoogle,
    disconnectGoogle,
    handleOAuthCallback,
  } = useGoogleCalendarAuth();
  const { calendars, isSyncing, syncNow, lastSyncAt } = useCalendarSync();
  const [pendingOAuth, setPendingOAuth] = useState(false);

  useEffect(() => {
    if (!window.location.hash.includes("access_token")) return;
    setPendingOAuth(true);
    void handleOAuthCallback().finally(() => setPendingOAuth(false));
  }, [handleOAuthCallback]);

  const handleConnect = () => {
    if (onConnect) {
      onConnect();
      return;
    }
    connectGoogle(oauthReturnUrl);
  };

  const toggleCalendar = async (calendarId: string) => {
    const selected = settings.selectedCalendars ?? [];
    const next = selected.includes(calendarId)
      ? selected.filter((id) => id !== calendarId)
      : [...selected, calendarId];
    await updateSettings({ selectedCalendars: next, googleCalendarEnabled: true });
  };

  return (
    <div className={cn("space-y-3", className)} data-testid="google-calendar-settings">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-text-secondary" />
          <div>
            <p className="text-sm font-medium text-text-primary">Google Calendar</p>
            <p className="text-xs text-text-muted">
              {isLoading || pendingOAuth || connecting
                ? "Connecting…"
                : isConnected
                  ? "Connected — events show on timeline"
                  : "Not connected"}
            </p>
          </div>
        </div>
        {isConnected ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="google-calendar-disconnect"
            onClick={() => void disconnectGoogle()}
          >
            <Unlink className="mr-1 h-4 w-4" />
            Disconnect
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            data-testid="google-calendar-connect"
            onClick={handleConnect}
            disabled={isLoading || pendingOAuth || connecting}
          >
            Connect
          </Button>
        )}
      </div>

      {connectError && (
        <p
          className="text-xs text-red-400 whitespace-pre-wrap"
          data-testid="google-calendar-connect-error"
        >
          {connectError}
        </p>
      )}

      {isConnected && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Show on timeline</span>
            <SlideToggle
              checked={settings.googleCalendarEnabled}
              onChange={(checked) => void updateSettings({ googleCalendarEnabled: checked })}
              data-testid="google-calendar-enabled"
              aria-label="Show Google Calendar on timeline"
            />
          </div>

          {calendars.length > 0 && (
            <div className="rounded-lg border border-border-default p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Calendars
              </p>
              <ul className="max-h-40 space-y-2 overflow-y-auto">
                {calendars.map((cal) => (
                  <li key={cal.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      id={`cal-${cal.id}`}
                      checked={
                        settings.selectedCalendars.length === 0
                          ? cal.primary
                          : settings.selectedCalendars.includes(cal.id)
                      }
                      onChange={() => void toggleCalendar(cal.id)}
                    />
                    <label htmlFor={`cal-${cal.id}`} className="flex-1 truncate">
                      {cal.name}
                      {cal.primary && (
                        <span className="ml-1 text-xs text-text-muted">(primary)</span>
                      )}
                    </label>
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cal.color }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Sync every {settings.calendarSyncInterval ?? 15} min
              {lastSyncAt && ` · Last ${lastSyncAt.toLocaleTimeString()}`}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-testid="google-calendar-sync-now"
              onClick={() => void syncNow()}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

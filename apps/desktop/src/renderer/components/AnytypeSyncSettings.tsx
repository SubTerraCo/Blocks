// ============================================================================
// BLOCKS - Anytype Sync Settings (N-0050 · DT.UI.06.009)
// API key + space picker, sync status, Sync now, interval, conflict dialog.
// ============================================================================

import { useState } from "react";
import { Button, ScheduleConflictDialog, SlideToggle, cn } from "@blocks/ui";
import { getTaskDurationMinutes, applyAnytypeObjectToTask } from "@blocks/core";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { useAnytypeSyncStore } from "../hooks/useAnytypeSync";

const SYNC_INTERVALS = [5, 15, 30, 60];

export function AnytypeSyncSettings() {
  const {
    enabled,
    apiKey,
    spaceId,
    syncIntervalMinutes,
    syncOnStartup,
    status,
    lastSyncAt,
    lastError,
    lastSummary,
    spaces,
    pendingConflicts,
    updateSettings,
    loadSpaces,
    syncNow,
    confirmConflict,
    dismissConflict,
  } = useAnytypeSyncStore();

  const [showApiKey, setShowApiKey] = useState(false);

  const canSync = Boolean(apiKey && spaceId) && status !== "syncing";
  const activeConflict = pendingConflicts[0];
  const activeConflictTask = activeConflict
    ? applyAnytypeObjectToTask(activeConflict.task, activeConflict.incoming)
    : null;

  return (
    <div data-testid="anytype-sync-settings">
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-medium text-text-primary">Enable Anytype sync</p>
          <p className="text-xs text-text-muted mt-0.5">
            Two-way task sync with your local Anytype space
          </p>
        </div>
        <SlideToggle
          checked={enabled}
          onChange={(checked) => updateSettings({ enabled: checked })}
          data-testid="anytype-sync-toggle"
        />
      </div>

      {enabled && (
        <>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">API key</p>
              <p className="text-xs text-text-muted mt-0.5">
                Anytype Settings → API Keys (Anytype Desktop must be running)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                onBlur={() => void loadSpaces()}
                placeholder="Bearer token"
                data-testid="anytype-api-key"
                className="w-48 rounded-lg border border-border-default bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-magenta"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((v) => !v)}
                className="rounded-lg p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Space</p>
              <p className="text-xs text-text-muted mt-0.5">Anytype space to sync tasks with</p>
            </div>
            <select
              value={spaceId}
              onChange={(e) => updateSettings({ spaceId: e.target.value })}
              data-testid="anytype-space-select"
              className="rounded-lg border border-border-default bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-magenta"
            >
              <option value="">Select a space…</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
              {spaceId && !spaces.some((s) => s.id === spaceId) && (
                <option value={spaceId}>{spaceId}</option>
              )}
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Sync interval</p>
              <p className="text-xs text-text-muted mt-0.5">Background sync while Blocks is open</p>
            </div>
            <select
              value={syncIntervalMinutes}
              onChange={(e) => updateSettings({ syncIntervalMinutes: Number(e.target.value) })}
              data-testid="anytype-sync-interval"
              className="rounded-lg border border-border-default bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-magenta"
            >
              {SYNC_INTERVALS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  Every {minutes} min
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Sync on startup</p>
            </div>
            <SlideToggle
              checked={syncOnStartup}
              onChange={(checked) => updateSettings({ syncOnStartup: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {status === "syncing"
                  ? "Syncing…"
                  : status === "unavailable"
                    ? "Anytype unreachable"
                    : lastSyncAt
                      ? `Last sync ${new Date(lastSyncAt).toLocaleTimeString()}`
                      : "Never synced"}
              </p>
              <p
                className={cn(
                  "text-xs mt-0.5",
                  lastError ? "text-status-warning" : "text-text-muted",
                )}
                data-testid="anytype-sync-status"
              >
                {lastError ?? lastSummary ?? "Two-way sync: last write wins per task"}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={!canSync}
              onClick={() => void syncNow()}
              data-testid="anytype-sync-now"
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", status === "syncing" && "animate-spin")} />
              Sync now
            </Button>
          </div>
        </>
      )}

      {activeConflict && activeConflictTask?.scheduledAt && (
        <ScheduleConflictDialog
          open
          taskName={activeConflict.task.name}
          scheduledAt={new Date(activeConflictTask.scheduledAt)}
          durationMinutes={getTaskDurationMinutes(activeConflictTask)}
          calendarConflicts={activeConflict.scheduleConflicts.map((c) => ({
            eventId: c.taskId,
            title: c.taskName,
            start: c.start,
            end: c.end,
          }))}
          onConfirm={() => void confirmConflict(activeConflict)}
          onCancel={() => dismissConflict(activeConflict)}
        />
      )}
    </div>
  );
}

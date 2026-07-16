// ============================================================================
// BLOCKS - Anytype Sync Store (N-0050 · DT.UI.06.009)
// Settings + manual/background two-way sync against the local Anytype API.
// Schedule-conflicting pulls are queued for ScheduleConflictDialog confirmation.
// ============================================================================

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AnytypeClient,
  AnytypeSyncEngine,
  AnytypeUnavailableError,
  applyPull,
  DexieStorage,
  type AnytypeSpace,
  type PendingPull,
  type Task,
} from "@blocks/core";
import { useTaskStore } from "@blocks/ui";

export type AnytypeSyncStatus = "idle" | "syncing" | "error" | "unavailable";

interface AnytypeSyncState {
  // Persisted settings
  enabled: boolean;
  apiKey: string;
  spaceId: string;
  baseUrl: string;
  syncIntervalMinutes: number;
  syncOnStartup: boolean;

  // Runtime state
  status: AnytypeSyncStatus;
  lastSyncAt: Date | null;
  lastError: string | null;
  lastSummary: string | null;
  spaces: AnytypeSpace[];
  /** Pulls skipped pending user confirmation (N-0021 gate) */
  pendingConflicts: PendingPull[];

  // Actions
  updateSettings: (
    settings: Partial<
      Pick<
        AnytypeSyncState,
        "enabled" | "apiKey" | "spaceId" | "baseUrl" | "syncIntervalMinutes" | "syncOnStartup"
      >
    >,
  ) => void;
  loadSpaces: () => Promise<void>;
  syncNow: () => Promise<void>;
  confirmConflict: (pull: PendingPull) => Promise<void>;
  dismissConflict: (pull: PendingPull) => void;
}

const ANYTYPE_SYNC_STORAGE_KEY = "blocks-anytype-sync-settings";

function createEngine(state: Pick<AnytypeSyncState, "apiKey" | "spaceId" | "baseUrl">) {
  const client = new AnytypeClient({
    apiKey: state.apiKey,
    baseUrl: state.baseUrl || undefined,
  });
  return new AnytypeSyncEngine(client, { spaceId: state.spaceId });
}

/** Persist sync-engine output to Dexie without touching updatedAt (LWW-safe). */
async function persistSyncedTasks(before: Task[], after: Task[]): Promise<void> {
  const db = DexieStorage.getInstance();
  await db.init();
  const beforeById = new Map(before.map((t) => [t.id, t]));
  for (const task of after) {
    const prev = beforeById.get(task.id);
    if (!prev) {
      await db.createTask(task);
    } else if (prev !== task) {
      await db.updateTask(task);
    }
  }
  await useTaskStore.getState().loadTasks();
}

export const useAnytypeSyncStore = create<AnytypeSyncState>()(
  persist(
    (set, get) => ({
      enabled: false,
      apiKey: "",
      spaceId: "",
      baseUrl: "",
      syncIntervalMinutes: 15,
      syncOnStartup: true,

      status: "idle",
      lastSyncAt: null,
      lastError: null,
      lastSummary: null,
      spaces: [],
      pendingConflicts: [],

      updateSettings: (settings) => {
        set({ ...settings });
      },

      loadSpaces: async () => {
        const { apiKey, baseUrl } = get();
        if (!apiKey) return;
        try {
          const client = new AnytypeClient({ apiKey, baseUrl: baseUrl || undefined });
          const spaces = await client.listSpaces();
          set({ spaces, lastError: null, status: "idle" });
        } catch (error) {
          set({
            status: error instanceof AnytypeUnavailableError ? "unavailable" : "error",
            lastError: (error as Error).message,
          });
        }
      },

      syncNow: async () => {
        const state = get();
        if (!state.apiKey || !state.spaceId || state.status === "syncing") return;
        set({ status: "syncing", lastError: null });
        try {
          const engine = createEngine(state);
          const tasks = useTaskStore.getState().tasks;
          const result = await engine.syncTasks(tasks, { confirmSchedule: false });
          await persistSyncedTasks(tasks, result.tasks);
          set({
            status: "idle",
            lastSyncAt: new Date(),
            pendingConflicts: result.pendingScheduleConflicts,
            lastSummary: `Pushed ${result.pushed}, pulled ${result.pulled}, created ${result.createdInAnytype} in Anytype, ${result.createdInBlocks} in Blocks`,
          });
        } catch (error) {
          set({
            status: error instanceof AnytypeUnavailableError ? "unavailable" : "error",
            lastError: (error as Error).message,
          });
        }
      },

      confirmConflict: async (pull) => {
        const tasks = useTaskStore.getState().tasks;
        const result = applyPull(tasks, pull, { confirmSchedule: true });
        if (result.applied) {
          await persistSyncedTasks(tasks, result.tasks);
        }
        set((state) => ({
          pendingConflicts: state.pendingConflicts.filter((p) => p !== pull),
        }));
      },

      dismissConflict: (pull) => {
        set((state) => ({
          pendingConflicts: state.pendingConflicts.filter((p) => p !== pull),
        }));
      },
    }),
    {
      name: ANYTYPE_SYNC_STORAGE_KEY,
      partialize: (state) => ({
        enabled: state.enabled,
        apiKey: state.apiKey,
        spaceId: state.spaceId,
        baseUrl: state.baseUrl,
        syncIntervalMinutes: state.syncIntervalMinutes,
        syncOnStartup: state.syncOnStartup,
      }),
    },
  ),
);

/**
 * Background sync runner — mount once in App. Runs a startup sync (when
 * enabled) and re-syncs on the configured interval while Anytype is reachable.
 */
export function useAnytypeSyncRunner(): void {
  const enabled = useAnytypeSyncStore((s) => s.enabled);
  const syncOnStartup = useAnytypeSyncStore((s) => s.syncOnStartup);
  const syncIntervalMinutes = useAnytypeSyncStore((s) => s.syncIntervalMinutes);

  useEffect(() => {
    if (!enabled) return;
    if (syncOnStartup) {
      void useAnytypeSyncStore.getState().syncNow();
    }
    const intervalMs = Math.max(1, syncIntervalMinutes) * 60_000;
    const timer = setInterval(() => {
      void useAnytypeSyncStore.getState().syncNow();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [enabled, syncOnStartup, syncIntervalMinutes]);
}

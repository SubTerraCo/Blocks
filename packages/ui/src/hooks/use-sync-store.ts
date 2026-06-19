// ============================================================================
// BLOCKS - Sync Store (Zustand) — shared web + desktop
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  WebRTCSyncProvider,
  DexieYjsBridge,
  type SyncStatus,
  type SyncEvent,
} from "@blocks/core";

interface SyncState {
  isEnabled: boolean;
  status: SyncStatus;
  roomId: string;
  lastSyncAt: Date | null;
  error: string | null;
  autoSync: boolean;
  syncOnStartup: boolean;
  provider: WebRTCSyncProvider | null;
  bridge: DexieYjsBridge | null;
  setEnabled: (enabled: boolean) => void;
  setRoomId: (roomId: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const SYNC_STORAGE_KEY = "blocks-sync-settings";

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      isEnabled: false,
      status: "disconnected",
      roomId: "",
      lastSyncAt: null,
      error: null,
      autoSync: true,
      syncOnStartup: true,
      provider: null,
      bridge: null,

      setEnabled: (enabled: boolean) => {
        set({ isEnabled: enabled });
        if (enabled) void get().connect();
        else get().disconnect();
      },

      setRoomId: (roomId: string) => set({ roomId }),

      connect: async () => {
        const { roomId, isEnabled, bridge: existingBridge } = get();
        if (!isEnabled || !roomId) return;

        try {
          set({ status: "connecting", error: null });

          const bridge = existingBridge ?? new DexieYjsBridge();
          if (!existingBridge) {
            await bridge.start();
          }

          const doc = bridge.getYjsStore().getDoc();
          const provider = new WebRTCSyncProvider({
            signalingServers: [
              "wss://signaling.yjs.dev",
              "wss://y-webrtc-signaling-eu.herokuapp.com",
              "wss://y-webrtc-signaling-us.herokuapp.com",
            ],
            password: roomId,
            enablePersistence: true,
          });

          provider.onEvent((event: SyncEvent) => {
            if (event.type === "status_change") {
              const s = event.status as SyncStatus;
              if (s === "connected") {
                set({ status: "connected", lastSyncAt: new Date(), error: null });
              } else if (s === "disconnected") {
                set({ status: "disconnected" });
              } else if (s === "syncing") {
                set({ status: "syncing" });
              }
            } else if (event.type === "error") {
              set({
                status: "error",
                error:
                  event.error instanceof Error
                    ? event.error.message
                    : String(event.error),
              });
            }
          });

          await provider.connect(doc, `blocks-${roomId}`);
          set({ provider, bridge, status: "connected", lastSyncAt: new Date() });
        } catch (error) {
          set({
            status: "error",
            error: error instanceof Error ? error.message : "Connection failed",
          });
        }
      },

      disconnect: () => {
        const { provider, bridge } = get();
        provider?.disconnect();
        bridge?.stop();
        set({
          status: "disconnected",
          provider: null,
          bridge: null,
          error: null,
        });
      },
    }),
    {
      name: SYNC_STORAGE_KEY,
      partialize: (state) => ({
        isEnabled: state.isEnabled,
        roomId: state.roomId,
        autoSync: state.autoSync,
        syncOnStartup: state.syncOnStartup,
      }),
    },
  ),
);

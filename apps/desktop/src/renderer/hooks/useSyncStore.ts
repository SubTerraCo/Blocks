// ============================================================================
// BLOCKS - Sync Store (Zustand)
// Manages P2P sync state and connections
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { YjsStore, WebRTCSyncProvider, type SyncStatus, type SyncEvent } from "@blocks/core";

// ============================================================================
// Types
// ============================================================================

interface SyncDevice {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "web";
  lastSeen: Date;
  isConnected: boolean;
}

interface SyncState {
  // State
  isEnabled: boolean;
  status: SyncStatus;
  roomId: string;
  devices: SyncDevice[];
  lastSyncAt: Date | null;
  error: string | null;
  
  // Settings
  autoSync: boolean;
  syncOnStartup: boolean;
  
  // Internal
  provider: WebRTCSyncProvider | null;
  
  // Actions
  setEnabled: (enabled: boolean) => void;
  setRoomId: (roomId: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  updateSettings: (settings: { autoSync?: boolean; syncOnStartup?: boolean }) => void;
  
  // Device management
  addDevice: (device: Omit<SyncDevice, "lastSeen" | "isConnected">) => void;
  removeDevice: (deviceId: string) => void;
  updateDeviceStatus: (deviceId: string, isConnected: boolean) => void;
}

// ============================================================================
// Constants
// ============================================================================

const SYNC_STORAGE_KEY = "blocks-sync-settings";

// ============================================================================
// Store
// ============================================================================

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      // Initial state
      isEnabled: false,
      status: "disconnected",
      roomId: "",
      devices: [],
      lastSyncAt: null,
      error: null,
      autoSync: true,
      syncOnStartup: true,
      provider: null,
      
      setEnabled: (enabled: boolean) => {
        set({ isEnabled: enabled });
        if (enabled) {
          get().connect();
        } else {
          get().disconnect();
        }
      },
      
      setRoomId: (roomId: string) => {
        set({ roomId });
      },
      
      connect: async () => {
        const { roomId, isEnabled } = get();
        
        if (!isEnabled || !roomId) {
          console.log("Sync not enabled or no room ID");
          return;
        }
        
        try {
          set({ status: "connecting", error: null });
          
          // Get YjsStore singleton
          const yjsStore = YjsStore.getInstance();
          const doc = yjsStore.getDoc();
          
          // Create WebRTC provider
          const provider = new WebRTCSyncProvider({
            signalingServers: [
              "wss://signaling.yjs.dev",
              "wss://y-webrtc-signaling-eu.herokuapp.com",
              "wss://y-webrtc-signaling-us.herokuapp.com",
            ],
            password: roomId, // Use room ID as encryption password
            enablePersistence: true,
          });
          
          // Subscribe to status updates
          const handleEvent = (event: SyncEvent) => {
            if (event.type === "status_change") {
              const newStatus = event.status as SyncStatus;
              if (newStatus === "connected") {
                set({ 
                  status: "connected", 
                  lastSyncAt: new Date(),
                  error: null,
                });
              } else if (newStatus === "disconnected") {
                set({ status: "disconnected" });
              } else if (newStatus === "syncing") {
                set({ status: "syncing" });
              }
            } else if (event.type === "error") {
              set({ 
                status: "error", 
                error: event.error instanceof Error ? event.error.message : String(event.error),
              });
            }
          };
          
          provider.onEvent(handleEvent);
          
          // Connect
          await provider.connect(doc, `blocks-${roomId}`);
          
          set({ provider, status: "connected", lastSyncAt: new Date() });
          
        } catch (error) {
          console.error("Sync connection failed:", error);
          set({ 
            status: "error", 
            error: error instanceof Error ? error.message : "Connection failed",
          });
        }
      },
      
      disconnect: () => {
        const { provider } = get();
        
        if (provider) {
          provider.disconnect();
        }
        
        set({ 
          status: "disconnected", 
          provider: null,
          error: null,
        });
      },
      
      updateSettings: (settings) => {
        set({ ...settings });
      },
      
      addDevice: (device) => {
        const { devices } = get();
        const existingIndex = devices.findIndex((d) => d.id === device.id);
        
        if (existingIndex >= 0) {
          // Update existing device
          const updatedDevices = [...devices];
          updatedDevices[existingIndex] = {
            ...updatedDevices[existingIndex],
            ...device,
            lastSeen: new Date(),
          };
          set({ devices: updatedDevices });
        } else {
          // Add new device
          set({
            devices: [
              ...devices,
              {
                ...device,
                lastSeen: new Date(),
                isConnected: true,
              },
            ],
          });
        }
      },
      
      removeDevice: (deviceId: string) => {
        set({
          devices: get().devices.filter((d) => d.id !== deviceId),
        });
      },
      
      updateDeviceStatus: (deviceId: string, isConnected: boolean) => {
        set({
          devices: get().devices.map((d) =>
            d.id === deviceId
              ? { ...d, isConnected, lastSeen: isConnected ? new Date() : d.lastSeen }
              : d
          ),
        });
      },
    }),
    {
      name: SYNC_STORAGE_KEY,
      partialize: (state) => ({
        isEnabled: state.isEnabled,
        roomId: state.roomId,
        devices: state.devices,
        autoSync: state.autoSync,
        syncOnStartup: state.syncOnStartup,
      }),
    }
  )
);


// ============================================================================
// BLOCKS Mobile - Sync Store Hook
// P2P sync state management for mobile
// ============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================================
// Types
// ============================================================================

type SyncStatus = "disconnected" | "connecting" | "connected" | "syncing" | "error";

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
  
  // Actions
  setEnabled: (enabled: boolean) => void;
  setRoomId: (roomId: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  updateSettings: (settings: { autoSync?: boolean; syncOnStartup?: boolean }) => void;
  addDevice: (device: Omit<SyncDevice, "lastSeen" | "isConnected">) => void;
  removeDevice: (deviceId: string) => void;
}

// ============================================================================
// Helper functions
// ============================================================================

function getDeviceId(): string {
  // In React Native, we'd use a more robust method like expo-device
  return `mobile-${Date.now().toString(36)}`;
}

function generateRoomId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
        
        if (!isEnabled) {
          console.log("Sync not enabled");
          return;
        }
        
        // Generate room ID if not set
        const actualRoomId = roomId || generateRoomId();
        if (!roomId) {
          set({ roomId: actualRoomId });
        }
        
        try {
          set({ status: "connecting", error: null });
          
          // In a real implementation, we would:
          // 1. Import y-webrtc for React Native (requires native modules)
          // 2. Connect to signaling servers
          // 3. Sync with other devices
          
          // For now, simulate connection
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set({ 
            status: "connected", 
            lastSyncAt: new Date(),
            error: null,
          });
          
          console.log(`Connected to sync room: ${actualRoomId}`);
          
        } catch (error) {
          console.error("Sync connection failed:", error);
          set({ 
            status: "error", 
            error: error instanceof Error ? error.message : "Connection failed",
          });
        }
      },
      
      disconnect: () => {
        set({ 
          status: "disconnected", 
          error: null,
        });
        console.log("Disconnected from sync");
      },
      
      updateSettings: (settings) => {
        set({ ...settings });
      },
      
      addDevice: (device) => {
        const { devices } = get();
        const existingIndex = devices.findIndex((d) => d.id === device.id);
        
        if (existingIndex >= 0) {
          const updatedDevices = [...devices];
          updatedDevices[existingIndex] = {
            ...updatedDevices[existingIndex],
            ...device,
            lastSeen: new Date(),
          };
          set({ devices: updatedDevices });
        } else {
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
    }),
    {
      name: "blocks-sync",
      storage: createJSONStorage(() => AsyncStorage),
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


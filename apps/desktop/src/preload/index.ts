import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Window controls
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),
  isMaximized: () => ipcRenderer.invoke("window:isMaximized"),

  // App info
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
  getPlatform: () => ipcRenderer.invoke("app:getPlatform"),

  // Update controls
  checkForUpdates: () => ipcRenderer.invoke("app:checkForUpdates"),
  installUpdate: () => ipcRenderer.invoke("app:installUpdate"),
  getUpdateStatus: () => ipcRenderer.invoke("app:getUpdateStatus"),
  
  // Update events listener
  onUpdateStatus: (callback: (status: UpdateStatusEvent) => void) => {
    ipcRenderer.on("update-status", (_event, data) => callback(data));
    return () => {
      ipcRenderer.removeAllListeners("update-status");
    };
  },

  // Navigation listener
  onNavigate: (callback: (path: string) => void) => {
    ipcRenderer.on("navigate", (_event, path) => callback(path));
    return () => {
      ipcRenderer.removeAllListeners("navigate");
    };
  },

  // Platform check
  isElectron: true,
});

// Type definitions for renderer
export interface UpdateStatusEvent {
  status: "checking" | "available" | "not-available" | "downloading" | "downloaded" | "error";
  data?: {
    version?: string;
    percent?: number;
    bytesPerSecond?: number;
    transferred?: number;
    total?: number;
    message?: string;
  };
}

export interface UpdateCheckResult {
  available: boolean;
  version?: string;
  message?: string;
  error?: string;
}

export interface ElectronAPI {
  // Window controls
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  
  // App info
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  
  // Update controls
  checkForUpdates: () => Promise<UpdateCheckResult>;
  installUpdate: () => Promise<void>;
  getUpdateStatus: () => Promise<{ updateDownloaded: boolean }>;
  onUpdateStatus: (callback: (status: UpdateStatusEvent) => void) => () => void;
  
  // Navigation
  onNavigate: (callback: (path: string) => void) => () => void;
  
  // Platform check
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

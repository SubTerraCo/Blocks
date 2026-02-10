// ============================================================================
// BLOCKS - Sync Settings Component
// P2P sync configuration and status display
// ============================================================================

import { useState } from "react";
import { cn, Button } from "@blocks/ui";
import { useSyncStore } from "../hooks/useSyncStore";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Smartphone,
  Monitor,
  Globe,
  Copy,
  Check,
  X,
  Loader2,
  QrCode,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface SyncSettingsProps {
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function SyncSettings({ className }: SyncSettingsProps) {
  const {
    isEnabled,
    status,
    roomId,
    devices,
    lastSyncAt,
    error,
    autoSync,
    syncOnStartup,
    setEnabled,
    setRoomId,
    connect,
    disconnect,
    updateSettings,
    removeDevice,
  } = useSyncStore();
  
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [inputRoomId, setInputRoomId] = useState(roomId);
  const [copied, setCopied] = useState(false);
  
  // Generate a new room ID
  const generateRoomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const handleEnable = () => {
    if (!roomId) {
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      setInputRoomId(newRoomId);
    }
    setEnabled(true);
  };
  
  const handleDisable = () => {
    setEnabled(false);
  };
  
  const handleSaveRoomId = () => {
    setRoomId(inputRoomId);
    setShowRoomInput(false);
    if (isEnabled) {
      disconnect();
      setTimeout(() => connect(), 500);
    }
  };
  
  const handleCopyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "text-accent-green";
      case "connecting":
      case "syncing":
        return "text-accent-cyan";
      case "error":
        return "text-status-error";
      default:
        return "text-text-muted";
    }
  };
  
  const getStatusLabel = () => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "syncing":
        return "Syncing...";
      case "error":
        return "Error";
      default:
        return "Disconnected";
    }
  };
  
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "desktop":
        return Monitor;
      case "mobile":
        return Smartphone;
      default:
        return Globe;
    }
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Enable/Disable toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Wifi className={cn("h-5 w-5", getStatusColor())} />
          ) : (
            <WifiOff className="h-5 w-5 text-text-muted" />
          )}
          <div>
            <p className="text-sm font-medium text-text-primary">
              P2P Sync
            </p>
            <p className={cn("text-xs", getStatusColor())}>
              {getStatusLabel()}
              {status === "connecting" || status === "syncing" ? (
                <Loader2 className="inline-block ml-1 h-3 w-3 animate-spin" />
              ) : null}
            </p>
          </div>
        </div>
        
        <Button
          variant={isEnabled ? "secondary" : "primary"}
          size="sm"
          onClick={isEnabled ? handleDisable : handleEnable}
        >
          {isEnabled ? "Disable" : "Enable"}
        </Button>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="rounded-lg bg-status-error/10 border border-status-error/20 px-3 py-2">
          <p className="text-sm text-status-error">{error}</p>
        </div>
      )}
      
      {/* Room ID */}
      {isEnabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Sync Room ID</p>
            <button
              onClick={() => setShowRoomInput(!showRoomInput)}
              className="text-xs text-accent-cyan hover:underline"
            >
              {showRoomInput ? "Cancel" : "Change"}
            </button>
          </div>
          
          {showRoomInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room ID"
                className="flex-1 rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary font-mono uppercase tracking-wider placeholder:text-text-muted focus:border-accent-magenta focus:outline-none"
                maxLength={8}
              />
              <Button size="sm" onClick={handleSaveRoomId}>
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-bg-tertiary px-3 py-2 text-sm font-mono text-accent-magenta tracking-wider">
                {roomId || "Not set"}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyRoomId}
                disabled={!roomId}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-accent-green" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                title="Generate QR Code"
                disabled={!roomId}
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <p className="text-xs text-text-muted">
            Share this ID with other devices to sync data.
          </p>
        </div>
      )}
      
      {/* Connected devices */}
      {isEnabled && devices.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Connected Devices</p>
          <div className="space-y-2">
            {devices.map((device) => {
              const Icon = getDeviceIcon(device.type);
              return (
                <div
                  key={device.id}
                  className="flex items-center gap-3 rounded-lg bg-bg-tertiary px-3 py-2"
                >
                  <Icon className={cn(
                    "h-4 w-4",
                    device.isConnected ? "text-accent-green" : "text-text-muted"
                  )} />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{device.name}</p>
                    <p className="text-xs text-text-muted">
                      {device.isConnected 
                        ? "Connected" 
                        : `Last seen ${device.lastSeen.toLocaleDateString()}`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => removeDevice(device.id)}
                    className="text-text-muted hover:text-status-error transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Sync settings */}
      {isEnabled && (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Sync Options</p>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => updateSettings({ autoSync: e.target.checked })}
              className="rounded border-border-default text-accent-magenta focus:ring-accent-magenta"
            />
            <span className="text-sm text-text-primary">Auto-sync changes</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={syncOnStartup}
              onChange={(e) => updateSettings({ syncOnStartup: e.target.checked })}
              className="rounded border-border-default text-accent-magenta focus:ring-accent-magenta"
            />
            <span className="text-sm text-text-primary">Sync on app startup</span>
          </label>
        </div>
      )}
      
      {/* Last sync time */}
      {isEnabled && lastSyncAt && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Last synced: {lastSyncAt.toLocaleString()}</span>
          <button
            onClick={() => connect()}
            className="flex items-center gap-1 text-accent-cyan hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            Sync now
          </button>
        </div>
      )}
    </div>
  );
}


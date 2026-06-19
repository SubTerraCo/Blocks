"use client";

import { useState } from "react";
import { Wifi, WifiOff, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "./button";
import { SlideToggle } from "./slide-toggle";
import { cn } from "../lib/utils";
import { useSyncStore } from "../hooks/use-sync-store";

export interface SyncSettingsPanelProps {
  className?: string;
}

export function SyncSettingsPanel({ className }: SyncSettingsPanelProps) {
  const {
    isEnabled,
    status,
    roomId,
    error,
    setEnabled,
    setRoomId,
    connect,
    disconnect,
  } = useSyncStore();

  const [inputRoomId, setInputRoomId] = useState(roomId);
  const [copied, setCopied] = useState(false);

  const generateRoomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("space-y-4", className)} data-testid="sync-settings-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEnabled && status === "connected" ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-text-muted" />
          )}
          <div>
            <p className="text-sm font-medium text-text-primary">P2P Sync</p>
            <p className="text-xs text-text-muted">
              Sync tasks across devices (same room ID)
            </p>
          </div>
        </div>
        <SlideToggle
          checked={isEnabled}
          onChange={setEnabled}
          data-testid="sync-enabled"
          aria-label="Enable P2P sync"
        />
      </div>

      {isEnabled && (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              data-testid="sync-room-id"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
              placeholder="Room ID"
              className="flex-1 rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const id = generateRoomId();
                setInputRoomId(id);
                setRoomId(id);
              }}
            >
              New
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setRoomId(inputRoomId);
                void connect();
              }}
            >
              Save
            </Button>
          </div>

          {roomId && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>Room: {roomId}</span>
              <button type="button" onClick={() => void handleCopy()}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs">
            {status === "connecting" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Connecting…
              </>
            )}
            {status === "connected" && (
              <span className="text-green-500">Connected</span>
            )}
            {status === "error" && (
              <span className="text-red-400">{error ?? "Sync error"}</span>
            )}
            {status === "connected" && (
              <Button type="button" variant="ghost" size="sm" onClick={() => disconnect()}>
                Disconnect
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

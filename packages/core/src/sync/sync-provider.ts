// ============================================================================
// BLOCKS - Sync Provider Interface
// Abstract interface for sync providers (WebRTC, Anytype, etc.)
// ============================================================================

import type * as Y from "yjs";

/**
 * Sync status for monitoring connection state
 */
export type SyncStatus = "disconnected" | "connecting" | "connected" | "syncing" | "error";

/**
 * Sync event types
 */
export interface SyncEvent {
  type: "status_change" | "peer_connected" | "peer_disconnected" | "sync_complete" | "error";
  status?: SyncStatus;
  peerId?: string;
  peerCount?: number;
  error?: Error;
  timestamp: Date;
}

export type SyncEventHandler = (event: SyncEvent) => void;

/**
 * Abstract Sync Provider Interface
 * 
 * This interface allows swapping sync implementations without changing app code.
 * Current implementation: WebRTC (y-webrtc)
 * Future implementation: Anytype API connector
 */
export interface ISyncProvider {
  /**
   * Provider name for identification
   */
  readonly name: string;

  /**
   * Current connection status
   */
  readonly status: SyncStatus;

  /**
   * Whether the provider is currently connected
   */
  readonly isConnected: boolean;

  /**
   * Number of connected peers (for P2P providers)
   */
  readonly peerCount: number;

  /**
   * Connect to sync network/service
   * @param doc - Yjs document to sync
   * @param roomName - Room/channel identifier for this sync group
   */
  connect(doc: Y.Doc, roomName: string): Promise<void>;

  /**
   * Disconnect from sync network/service
   */
  disconnect(): void;

  /**
   * Subscribe to sync events
   */
  onEvent(handler: SyncEventHandler): () => void;

  /**
   * Force a sync (if supported)
   */
  forceSync?(): Promise<void>;

  /**
   * Get list of connected peer IDs (for P2P providers)
   */
  getPeers?(): string[];
}

/**
 * Base class for sync providers with common functionality
 */
export abstract class BaseSyncProvider implements ISyncProvider {
  abstract readonly name: string;
  
  protected _status: SyncStatus = "disconnected";
  protected _peerCount: number = 0;
  protected eventHandlers: Set<SyncEventHandler> = new Set();

  get status(): SyncStatus {
    return this._status;
  }

  get isConnected(): boolean {
    return this._status === "connected" || this._status === "syncing";
  }

  get peerCount(): number {
    return this._peerCount;
  }

  abstract connect(doc: Y.Doc, roomName: string): Promise<void>;
  abstract disconnect(): void;

  onEvent(handler: SyncEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  protected emit(event: Omit<SyncEvent, "timestamp">): void {
    const fullEvent: SyncEvent = {
      ...event,
      timestamp: new Date(),
    };
    this.eventHandlers.forEach((handler) => {
      try {
        handler(fullEvent);
      } catch (error) {
        console.error("Sync event handler error:", error);
      }
    });
  }

  protected setStatus(status: SyncStatus): void {
    if (this._status !== status) {
      this._status = status;
      this.emit({ type: "status_change", status });
    }
  }
}

/**
 * Null sync provider - does nothing, for offline-only mode
 */
export class NullSyncProvider extends BaseSyncProvider {
  readonly name = "null";

  async connect(): Promise<void> {
    this.setStatus("connected");
  }

  disconnect(): void {
    this.setStatus("disconnected");
  }
}

export default ISyncProvider;


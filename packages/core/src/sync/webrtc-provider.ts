// ============================================================================
// BLOCKS - WebRTC Sync Provider
// P2P sync using y-webrtc for local network synchronization
// ============================================================================

import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import { BaseSyncProvider } from "./sync-provider";

/**
 * Configuration options for WebRTC sync
 */
export interface WebRTCSyncConfig {
  /**
   * Signaling servers for WebRTC peer discovery
   * Default uses public signaling servers
   */
  signalingServers?: string[];

  /**
   * Password for room encryption (optional)
   */
  password?: string;

  /**
   * Enable local persistence via IndexedDB
   */
  enablePersistence?: boolean;

  /**
   * Maximum number of WebRTC connections
   */
  maxConns?: number;

  /**
   * Filter WebRTC connections by IP (for local network only)
   */
  filterBcConns?: boolean;
}

const DEFAULT_CONFIG: WebRTCSyncConfig = {
  signalingServers: [
    "wss://signaling.yjs.dev",
    "wss://y-webrtc-signaling-us.herokuapp.com",
    "wss://y-webrtc-signaling-eu.herokuapp.com",
  ],
  enablePersistence: true,
  maxConns: 20,
  filterBcConns: true,
};

/**
 * WebRTC Sync Provider
 * 
 * Uses y-webrtc for peer-to-peer synchronization.
 * Works on local networks and over the internet via signaling servers.
 */
export class WebRTCSyncProvider extends BaseSyncProvider {
  readonly name = "webrtc";
  
  private config: WebRTCSyncConfig;
  private provider: WebrtcProvider | null = null;
  private persistence: IndexeddbPersistence | null = null;
  private doc: Y.Doc | null = null;
  private roomName: string = "";

  constructor(config: Partial<WebRTCSyncConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Connect to WebRTC sync network
   */
  async connect(doc: Y.Doc, roomName: string): Promise<void> {
    if (this.provider) {
      this.disconnect();
    }

    this.doc = doc;
    this.roomName = roomName;
    this.setStatus("connecting");

    try {
      // Set up IndexedDB persistence if enabled
      if (this.config.enablePersistence) {
        this.persistence = new IndexeddbPersistence(roomName, doc);
        
        // Wait for persistence to sync
        await new Promise<void>((resolve) => {
          this.persistence!.once("synced", () => {
            console.log(`[WebRTC] IndexedDB synced for room: ${roomName}`);
            resolve();
          });
        });
      }

      // Create WebRTC provider
      this.provider = new WebrtcProvider(roomName, doc, {
        signaling: this.config.signalingServers,
        password: this.config.password,
        maxConns: this.config.maxConns,
        filterBcConns: this.config.filterBcConns,
      });

      // Set up event handlers
      this.setupEventHandlers();

      // Wait for initial connection
      if (this.provider.connected) {
        this.setStatus("connected");
      } else {
        // Wait for connection with timeout
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            // Connected to signaling but may not have peers yet
            this.setStatus("connected");
            resolve();
          }, 5000);

          this.provider!.on("status", (event: { connected: boolean }) => {
            if (event.connected) {
              clearTimeout(timeout);
              this.setStatus("connected");
              resolve();
            }
          });
        });
      }

      console.log(`[WebRTC] Connected to room: ${roomName}`);
    } catch (error) {
      this.setStatus("error");
      this.emit({ type: "error", error: error as Error });
      throw error;
    }
  }

  /**
   * Disconnect from WebRTC sync network
   */
  disconnect(): void {
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }

    if (this.persistence) {
      this.persistence.destroy();
      this.persistence = null;
    }

    this.doc = null;
    this._peerCount = 0;
    this.setStatus("disconnected");
    console.log(`[WebRTC] Disconnected from room: ${this.roomName}`);
  }

  /**
   * Get list of connected peer IDs
   */
  getPeers(): string[] {
    if (!this.provider) return [];
    return Array.from(this.provider.awareness.getStates().keys())
      .filter((id) => id !== this.doc?.clientID)
      .map((id) => id.toString());
  }

  /**
   * Force sync (broadcasts current state)
   */
  async forceSync(): Promise<void> {
    if (!this.provider || !this.doc) return;
    
    // Trigger awareness update to prompt peers
    this.provider.awareness.setLocalStateField("lastSync", Date.now());
  }

  private setupEventHandlers(): void {
    if (!this.provider) return;

    // Connection status changes
    this.provider.on("status", (event: { connected: boolean }) => {
      if (event.connected) {
        this.setStatus("connected");
      } else {
        this.setStatus("connecting");
      }
    });

    // Peer awareness changes
    this.provider.awareness.on("change", () => {
      const states = this.provider!.awareness.getStates();
      const oldCount = this._peerCount;
      
      // Count peers (excluding self)
      this._peerCount = states.size - 1;
      
      if (this._peerCount > oldCount) {
        this.emit({ type: "peer_connected", peerCount: this._peerCount });
      } else if (this._peerCount < oldCount) {
        this.emit({ type: "peer_disconnected", peerCount: this._peerCount });
      }
    });

    // Sync events
    this.provider.on("synced", (event: { synced: boolean }) => {
      if (event.synced) {
        this.emit({ type: "sync_complete", peerCount: this._peerCount });
      }
    });
  }
}

export default WebRTCSyncProvider;


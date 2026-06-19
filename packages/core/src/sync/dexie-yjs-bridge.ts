// ============================================================================
// BLOCKS - Dexie ↔ Yjs bridge for P2P sync
// ============================================================================

import type { Task, QuickAddBlock } from "../types";
import { DexieStorage } from "../storage/dexie-storage";
import { YjsStore } from "../sync/yjs-store";

export interface DexieYjsBridgeOptions {
  /** When true, remote Yjs updates write to Dexie */
  syncRemoteToDexie?: boolean;
  /** When true, local Dexie writes push to Yjs */
  syncDexieToYjs?: boolean;
}

/**
 * Bidirectional bridge between Dexie (local source of truth) and Yjs (P2P CRDT).
 */
export class DexieYjsBridge {
  private dexie = DexieStorage.getInstance();
  private yjs = YjsStore.getInstance();
  private unsubDexie: (() => void) | null = null;
  private unsubYjs: (() => void) | null = null;
  private applyingRemote = false;
  private options: DexieYjsBridgeOptions;

  constructor(options: DexieYjsBridgeOptions = {}) {
    this.options = {
      syncRemoteToDexie: true,
      syncDexieToYjs: true,
      ...options,
    };
  }

  async start(): Promise<void> {
    await this.dexie.init();

    // Seed Yjs from Dexie on first connect
    const tasks = await this.dexie.getTasks();
    const quickAddBlocks = await this.dexie.getQuickAddBlocks();
    this.yjs.importFromDexie({ tasks, quickAddBlocks });

    if (this.options.syncDexieToYjs) {
      this.unsubDexie = this.dexie.subscribe(async (event) => {
        if (this.applyingRemote) return;
        if (event.type === "task:created" || event.type === "task:updated") {
          const task = event.data as Task;
          this.yjs.setTask(task);
        } else if (event.type === "task:deleted") {
          const { id } = event.data as { id: string };
          this.yjs.deleteTask(id);
        } else if (
          event.type === "quickblock:created" ||
          event.type === "quickblock:updated"
        ) {
          const block = event.data as QuickAddBlock;
          this.yjs.setQuickBlock(block);
        } else if (event.type === "quickblock:deleted") {
          const { id } = event.data as { id: string };
          this.yjs.deleteQuickBlock(id);
        }
      });
    }

    if (this.options.syncRemoteToDexie) {
      this.unsubYjs = this.yjs.observeTasks(async (yjsTasks) => {
        this.applyingRemote = true;
        try {
          const localTasks = await this.dexie.getTasks();
          const localIds = new Set(localTasks.map((t) => t.id));
          const yjsIds = new Set(yjsTasks.map((t) => t.id));

          for (const task of yjsTasks) {
            const existing = localTasks.find((t) => t.id === task.id);
            if (
              !existing ||
              new Date(task.updatedAt).getTime() >
                new Date(existing.updatedAt).getTime()
            ) {
              if (existing) {
                await this.dexie.updateTask(task);
              } else {
                await this.dexie.createTask(task);
              }
            }
          }

          for (const id of localIds) {
            if (!yjsIds.has(id)) {
              await this.dexie.deleteTask(id);
            }
          }
        } finally {
          this.applyingRemote = false;
        }
      });
    }
  }

  stop(): void {
    this.unsubDexie?.();
    this.unsubYjs?.();
    this.unsubDexie = null;
    this.unsubYjs = null;
  }

  getYjsStore(): YjsStore {
    return this.yjs;
  }
}

export default DexieYjsBridge;

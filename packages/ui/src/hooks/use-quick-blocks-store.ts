// ============================================================================
// BLOCKS - Quick Add Blocks Store Hook (Zustand)
// ============================================================================

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { QuickAddBlock } from "@blocks/core";
import { DexieStorage } from "@blocks/core";

interface QuickBlocksState {
  blocks: QuickAddBlock[];
  timeLoggedToday: Record<string, number>; // blockId -> minutes logged today
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBlocks: () => Promise<void>;
  createBlock: (input: Omit<QuickAddBlock, "id" | "createdAt" | "usageCount">) => Promise<QuickAddBlock>;
  updateBlock: (block: QuickAddBlock) => Promise<QuickAddBlock>;
  deleteBlock: (id: string) => Promise<void>;
  logTime: (blockId: string, minutes?: number) => Promise<void>;
  resetDailyLogs: () => void;
  
  // Default blocks initialization
  initializeDefaultBlocks: () => Promise<void>;
}

// Default quick add blocks based on Figma mockups
const DEFAULT_BLOCKS: Omit<QuickAddBlock, "id" | "createdAt" | "usageCount">[] = [
  { name: "Get Ready", defaultDuration: 40, color: "#22c55e", isPutzing: false, sortOrder: 0 },
  { name: "Meeting", defaultDuration: 60, color: "#22c55e", isPutzing: false, sortOrder: 1 },
  { name: "Friends", defaultDuration: 120, color: "#22c55e", isPutzing: false, sortOrder: 2 },
  { name: "Food", defaultDuration: 60, color: "#22c55e", isPutzing: false, sortOrder: 3 },
  { name: "Work", defaultDuration: 120, color: "#22c55e", isPutzing: false, sortOrder: 4 },
  { name: "Commute", defaultDuration: 30, color: "#22c55e", isPutzing: false, sortOrder: 5 },
  { name: "Saxophone", defaultDuration: 60, color: "#22c55e", isPutzing: false, sortOrder: 6 },
  { name: "Walk", defaultDuration: 30, color: "#22c55e", isPutzing: false, sortOrder: 7 },
  { name: "Break", defaultDuration: 30, color: "#22c55e", isPutzing: false, sortOrder: 8 },
  { name: "Laundry", defaultDuration: 10, color: "#16a34a", isPutzing: false, sortOrder: 9 },
  { name: "Dishes", defaultDuration: 30, color: "#16a34a", isPutzing: false, sortOrder: 10 },
  { name: "Vacuum", defaultDuration: 30, color: "#16a34a", isPutzing: false, sortOrder: 11 },
  { name: "Putzing", defaultDuration: 5, color: "#166534", isPutzing: true, sortOrder: 12 },
  { name: "Putzing", defaultDuration: 15, color: "#166534", isPutzing: true, sortOrder: 13 },
  { name: "Putzing", defaultDuration: 30, color: "#166534", isPutzing: true, sortOrder: 14 },
];

export const useQuickBlocksStore = create<QuickBlocksState>((set, get) => {
  let storage: DexieStorage | null = null;

  const getStorage = async () => {
    if (!storage) {
      storage = DexieStorage.getInstance();
      await storage.init();
    }
    return storage;
  };

  return {
    blocks: [],
    timeLoggedToday: {},
    isLoading: false,
    error: null,

    loadBlocks: async () => {
      set({ isLoading: true, error: null });
      try {
        const db = await getStorage();
        const blocks = await db.getQuickAddBlocks();
        set({ blocks, isLoading: false });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    createBlock: async (input) => {
      try {
        const db = await getStorage();
        const block: QuickAddBlock = {
          ...input,
          id: uuidv4(),
          usageCount: 0,
          createdAt: new Date(),
        };
        await db.createQuickAddBlock(block);
        set((state) => ({ blocks: [...state.blocks, block] }));
        return block;
      } catch (error) {
        set({ error: (error as Error).message });
        throw error;
      }
    },

    updateBlock: async (block) => {
      try {
        const db = await getStorage();
        await db.updateQuickAddBlock(block);
        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === block.id ? block : b)),
        }));
        return block;
      } catch (error) {
        set({ error: (error as Error).message });
        throw error;
      }
    },

    deleteBlock: async (id) => {
      try {
        const db = await getStorage();
        await db.deleteQuickAddBlock(id);
        set((state) => ({
          blocks: state.blocks.filter((b) => b.id !== id),
        }));
      } catch (error) {
        set({ error: (error as Error).message });
        throw error;
      }
    },

    logTime: async (blockId, minutes) => {
      const block = get().blocks.find((b) => b.id === blockId);
      if (!block) return;

      const duration = minutes ?? block.defaultDuration;
      
      // Update local time logged
      set((state) => ({
        timeLoggedToday: {
          ...state.timeLoggedToday,
          [blockId]: (state.timeLoggedToday[blockId] ?? 0) + duration,
        },
      }));

      // Update usage count in storage
      try {
        const db = await getStorage();
        await db.updateQuickAddBlock({
          ...block,
          usageCount: block.usageCount + 1,
        });
      } catch (error) {
        console.error("Failed to update block usage count:", error);
      }
    },

    resetDailyLogs: () => {
      set({ timeLoggedToday: {} });
    },

    initializeDefaultBlocks: async () => {
      const db = await getStorage();
      const existingBlocks = await db.getQuickAddBlocks();
      
      if (existingBlocks.length === 0) {
        // Create default blocks
        for (const blockInput of DEFAULT_BLOCKS) {
          const block: QuickAddBlock = {
            ...blockInput,
            id: uuidv4(),
            usageCount: 0,
            createdAt: new Date(),
          };
          await db.createQuickAddBlock(block);
        }
        
        // Reload blocks
        const blocks = await db.getQuickAddBlocks();
        set({ blocks });
      }
    },
  };
});


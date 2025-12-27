// ============================================================================
// BLOCKS - Quick Add Blocks Store Hook (Zustand)
// ============================================================================

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { QuickAddBlock, BlockSize, Task, BlockCategory } from "@blocks/core";
import { DexieStorage, TaskEngine } from "@blocks/core";

// Helper to map duration to blockSize + blockCount
function durationToBlocks(minutes: number): { blockSize: BlockSize; blockCount: number } {
  if (minutes <= 15) return { blockSize: "15min", blockCount: 1 };
  if (minutes <= 30) return { blockSize: "15min", blockCount: Math.ceil(minutes / 15) };
  if (minutes <= 60) return { blockSize: "30min", blockCount: Math.ceil(minutes / 30) };
  return { blockSize: "1hour", blockCount: Math.ceil(minutes / 60) };
}

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
  
  // NEW: Create task from block and schedule immediately
  addTaskFromBlock: (blockId: string) => Promise<Task | null>;
  
  // NEW: Reorder blocks (for drag-and-drop)
  reorderBlocks: (orderedIds: string[]) => Promise<void>;
  
  // Default blocks initialization
  initializeDefaultBlocks: () => Promise<void>;
}

// Default quick add blocks based on Figma mockups - with proper colors from screenshot
const DEFAULT_BLOCKS: Omit<QuickAddBlock, "id" | "createdAt" | "usageCount">[] = [
  // Row 1: Activities (brown/maroon tones)
  { name: "Get Ready", defaultDuration: 40, color: "#6B4423", category: "productive" as BlockCategory, isPutzing: false, sortOrder: 0 },
  { name: "Meeting", defaultDuration: 60, color: "#6B4423", category: "productive" as BlockCategory, isPutzing: false, sortOrder: 1 },
  { name: "Friends", defaultDuration: 120, color: "#6B4423", category: "productive" as BlockCategory, isPutzing: false, sortOrder: 2 },
  // Row 2: Mixed activities
  { name: "Food", defaultDuration: 60, color: "#5D4E37", category: "productive" as BlockCategory, isPutzing: false, sortOrder: 3 },
  { name: "Work", defaultDuration: 120, color: "#4A5D23", category: "productive" as BlockCategory, isPutzing: false, sortOrder: 4 },
  { name: "Commute", defaultDuration: 30, color: "#8B5A2B", category: "productive" as BlockCategory, isPutzing: false, sortOrder: 5 },
  // Row 3: More activities
  { name: "Saxophone", defaultDuration: 60, color: "#4A5D23", category: "productive" as BlockCategory, isPutzing: false, sortOrder: 6 },
  { name: "Walk", defaultDuration: 30, color: "#4A5D23", category: "chores" as BlockCategory, isPutzing: false, sortOrder: 7 },
  { name: "Break", defaultDuration: 30, color: "#8B5A2B", category: "chores" as BlockCategory, isPutzing: false, sortOrder: 8 },
  // Row 4: Chores (green tones)
  { name: "Laundry", defaultDuration: 10, color: "#16a34a", category: "chores" as BlockCategory, isPutzing: false, sortOrder: 9 },
  { name: "Dishes", defaultDuration: 30, color: "#16a34a", category: "chores" as BlockCategory, isPutzing: false, sortOrder: 10 },
  { name: "Vacuum", defaultDuration: 30, color: "#16a34a", category: "chores" as BlockCategory, isPutzing: false, sortOrder: 11 },
  // Row 5: Putzing (dark green, negative time)
  { name: "Putzin", defaultDuration: 5, color: "#166534", category: "putzing" as BlockCategory, isPutzing: true, sortOrder: 12 },
  { name: "Putzin", defaultDuration: 15, color: "#166534", category: "putzing" as BlockCategory, isPutzing: true, sortOrder: 13 },
  { name: "Putzin", defaultDuration: 30, color: "#166534", category: "putzing" as BlockCategory, isPutzing: true, sortOrder: 14 },
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

    // NEW: Create task from block and schedule it immediately
    addTaskFromBlock: async (blockId: string) => {
      const block = get().blocks.find((b) => b.id === blockId);
      if (!block) return null;

      try {
        const db = await getStorage();
        
        // Map duration to blockSize + blockCount
        const { blockSize, blockCount } = durationToBlocks(block.defaultDuration);
        
        // Create task with "doing" status and schedule immediately
        const task = TaskEngine.createTask({
          name: block.name,
          status: "doing",
          blockSize,
          blockCount,
          scheduledAt: new Date(), // Schedule immediately (now)
          isPutzing: block.isPutzing,
          priority: "3", // Default priority
          assigneeId: "me",
          accessContexts: [],
          tags: [],
          subtasks: [],
          reminders: [],
          recurrence: "none",
          isQuickAdd: true,
          color: block.color,
        });
        
        // Save to database
        await db.createTask(task);
        
        // Update usage count and time logged
        set((state) => ({
          timeLoggedToday: {
            ...state.timeLoggedToday,
            [blockId]: (state.timeLoggedToday[blockId] ?? 0) + block.defaultDuration,
          },
        }));
        
        // Update block usage count
        await db.updateQuickAddBlock({
          ...block,
          usageCount: block.usageCount + 1,
        });
        
        return task;
      } catch (error) {
        set({ error: (error as Error).message });
        console.error("Failed to create task from block:", error);
        return null;
      }
    },

    // NEW: Reorder blocks (for drag-and-drop)
    reorderBlocks: async (orderedIds: string[]) => {
      const blocks = get().blocks;
      const reordered: QuickAddBlock[] = [];
      
      orderedIds.forEach((id, index) => {
        const block = blocks.find((b) => b.id === id);
        if (block) {
          reordered.push({ ...block, sortOrder: index });
        }
      });
      
      // Update state immediately for responsive UI
      set({ blocks: reordered });
      
      // Persist to storage
      try {
        const db = await getStorage();
        for (const block of reordered) {
          await db.updateQuickAddBlock(block);
        }
      } catch (error) {
        set({ error: (error as Error).message });
        console.error("Failed to reorder blocks:", error);
      }
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

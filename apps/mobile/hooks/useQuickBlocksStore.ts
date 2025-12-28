// ============================================================================
// BLOCKS Mobile - Quick Blocks Store Hook
// Zustand store for quick add blocks
// ============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import type { QuickAddBlock, BlockCategory } from "@blocks/core";

// ============================================================================
// Types
// ============================================================================

interface QuickBlocksState {
  blocks: QuickAddBlock[];
  isLoading: boolean;
  
  // Actions
  loadBlocks: () => Promise<void>;
  createBlock: (block: Omit<QuickAddBlock, "id" | "createdAt" | "usageCount" | "sortOrder">) => Promise<QuickAddBlock>;
  updateBlock: (id: string, updates: Partial<QuickAddBlock>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  reorderBlocks: (orderedIds: string[]) => Promise<void>;
  initializeDefaultBlocks: () => Promise<void>;
  incrementUsage: (id: string) => void;
}

// Re-export QuickAddBlock type for convenience
export type { QuickAddBlock } from "@blocks/core";

// ============================================================================
// Default blocks
// ============================================================================

const DEFAULT_BLOCKS: Omit<QuickAddBlock, "id" | "createdAt" | "usageCount" | "sortOrder">[] = [
  { name: "Deep Work", defaultDuration: 90, category: "productive", color: "#3B82F6", icon: "🧠", isPutzing: false },
  { name: "Meeting", defaultDuration: 30, category: "productive", color: "#8B5CF6", icon: "👥", isPutzing: false },
  { name: "Email", defaultDuration: 30, category: "productive", color: "#06B6D4", icon: "📧", isPutzing: false },
  { name: "Coding", defaultDuration: 60, category: "productive", color: "#22C55E", icon: "💻", isPutzing: false },
  { name: "Reading", defaultDuration: 30, category: "productive", color: "#F97316", icon: "📚", isPutzing: false },
  { name: "Exercise", defaultDuration: 45, category: "chores", color: "#EF4444", icon: "🏃", isPutzing: false },
  { name: "Cooking", defaultDuration: 30, category: "chores", color: "#EC4899", icon: "🍳", isPutzing: false },
  { name: "Break", defaultDuration: 15, category: "putzing", color: "#8B8B8B", icon: "☕", isPutzing: true },
  { name: "Social Media", defaultDuration: 15, category: "putzing", color: "#6366F1", icon: "📱", isPutzing: true },
];

// ============================================================================
// Store
// ============================================================================

export const useQuickBlocksStore = create<QuickBlocksState>()(
  persist(
    (set, get) => ({
      blocks: [],
      isLoading: false,
      
      loadBlocks: async () => {
        set({ isLoading: true });
        // Blocks are already loaded from persistence
        set({ isLoading: false });
      },
      
      createBlock: async (blockData) => {
        const now = new Date();
        const blocks = get().blocks;
        const block: QuickAddBlock = {
          ...blockData,
          id: uuidv4(),
          sortOrder: blocks.length,
          usageCount: 0,
          createdAt: now,
        };
        
        set((state) => ({
          blocks: [...state.blocks, block],
        }));
        
        return block;
      },
      
      updateBlock: async (id, updates) => {
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id ? { ...block, ...updates } : block
          ),
        }));
      },
      
      deleteBlock: async (id) => {
        set((state) => ({
          blocks: state.blocks.filter((block) => block.id !== id),
        }));
      },
      
      reorderBlocks: async (orderedIds) => {
        set((state) => ({
          blocks: orderedIds
            .map((id, index) => {
              const block = state.blocks.find((b) => b.id === id);
              if (!block) return null;
              return { ...block, sortOrder: index };
            })
            .filter((b): b is QuickAddBlock => b !== null),
        }));
      },
      
      initializeDefaultBlocks: async () => {
        const now = new Date();
        const blocks: QuickAddBlock[] = DEFAULT_BLOCKS.map((block, index) => ({
          ...block,
          id: uuidv4(),
          sortOrder: index,
          usageCount: 0,
          createdAt: now,
        }));
        
        set({ blocks });
      },
      
      incrementUsage: (id) => {
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id
              ? { ...block, usageCount: block.usageCount + 1 }
              : block
          ),
        }));
      },
    }),
    {
      name: "blocks-quick-blocks",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ blocks: state.blocks }),
    }
  )
);


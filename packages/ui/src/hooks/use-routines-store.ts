// ============================================================================
// BLOCKS - Routines Store Hook (Zustand)
// ============================================================================

import { create } from "zustand";
import type { Routine, CreateRoutineInput } from "@blocks/core";
import { DexieStorage } from "@blocks/core";
import { v4 as uuidv4 } from "uuid";

interface RoutinesState {
  routines: Routine[];
  isLoading: boolean;
  error: string | null;
  loadRoutines: () => Promise<void>;
  createRoutine: (input: CreateRoutineInput) => Promise<Routine>;
  deleteRoutine: (id: string) => Promise<void>;
}

export const useRoutinesStore = create<RoutinesState>((set) => {
  let storage: DexieStorage | null = null;

  const getStorage = async () => {
    if (!storage) {
      storage = DexieStorage.getInstance();
      await storage.init();
    }
    return storage;
  };

  return {
    routines: [],
    isLoading: false,
    error: null,

    loadRoutines: async () => {
      set({ isLoading: true, error: null });
      try {
        const db = await getStorage();
        const routines = await db.getRoutines();
        set({ routines, isLoading: false });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    createRoutine: async (input: CreateRoutineInput) => {
      const db = await getStorage();
      const routine: Routine = {
        ...input,
        id: uuidv4(),
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.createRoutine(routine);
      set((state) => ({ routines: [...state.routines, routine] }));
      return routine;
    },

    deleteRoutine: async (id: string) => {
      const db = await getStorage();
      await db.deleteRoutine(id);
      set((state) => ({
        routines: state.routines.filter((r) => r.id !== id),
      }));
    },
  };
});

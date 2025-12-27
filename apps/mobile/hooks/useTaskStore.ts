// ============================================================================
// BLOCKS Mobile - Task Store Hook
// Zustand store for task management
// ============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import type { Task, TaskStatus, CreateTaskInput } from "@blocks/core";

// ============================================================================
// Types
// ============================================================================

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  
  // Actions
  loadTasks: () => Promise<void>;
  createTask: (input: Omit<CreateTaskInput, "createdAt" | "updatedAt">) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
}

// ============================================================================
// Store
// ============================================================================

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      
      loadTasks: async () => {
        set({ isLoading: true });
        // Tasks are already loaded from persistence
        set({ isLoading: false });
      },
      
      createTask: async (input) => {
        const now = new Date();
        const task: Task = {
          ...input,
          id: uuidv4(),
          timeSpent: 0,
          isRecurringInstance: false,
          createdAt: now,
          updatedAt: now,
        } as Task;
        
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
        
        return task;
      },
      
      updateTask: async (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },
      
      deleteTask: async (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      toggleTaskComplete: async (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const newStatus: TaskStatus = task.status === "done" ? "todo" : "done";
            return {
              ...task,
              status: newStatus,
              completedAt: newStatus === "done" ? new Date() : undefined,
              updatedAt: new Date(),
            };
          }),
        }));
      },
    }),
    {
      name: "blocks-tasks",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);


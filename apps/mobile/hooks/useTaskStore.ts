// ============================================================================
// BLOCKS Mobile - Task Store Hook
// Zustand store for task management
// ============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Task, TaskStatus, CreateTaskInput } from "@blocks/core";

// Generate UUID without crypto (React Native compatible)
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
          id: generateId(),
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


// ============================================================================
// BLOCKS - Task Store Hook (Zustand)
// ============================================================================

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from "@blocks/core";
import { TaskEngine, DexieStorage, calculateDuration } from "@blocks/core";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  currentTask: Task | null;

  // Actions
  loadTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, updates: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<Task>;
  startTask: (id: string) => Promise<Task>;
  setCurrentTask: (task: Task | null) => void;
  scheduleDoingTasks: () => Promise<void>;
  
  // Filtered getters
  getTasksByStatus: (status: TaskStatus) => Task[];
  getBacklogTasks: () => Task[];
  getTodayTasks: () => Task[];
  getCompletedTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  subscribeWithSelector((set, get) => {
    // Initialize storage
    let storage: DexieStorage | null = null;
    
    const getStorage = async () => {
      if (!storage) {
        storage = DexieStorage.getInstance();
        await storage.init();
      }
      return storage;
    };

    return {
      tasks: [],
      isLoading: false,
      error: null,
      currentTask: null,

      loadTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const db = await getStorage();
          const tasks = await db.getTasks();
          set({ tasks, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      createTask: async (input: CreateTaskInput) => {
        try {
          const db = await getStorage();
          const task = TaskEngine.createTask(input);
          await db.createTask(task);
          set((state) => ({ tasks: [...state.tasks, task] }));
          return task;
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      updateTask: async (id: string, updates: UpdateTaskInput) => {
        try {
          const db = await getStorage();
          const existingTask = get().tasks.find((t) => t.id === id);
          if (!existingTask) throw new Error("Task not found");

          const updatedTask = TaskEngine.updateTask(existingTask, updates);
          await db.updateTask(updatedTask);
          
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
            currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
          }));
          return updatedTask;
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      deleteTask: async (id: string) => {
        try {
          const db = await getStorage();
          await db.deleteTask(id);
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
            currentTask: state.currentTask?.id === id ? null : state.currentTask,
          }));
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      completeTask: async (id: string) => {
        const existingTask = get().tasks.find((t) => t.id === id);
        if (!existingTask) throw new Error("Task not found");

        const completedTask = TaskEngine.completeTask(existingTask);
        return get().updateTask(id, {
          status: completedTask.status,
          completedAt: completedTask.completedAt,
        });
      },

      startTask: async (id: string) => {
        const existingTask = get().tasks.find((t) => t.id === id);
        if (!existingTask) throw new Error("Task not found");

        const startedTask = TaskEngine.startTask(existingTask);
        const updated = await get().updateTask(id, {
          status: startedTask.status,
          startedAt: startedTask.startedAt,
        });
        set({ currentTask: updated });
        return updated;
      },

      setCurrentTask: (task: Task | null) => {
        set({ currentTask: task });
      },

      scheduleDoingTasks: async () => {
        try {
          const db = await getStorage();
          
          // 1. Get all tasks with status "doing"
          const doingTasks = get().tasks.filter((t) => t.status === "doing");
          
          if (doingTasks.length === 0) return;
          
          // 2. Sort by priority (1 = highest first, so ascending order)
          const sortedTasks = [...doingTasks].sort((a, b) => {
            const priorityA = parseInt(a.priority, 10);
            const priorityB = parseInt(b.priority, 10);
            return priorityA - priorityB;
          });
          
          // 3. Starting from current time, assign scheduledAt sequentially
          let currentTime = new Date();
          const updatedTasks: Task[] = [];
          
          for (const task of sortedTasks) {
            // Calculate duration: blockSize * blockCount
            const duration = calculateDuration(task.blockSize, task.blockCount);
            
            // Update task with scheduledAt and computed duration
            const updatedTask = TaskEngine.updateTask(task, {
              scheduledAt: new Date(currentTime),
              duration,
            });
            
            // Save to storage
            await db.updateTask(updatedTask);
            updatedTasks.push(updatedTask);
            
            // Move current time forward by the task's duration
            currentTime = new Date(currentTime.getTime() + duration * 60000);
          }
          
          // 4. Update state with all scheduled tasks
          set((state) => ({
            tasks: state.tasks.map((t) => {
              const updated = updatedTasks.find((u) => u.id === t.id);
              return updated || t;
            }),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      getTasksByStatus: (status: TaskStatus) => {
        return get().tasks.filter((t) => t.status === status);
      },

      getBacklogTasks: () => {
        return TaskEngine.sortByPriority(
          get().tasks.filter((t) => t.status === "backlog")
        );
      },

      getTodayTasks: () => {
        return TaskEngine.sortByPriority(
          get().tasks.filter((t) => t.status === "doing" || t.status === "todo")
        );
      },

      getCompletedTasks: () => {
        return get()
          .tasks.filter((t) => t.status === "done")
          .sort((a, b) => {
            if (!a.completedAt || !b.completedAt) return 0;
            return b.completedAt.getTime() - a.completedAt.getTime();
          });
      },
    };
  })
);


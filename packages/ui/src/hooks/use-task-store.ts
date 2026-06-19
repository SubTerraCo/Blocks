// ============================================================================
// BLOCKS - Task Store Hook (Zustand)
// ============================================================================

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, Routine } from "@blocks/core";
import { TaskEngine, DexieStorage, calculateDuration, clearTimelineForNewDay, spawnRoutineTasks, buildTimelineInsertPushBackUpdates, planScheduleDoingTasks } from "@blocks/core";

export interface ScheduleDoingTasksOptions {
  /** Task under now-bar with active timer (N-0025) */
  activeTrackingTaskId?: string;
  isTimerRunning?: boolean;
}

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
  scheduleDoingTasks: (options?: ScheduleDoingTasksOptions) => Promise<void>;
  clearDailyTimeline: () => Promise<number>;
  removeFromTimeline: (id: string) => Promise<Task>;
  addToTimeline: (id: string, scheduledAt: Date) => Promise<Task>;
  /** B-0022 · Drag-reschedule only — no push-back on other tasks */
  rescheduleTimelineTaskDrag: (id: string, scheduledAt: Date) => Promise<Task>;
  spawnRoutine: (routine: Routine, startAt?: Date) => Promise<Task[]>;
  /** Batch-update scheduledAt (timeline pause-sync) */
  shiftTimelineSchedules: (
    updates: { id: string; scheduledAt: Date }[],
  ) => Promise<void>;
  /** Push downstream tasks before inserting/scheduling at `scheduledAt` (N-0021) */
  applyTimelinePushBackForInsert: (
    insertId: string,
    scheduledAt: Date,
    durationMinutes: number,
  ) => Promise<void>;
  
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

      scheduleDoingTasks: async (options?: ScheduleDoingTasksOptions) => {
        try {
          const db = await getStorage();
          const settings = await db.getSettings();
          const doingTasks = get().tasks.filter((t) => t.status === "doing" && !t.isEvent);

          if (doingTasks.length === 0) return;

          const { tasksToSchedule, startAt } = planScheduleDoingTasks({
            doingTasks,
            behavior: settings.taskScheduleBehavior,
            activeTrackingTaskId: options?.activeTrackingTaskId,
            isTimerRunning: options?.isTimerRunning,
          });

          if (tasksToSchedule.length === 0) return;

          let currentTime = new Date(startAt);
          const updatedTasks: Task[] = [];

          for (const task of tasksToSchedule) {
            const duration = calculateDuration(task.blockSize, task.blockCount);

            const updatedTask = TaskEngine.updateTask(task, {
              scheduledAt: new Date(currentTime),
              duration,
            });

            await db.updateTask(updatedTask);
            updatedTasks.push(updatedTask);

            currentTime = new Date(currentTime.getTime() + duration * 60000);
          }

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

      clearDailyTimeline: async () => {
        try {
          const db = await getStorage();
          const { clearedCount, updatedTasks } = clearTimelineForNewDay(get().tasks);

          for (const task of updatedTasks) {
            await db.updateTask(task);
          }

          if (updatedTasks.length > 0) {
            const updatedIds = new Set(updatedTasks.map((t) => t.id));
            set((state) => ({
              tasks: state.tasks.map((t) => {
                const updated = updatedTasks.find((u) => u.id === t.id);
                return updated ?? t;
              }),
              currentTask:
                state.currentTask && updatedIds.has(state.currentTask.id)
                  ? null
                  : state.currentTask,
            }));
          }

          return clearedCount;
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      spawnRoutine: async (routine: Routine, startAt?: Date) => {
        try {
          const db = await getStorage();
          const spawned = spawnRoutineTasks(routine, {
            startAt: startAt ?? new Date(),
            status: "doing",
          });

          for (const task of spawned) {
            await db.createTask(task);
          }

          await db.incrementRoutineUsage(routine.id);

          set((state) => ({
            tasks: [...state.tasks, ...spawned],
          }));

          return spawned;
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      removeFromTimeline: async (id: string) => {
        const existingTask = get().tasks.find((t) => t.id === id);
        if (!existingTask) throw new Error("Task not found");

        const updated = TaskEngine.removeFromTimeline(existingTask);
        return get().updateTask(id, {
          status: updated.status,
          scheduledAt: updated.scheduledAt,
          startedAt: updated.startedAt,
        });
      },

      addToTimeline: async (id: string, scheduledAt: Date) => {
        const existingTask = get().tasks.find((t) => t.id === id);
        if (!existingTask) throw new Error("Task not found");

        const duration = calculateDuration(existingTask.blockSize, existingTask.blockCount);
        const pushUpdates = buildTimelineInsertPushBackUpdates(
          get().tasks,
          id,
          scheduledAt,
          duration,
        );

        if (pushUpdates.length > 0) {
          await get().shiftTimelineSchedules(pushUpdates);
        }

        const updated = TaskEngine.addToTimeline(existingTask, scheduledAt, duration);
        return get().updateTask(id, {
          status: updated.status,
          scheduledAt: updated.scheduledAt,
          duration: updated.duration,
          startedAt: updated.startedAt,
        });
      },

      rescheduleTimelineTaskDrag: async (id: string, scheduledAt: Date) => {
        return get().updateTask(id, { scheduledAt });
      },

      shiftTimelineSchedules: async (updates: { id: string; scheduledAt: Date }[]) => {
        if (updates.length === 0) return;
        const db = await getStorage();
        for (const { id, scheduledAt } of updates) {
          const existingTask = get().tasks.find((t) => t.id === id);
          if (!existingTask) continue;
          const patched = { ...existingTask, scheduledAt };
          await db.updateTask(patched);
        }
        set((state) => ({
          tasks: state.tasks.map((t) => {
            const hit = updates.find((u) => u.id === t.id);
            return hit ? { ...t, scheduledAt: hit.scheduledAt } : t;
          }),
        }));
      },

      applyTimelinePushBackForInsert: async (
        insertId: string,
        scheduledAt: Date,
        durationMinutes: number,
      ) => {
        const pushUpdates = buildTimelineInsertPushBackUpdates(
          get().tasks,
          insertId,
          scheduledAt,
          durationMinutes,
        );
        if (pushUpdates.length > 0) {
          await get().shiftTimelineSchedules(pushUpdates);
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


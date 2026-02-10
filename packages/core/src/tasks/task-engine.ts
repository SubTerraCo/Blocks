// ============================================================================
// BLOCKS - Task Engine
// Updated with new status values (Anytype-aligned)
// ============================================================================

import { v4 as uuidv4 } from "uuid";
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority } from "../types";
import { calculateDuration } from "../types";

/**
 * Get task duration, computing from blockSize × blockCount if available
 */
function getTaskDuration(task: Task): number {
  if (task.blockSize && task.blockCount) {
    return calculateDuration(task.blockSize, task.blockCount);
  }
  return task.duration ?? 30; // Default 30 minutes
}

/**
 * TaskEngine handles all task-related business logic
 */
export class TaskEngine {
  /**
   * Create a new task with generated ID and timestamps
   */
  static createTask(input: CreateTaskInput): Task {
    const now = new Date();
    return {
      ...input,
      id: uuidv4(),
      timeSpent: 0,
      isRecurringInstance: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update a task with new values
   */
  static updateTask(task: Task, updates: UpdateTaskInput): Task {
    return {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };
  }

  /**
   * Mark a task as done (completed)
   */
  static completeTask(task: Task): Task {
    return this.updateTask(task, {
      status: "done",
      completedAt: new Date(),
    });
  }

  /**
   * Start working on a task (move to "doing")
   */
  static startTask(task: Task): Task {
    return this.updateTask(task, {
      status: "doing",
      startedAt: new Date(),
    });
  }

  /**
   * Move task back to backlog with new priority/duration
   */
  static rescheduleTask(
    task: Task,
    newPriority?: TaskPriority,
    newDuration?: number
  ): Task {
    return this.updateTask(task, {
      status: "backlog",
      priority: newPriority ?? task.priority,
      duration: newDuration ?? task.duration,
      startedAt: undefined,
      scheduledAt: undefined,
    });
  }

  /**
   * Calculate time spent on task (if currently in progress)
   */
  static calculateTimeSpent(task: Task): number {
    if (!task.startedAt) return task.timeSpent;
    
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - task.startedAt.getTime()) / 60000);
    return task.timeSpent + elapsed;
  }

  /**
   * Check if task has exceeded its estimated duration
   */
  static isOvertime(task: Task): boolean {
    const timeSpent = this.calculateTimeSpent(task);
    const duration = getTaskDuration(task);
    return timeSpent > duration;
  }

  /**
   * Get overtime amount in minutes
   */
  static getOvertimeMinutes(task: Task): number {
    const timeSpent = this.calculateTimeSpent(task);
    const duration = getTaskDuration(task);
    return Math.max(0, timeSpent - duration);
  }

  /**
   * Sort tasks by priority (1 is highest)
   */
  static sortByPriority(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      const priorityA = parseInt(a.priority, 10);
      const priorityB = parseInt(b.priority, 10);
      return priorityA - priorityB;
    });
  }

  /**
   * Sort tasks by due date (earliest first)
   */
  static sortByDueDate(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }

  /**
   * Filter tasks by status
   */
  static filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
    return tasks.filter((task) => task.status === status);
  }

  /**
   * Get tasks that can fit in a given time slot
   */
  static getTasksForTimeSlot(tasks: Task[], availableMinutes: number): Task[] {
    return this.sortByPriority(tasks).filter((task) => {
      const duration = getTaskDuration(task);
      return duration <= availableMinutes && task.status === "backlog";
    });
  }

  /**
   * Calculate total duration of tasks
   */
  static calculateTotalDuration(tasks: Task[]): number {
    return tasks.reduce((total, task) => total + getTaskDuration(task), 0);
  }

  /**
   * Toggle subtask completion
   */
  static toggleSubtask(task: Task, subtaskId: string): Task {
    const subtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    
    // Check if all subtasks are completed
    const allCompleted = subtasks.length > 0 && subtasks.every((st) => st.completed);
    
    // Auto-complete task when all subtasks done (only if currently "doing")
    const shouldComplete = allCompleted && task.status === "doing";
    
    return this.updateTask(task, {
      subtasks,
      status: shouldComplete ? "done" : task.status,
      completedAt: shouldComplete ? new Date() : task.completedAt,
    });
  }

  /**
   * Add a subtask to a task
   */
  static addSubtask(task: Task, name: string): Task {
    return this.updateTask(task, {
      subtasks: [
        ...task.subtasks,
        { id: uuidv4(), name, completed: false },
      ],
    });
  }

  /**
   * Remove a subtask from a task
   */
  static removeSubtask(task: Task, subtaskId: string): Task {
    return this.updateTask(task, {
      subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
    });
  }

  /**
   * Get completion percentage for a task with subtasks
   */
  static getSubtaskProgress(task: Task): number {
    if (task.subtasks.length === 0) return task.status === "done" ? 100 : 0;
    const completed = task.subtasks.filter((st) => st.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  }
}

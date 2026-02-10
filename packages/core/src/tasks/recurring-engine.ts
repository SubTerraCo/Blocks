// ============================================================================
// BLOCKS - Recurring Task Engine
// Generates recurring task instances based on patterns
// ============================================================================

import { v4 as uuidv4 } from "uuid";
import type { Task, RecurrencePattern, DayOfWeek, RecurrenceType } from "../types";

// ============================================================================
// Types
// ============================================================================

interface RecurringTaskInstance {
  task: Omit<Task, "id" | "createdAt" | "updatedAt">;
  scheduledDate: Date;
}

// ============================================================================
// Day of week mapping
// ============================================================================

const DAY_INDEX_MAP: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get the next occurrence date for a recurring task
 */
export function getNextOccurrence(
  pattern: RecurrencePattern,
  fromDate: Date = new Date()
): Date | null {
  const { type, interval = 1, daysOfWeek, dayOfMonth, endDate, excludeDates = [] } = pattern;
  
  // Check if we've passed the end date
  if (endDate && fromDate > endDate) {
    return null;
  }
  
  let nextDate = new Date(fromDate);
  nextDate.setHours(0, 0, 0, 0);
  
  switch (type) {
    case "none":
      return null;
      
    case "daily":
      nextDate.setDate(nextDate.getDate() + interval);
      break;
      
    case "weekly":
      if (daysOfWeek && daysOfWeek.length > 0) {
        // Find next matching day of week
        const targetDays = daysOfWeek.map((d) => DAY_INDEX_MAP[d]).sort((a, b) => a - b);
        const currentDay = nextDate.getDay();
        
        // Find next day in this week or next week
        let foundThisWeek = false;
        for (const targetDay of targetDays) {
          if (targetDay > currentDay) {
            nextDate.setDate(nextDate.getDate() + (targetDay - currentDay));
            foundThisWeek = true;
            break;
          }
        }
        
        if (!foundThisWeek && targetDays[0] !== undefined) {
          // Move to next week, first matching day
          const daysUntilNextWeek = 7 * interval - currentDay + targetDays[0];
          nextDate.setDate(nextDate.getDate() + daysUntilNextWeek);
        }
      } else {
        // No specific days, just add weeks
        nextDate.setDate(nextDate.getDate() + 7 * interval);
      }
      break;
      
    case "monthly":
      if (dayOfMonth) {
        // Move to next month
        nextDate.setMonth(nextDate.getMonth() + interval);
        nextDate.setDate(Math.min(dayOfMonth, getDaysInMonth(nextDate)));
      } else {
        nextDate.setMonth(nextDate.getMonth() + interval);
      }
      break;
      
    case "custom":
      // For custom, we'd parse the iCal RRULE, but for now just return null
      return null;
  }
  
  // Check if date is excluded
  if (isDateExcluded(nextDate, excludeDates)) {
    // Recursively find next valid date
    return getNextOccurrence(pattern, nextDate);
  }
  
  // Check end date again
  if (endDate && nextDate > endDate) {
    return null;
  }
  
  return nextDate;
}

/**
 * Generate recurring instances for a time range
 */
export function generateRecurringInstances(
  parentTask: Task,
  startDate: Date,
  endDate: Date
): RecurringTaskInstance[] {
  if (!parentTask.recurrencePattern || parentTask.recurrence === "none") {
    return [];
  }
  
  const instances: RecurringTaskInstance[] = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  // Use parent task's scheduled time if available
  const scheduledTime = parentTask.scheduledAt
    ? {
        hours: parentTask.scheduledAt.getHours(),
        minutes: parentTask.scheduledAt.getMinutes(),
      }
    : { hours: 9, minutes: 0 }; // Default to 9 AM
  
  const maxIterations = 365; // Prevent infinite loops
  let iterations = 0;
  
  while (currentDate <= endDate && iterations < maxIterations) {
    const nextOccurrence = getNextOccurrence(parentTask.recurrencePattern, currentDate);
    
    if (!nextOccurrence || nextOccurrence > endDate) {
      break;
    }
    
    // Check max occurrences
    if (
      parentTask.recurrencePattern.occurrences &&
      instances.length >= parentTask.recurrencePattern.occurrences
    ) {
      break;
    }
    
    // Create instance
    const scheduledAt = new Date(nextOccurrence);
    scheduledAt.setHours(scheduledTime.hours, scheduledTime.minutes, 0, 0);
    
    instances.push({
      task: {
        ...parentTask,
        parentTaskId: parentTask.id,
        isRecurringInstance: true,
        status: "todo", // Reset status for new instance
        timeSpent: 0,
        completedAt: undefined,
        scheduledAt,
        subtasks: parentTask.subtasks.map((s) => ({
          ...s,
          id: uuidv4(), // New IDs for subtasks
          completed: false,
        })),
      },
      scheduledDate: nextOccurrence,
    });
    
    currentDate = new Date(nextOccurrence);
    currentDate.setDate(currentDate.getDate() + 1);
    iterations++;
  }
  
  return instances;
}

/**
 * Create a task instance from a recurring parent
 */
export function createRecurringInstance(parentTask: Task, date: Date): Partial<Task> {
  const scheduledAt = new Date(date);
  
  if (parentTask.scheduledAt) {
    scheduledAt.setHours(
      parentTask.scheduledAt.getHours(),
      parentTask.scheduledAt.getMinutes(),
      0,
      0
    );
  }
  
  return {
    name: parentTask.name,
    description: parentTask.description,
    assigneeId: parentTask.assigneeId,
    accessContexts: parentTask.accessContexts,
    blockSize: parentTask.blockSize,
    blockCount: parentTask.blockCount,
    linkedProjectId: parentTask.linkedProjectId,
    priority: parentTask.priority,
    status: "todo",
    duration: parentTask.duration,
    location: parentTask.location,
    category: parentTask.category,
    tags: [...parentTask.tags],
    color: parentTask.color,
    scheduledAt,
    reminders: [...parentTask.reminders],
    subtasks: parentTask.subtasks.map((s) => ({
      id: uuidv4(),
      name: s.name,
      completed: false,
    })),
    notes: parentTask.notes,
    parentTaskId: parentTask.id,
    isRecurringInstance: true,
    isQuickAdd: parentTask.isQuickAdd,
    isPutzing: parentTask.isPutzing,
  };
}

/**
 * Get next N occurrences for preview
 */
export function getNextOccurrences(
  pattern: RecurrencePattern,
  count: number = 5,
  fromDate: Date = new Date()
): Date[] {
  const occurrences: Date[] = [];
  let currentDate = fromDate;
  
  for (let i = 0; i < count && i < 100; i++) {
    const next = getNextOccurrence(pattern, currentDate);
    if (!next) break;
    
    occurrences.push(next);
    currentDate = new Date(next);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return occurrences;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function isDateExcluded(date: Date, excludeDates: Date[]): boolean {
  const dateStr = date.toISOString().split("T")[0];
  return excludeDates.some((d) => d.toISOString().split("T")[0] === dateStr);
}

/**
 * Build a simple recurrence pattern
 */
export function buildRecurrencePattern(
  type: RecurrenceType,
  options: {
    interval?: number;
    daysOfWeek?: DayOfWeek[];
    dayOfMonth?: number;
    endDate?: Date;
    occurrences?: number;
  } = {}
): RecurrencePattern {
  return {
    type,
    interval: options.interval ?? 1,
    daysOfWeek: options.daysOfWeek,
    dayOfMonth: options.dayOfMonth,
    endDate: options.endDate,
    occurrences: options.occurrences,
    excludeDates: [],
  };
}


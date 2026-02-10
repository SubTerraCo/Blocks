// ============================================================================
// BLOCKS - Notification System
// Handles native notifications, task reminders, and alerts
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import type { Task } from "@blocks/core";

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 
  | "timer-complete" 
  | "timer-overtime" 
  | "task-reminder" 
  | "daily-summary"
  | "task-due";

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  taskId?: string;
  data?: Record<string, unknown>;
}

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  timerAlerts: boolean;
  dailySummary: boolean;
  dailySummaryTime: string; // e.g., "20:00"
  reminderMinutesBefore: number; // Default 15
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  taskReminders: true,
  timerAlerts: true,
  dailySummary: false,
  dailySummaryTime: "20:00",
  reminderMinutesBefore: 15,
};

const SETTINGS_KEY = "blocks-notification-settings";

// ============================================================================
// Storage helpers
// ============================================================================

function loadSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load notification settings:", e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save notification settings:", e);
  }
}

// ============================================================================
// Notification Service
// ============================================================================

class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings;
  private scheduledReminders: Map<string, NodeJS.Timeout> = new Map();
  private dailySummaryTimeout: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.settings = loadSettings();
    this.setupDailySummary();
  }
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return false;
    }
    
    if (Notification.permission === "granted") {
      return true;
    }
    
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    
    return false;
  }
  
  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.settings.enabled && Notification.permission === "granted";
  }
  
  // Get permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
  
  // Update settings
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    saveSettings(this.settings);
    
    // Reschedule daily summary if time changed
    if (newSettings.dailySummaryTime || newSettings.dailySummary !== undefined) {
      this.setupDailySummary();
    }
  }
  
  // Get current settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }
  
  // Send a notification
  async send(payload: NotificationPayload): Promise<void> {
    if (!this.isEnabled()) return;
    
    // Check specific notification type settings
    switch (payload.type) {
      case "timer-complete":
      case "timer-overtime":
        if (!this.settings.timerAlerts) return;
        break;
      case "task-reminder":
      case "task-due":
        if (!this.settings.taskReminders) return;
        break;
      case "daily-summary":
        if (!this.settings.dailySummary) return;
        break;
    }
    
    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: "/icons/icon-192.png",
        tag: payload.type + (payload.taskId || ""),
        requireInteraction: payload.type === "task-reminder",
      });
      
      notification.onclick = () => {
        window.focus();
        // Could dispatch an event here to navigate to the task
        if (payload.taskId) {
          window.dispatchEvent(new CustomEvent("notification-click", {
            detail: { taskId: payload.taskId, type: payload.type },
          }));
        }
        notification.close();
      };
    } catch (e) {
      console.error("Failed to send notification:", e);
    }
  }
  
  // Schedule a reminder for a task
  scheduleReminder(task: Task): void {
    if (!this.settings.taskReminders || !task.scheduledAt) return;
    
    // Clear any existing reminder for this task
    this.clearReminder(task.id);
    
    const reminderTime = new Date(task.scheduledAt);
    reminderTime.setMinutes(reminderTime.getMinutes() - this.settings.reminderMinutesBefore);
    
    const now = Date.now();
    const delay = reminderTime.getTime() - now;
    
    // Only schedule if in the future
    if (delay > 0) {
      const timeout = setTimeout(() => {
        this.send({
          type: "task-reminder",
          title: "Upcoming Task",
          body: `"${task.name}" starts in ${this.settings.reminderMinutesBefore} minutes`,
          taskId: task.id,
        });
        this.scheduledReminders.delete(task.id);
      }, delay);
      
      this.scheduledReminders.set(task.id, timeout);
    }
  }
  
  // Clear a scheduled reminder
  clearReminder(taskId: string): void {
    const timeout = this.scheduledReminders.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledReminders.delete(taskId);
    }
  }
  
  // Clear all reminders
  clearAllReminders(): void {
    this.scheduledReminders.forEach((timeout) => clearTimeout(timeout));
    this.scheduledReminders.clear();
  }
  
  // Setup daily summary notification
  private setupDailySummary(): void {
    if (this.dailySummaryTimeout) {
      clearTimeout(this.dailySummaryTimeout);
      this.dailySummaryTimeout = null;
    }
    
    if (!this.settings.dailySummary) return;
    
    const scheduleNext = () => {
      const [hours, minutes] = this.settings.dailySummaryTime.split(":").map(Number);
      const now = new Date();
      const summaryTime = new Date();
      summaryTime.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (summaryTime <= now) {
        summaryTime.setDate(summaryTime.getDate() + 1);
      }
      
      const delay = summaryTime.getTime() - now.getTime();
      
      this.dailySummaryTimeout = setTimeout(() => {
        // Dispatch event to get summary data
        window.dispatchEvent(new CustomEvent("daily-summary-trigger"));
        // Schedule next day
        scheduleNext();
      }, delay);
    };
    
    scheduleNext();
  }
  
  // Send daily summary
  sendDailySummary(completedCount: number, totalTimeMinutes: number): void {
    if (!this.settings.dailySummary) return;
    
    const hours = Math.floor(totalTimeMinutes / 60);
    const mins = totalTimeMinutes % 60;
    const timeStr = hours > 0 
      ? `${hours}h ${mins}m` 
      : `${mins}m`;
    
    this.send({
      type: "daily-summary",
      title: "Daily Summary",
      body: completedCount > 0
        ? `You completed ${completedCount} task${completedCount > 1 ? "s" : ""} today (${timeStr} tracked)`
        : "No tasks completed today. There's always tomorrow!",
    });
  }
  
  // Timer overtime notification
  sendTimerOvertime(taskName: string, overtimeMinutes: number): void {
    this.send({
      type: "timer-overtime",
      title: "Time's Up!",
      body: `"${taskName}" has exceeded its time by ${overtimeMinutes} minutes`,
    });
  }
  
  // Timer complete notification
  sendTimerComplete(taskName: string, timeSpent: number): void {
    this.send({
      type: "timer-complete",
      title: "Timer Stopped",
      body: `"${taskName}" - ${timeSpent} minutes tracked`,
    });
  }
  
  // Task due soon notification
  sendTaskDue(task: Task): void {
    if (!task.dueDate) return;
    
    this.send({
      type: "task-due",
      title: "Task Due Soon",
      body: `"${task.name}" is due today`,
      taskId: task.id,
    });
  }
}

// ============================================================================
// React Hook
// ============================================================================

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const [settings, setSettings] = useState<NotificationSettings>(loadSettings);
  
  const service = NotificationService.getInstance();
  
  // Check permission on mount
  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermissionStatus(Notification.permission);
    }
  }, []);
  
  const requestPermission = useCallback(async () => {
    const granted = await service.requestPermission();
    setPermissionStatus(Notification.permission);
    return granted;
  }, [service]);
  
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    service.updateSettings(newSettings);
    setSettings(service.getSettings());
  }, [service]);
  
  const scheduleReminder = useCallback((task: Task) => {
    service.scheduleReminder(task);
  }, [service]);
  
  const clearReminder = useCallback((taskId: string) => {
    service.clearReminder(taskId);
  }, [service]);
  
  const sendNotification = useCallback((payload: NotificationPayload) => {
    service.send(payload);
  }, [service]);
  
  const sendDailySummary = useCallback((completedCount: number, totalTimeMinutes: number) => {
    service.sendDailySummary(completedCount, totalTimeMinutes);
  }, [service]);
  
  return {
    permissionStatus,
    isEnabled: settings.enabled && permissionStatus === "granted",
    settings,
    requestPermission,
    updateSettings,
    scheduleReminder,
    clearReminder,
    sendNotification,
    sendDailySummary,
  };
}

// Export singleton for non-React usage
export const notificationService = NotificationService.getInstance();


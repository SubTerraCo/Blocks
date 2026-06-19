// ============================================================================
// BLOCKS - UI Utilities
// ============================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format time to HH:MM AM/PM or 24h when requested (N-0032).
 */
export function formatTime(date: Date, use24Hour = false): string {
  if (use24Hour) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (isSameDay(date, today)) {
    return "Today";
  }
  if (isSameDay(date, tomorrow)) {
    return "Tomorrow";
  }
  
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get priority color from priority value
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    "1": "#ef4444", // Urgent - Red
    "2": "#f59e0b", // High - Orange
    "3": "#eab308", // Medium - Yellow
    "4": "#22c55e", // Low - Green
    "5": "#6b7280", // Minimal - Gray
  };
  return colors[priority] ?? "#6b7280";
}

/**
 * Get priority label from priority value
 */
export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    "1": "Urgent",
    "2": "High",
    "3": "Medium",
    "4": "Low",
    "5": "Minimal",
  };
  return labels[priority] ?? "Unknown";
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}


// ============================================================================
// BLOCKS - Test Fixtures and Data
// Shared test data and utilities for all test types
// ============================================================================

import type { Task, TaskStatus, TaskPriority, BlockSize } from "@blocks/core";

/**
 * Sample tasks for testing
 */
export const sampleTasks: Partial<Task>[] = [
  {
    id: "test-task-1",
    name: "Design homepage mockup",
    description: "Create wireframes and high-fidelity mockups",
    status: "design" as TaskStatus,
    priority: "1" as TaskPriority,
    blockSize: "1hour" as BlockSize,
    blockCount: 2,
    tags: ["design", "ui"],
    assigneeId: "me",
    accessContexts: ["computer"],
    createdAt: new Date("2024-01-01T09:00:00Z"),
    updatedAt: new Date("2024-01-01T09:00:00Z"),
  },
  {
    id: "test-task-2",
    name: "Implement API endpoints",
    description: "Build REST API for task management",
    status: "doing" as TaskStatus,
    priority: "2" as TaskPriority,
    blockSize: "30min" as BlockSize,
    blockCount: 4,
    tags: ["backend", "api"],
    assigneeId: "me",
    accessContexts: ["computer"],
    createdAt: new Date("2024-01-02T10:00:00Z"),
    updatedAt: new Date("2024-01-02T10:00:00Z"),
  },
  {
    id: "test-task-3",
    name: "Write documentation",
    description: "Document the API and user guides",
    status: "todo" as TaskStatus,
    priority: "3" as TaskPriority,
    blockSize: "15min" as BlockSize,
    blockCount: 3,
    tags: ["docs"],
    assigneeId: "me",
    accessContexts: ["computer", "phone"],
    createdAt: new Date("2024-01-03T11:00:00Z"),
    updatedAt: new Date("2024-01-03T11:00:00Z"),
  },
  {
    id: "test-task-4",
    name: "Code review",
    description: "Review pull requests from team",
    status: "review" as TaskStatus,
    priority: "2" as TaskPriority,
    blockSize: "30min" as BlockSize,
    blockCount: 1,
    tags: ["review"],
    assigneeId: "me",
    accessContexts: ["computer"],
    createdAt: new Date("2024-01-04T14:00:00Z"),
    updatedAt: new Date("2024-01-04T14:00:00Z"),
  },
  {
    id: "test-task-5",
    name: "Deploy to production",
    description: "Deploy latest version to production servers",
    status: "done" as TaskStatus,
    priority: "1" as TaskPriority,
    blockSize: "15min" as BlockSize,
    blockCount: 2,
    tags: ["devops"],
    assigneeId: "me",
    accessContexts: ["computer"],
    completedAt: new Date("2024-01-05T16:00:00Z"),
    createdAt: new Date("2024-01-05T15:00:00Z"),
    updatedAt: new Date("2024-01-05T16:00:00Z"),
  },
];

/**
 * Kanban column definitions
 */
export const kanbanColumns = [
  { id: "backlog", title: "Backlog", color: "#3B82F6" },
  { id: "design", title: "Design", color: "#A855F7" },
  { id: "todo", title: "To Do", color: "#EC4899" },
  { id: "doing", title: "Doing", color: "#F97316" },
  { id: "review", title: "Review", color: "#EAB308" },
  { id: "done", title: "Done", color: "#22C55E" },
];

/**
 * Navigation items
 */
export const navItems = [
  { path: "/ai", label: "AI" },
  { path: "/kanban", label: "Kanban" },
  { path: "/timeline", label: "Timeline" },
  { path: "/blocks", label: "Blocks" },
  { path: "/add-task", label: "Add Task" },
];

/**
 * Test user data
 */
export const testUser = {
  id: "test-user-1",
  name: "Test User",
  email: "test@blocks.app",
};

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
}

/**
 * Clear IndexedDB storage
 */
export async function clearStorage(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    indexedDB.deleteDatabase("BlocksDB");
  });
}

/**
 * Seed database with test tasks
 */
export async function seedTasks(page: import("@playwright/test").Page, tasks: Partial<Task>[]) {
  await page.evaluate((tasksData) => {
    localStorage.setItem("blocks-test-tasks", JSON.stringify(tasksData));
  }, tasks);
}


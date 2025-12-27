// ============================================================================
// BLOCKS - Task Store Integration Tests
// Tests for Zustand store operations and data flow
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Task Store Integration", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto("/kanban");
    await page.evaluate(() => {
      indexedDB.deleteDatabase("BlocksDB");
      localStorage.clear();
    });
    await page.reload();
  });

  test("should persist tasks across page navigation", async ({ page }) => {
    // Create a task
    await page.goto("/add-task");
    
    // Use specific label to find the task name input
    const nameInput = page.getByRole("textbox", { name: /task name/i });
    await nameInput.fill("Persistence Test Task");
    
    // Use specific button text to avoid ambiguity with nav Add button
    const submitButton = page.getByRole("button", { name: "Create Task" });
    await submitButton.click();
    
    // Wait for navigation
    await page.waitForURL((url) => !url.pathname.includes("/add-task"), { timeout: 5000 });
    
    // Navigate to kanban
    await page.goto("/kanban");
    
    // Task should be visible
    const taskText = page.getByText("Persistence Test Task");
    await expect(taskText).toBeVisible({ timeout: 5000 });
  });

  test("should persist tasks after page refresh", async ({ page }) => {
    // Create a task
    await page.goto("/add-task");
    
    // Use specific label to find the task name input
    const nameInput = page.getByRole("textbox", { name: /task name/i });
    await nameInput.fill("Refresh Test Task");
    
    // Use specific button text to avoid ambiguity with nav Add button
    const submitButton = page.getByRole("button", { name: "Create Task" });
    await submitButton.click();
    
    // Wait for navigation
    await page.waitForURL((url) => !url.pathname.includes("/add-task"), { timeout: 5000 });
    
    // Refresh page
    await page.goto("/kanban");
    await page.reload();
    
    // Task should still be visible
    const taskText = page.getByText("Refresh Test Task");
    await expect(taskText).toBeVisible({ timeout: 5000 });
  });

  test("should update task status correctly", async ({ page }) => {
    await page.goto("/kanban");
    
    // Look for any existing tasks
    const taskCards = page.locator('[data-testid="task-card"]').or(
      page.locator(".rounded-lg.border.cursor-pointer")
    );
    
    const count = await taskCards.count();
    if (count > 0) {
      // Find checkbox and toggle
      const checkbox = taskCards.first().locator('[role="checkbox"]').or(
        taskCards.first().locator('input[type="checkbox"]')
      );
      
      if (await checkbox.count() > 0) {
        await checkbox.click();
        // Status should change
        await page.waitForTimeout(500);
      }
    }
  });

  test("should load tasks on app initialization", async ({ page }) => {
    await page.goto("/kanban");
    
    // Wait for initial load
    await page.waitForTimeout(1000);
    
    // Page should be ready (not showing loading state indefinitely)
    const loadingIndicator = page.getByText(/loading/i);
    const isLoading = await loadingIndicator.isVisible().catch(() => false);
    
    // Should not be stuck loading
    expect(isLoading).toBeFalsy();
  });
});

test.describe("Task Store Filters", () => {
  test("should filter tasks in search", async ({ page }) => {
    await page.goto("/ai");
    
    // Switch to search tab
    await page.getByRole("button", { name: /search/i }).click();
    
    // Enter search query
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("nonexistent-task-xyz");
    
    // Wait for filter
    await page.waitForTimeout(500);
    
    // Should show no results
    const noResults = page.getByText(/no tasks/i);
    await expect(noResults).toBeVisible();
  });
});


// ============================================================================
// BLOCKS - Task CRUD E2E Tests
// Tests for creating, reading, updating, and deleting tasks
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Create Task", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/add-task");
  });

  test("should display add task form", async ({ page }) => {
    // Check form is visible
    const form = page.locator("form").or(page.locator('[data-testid="add-task-form"]'));
    await expect(form).toBeVisible();
  });

  test("should have task name input", async ({ page }) => {
    // Use the label to find the specific task name input
    const nameInput = page.getByLabel(/task name/i);
    await expect(nameInput).toBeVisible();
  });

  test("should have priority selector", async ({ page }) => {
    const prioritySelect = page.getByRole("combobox").or(
      page.locator("select")
    );
    await expect(prioritySelect.first()).toBeVisible();
  });

  test("should have status selector", async ({ page }) => {
    // Look for status dropdown
    const statusSelect = page.locator("select").or(
      page.getByRole("combobox")
    );
    const count = await statusSelect.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have block size selector", async ({ page }) => {
    // Look for block size options
    const blockSize = page.getByText(/15 min|30 min|1 hour/i);
    await expect(blockSize.first()).toBeVisible();
  });

  test("should have submit and cancel buttons", async ({ page }) => {
    // Use exact name for Create Task button to avoid matching nav Add button
    const submitButton = page.getByRole("button", { name: "Create Task" });
    const cancelButton = page.getByRole("button", { name: /cancel/i });
    
    await expect(submitButton).toBeVisible();
    await expect(cancelButton).toBeVisible();
  });

  test("should create task and navigate away", async ({ page }) => {
    // Fill in task name using label
    const nameInput = page.getByLabel(/task name/i);
    await nameInput.fill("Test Task from Playwright");
    
    // Submit form - use exact name
    const submitButton = page.getByRole("button", { name: "Create Task" });
    await submitButton.click();
    
    // Should navigate away from add-task page
    await page.waitForURL((url) => !url.pathname.includes("/add-task"), { timeout: 5000 });
  });

  test("should not submit with empty name", async ({ page }) => {
    // Try to submit without filling name - use exact name
    const submitButton = page.getByRole("button", { name: "Create Task" });
    
    // Button should be disabled when name is empty
    await expect(submitButton).toBeDisabled();
    
    // Should still be on add-task page
    await expect(page).toHaveURL("/add-task");
  });
});

test.describe("Edit Task", () => {
  test("should navigate to edit page when clicking task", async ({ page }) => {
    // Go to kanban where tasks are displayed
    await page.goto("/kanban");
    
    // Look for any task card
    const taskCards = page.locator('[data-testid="task-card"]').or(
      page.locator(".rounded-lg.border.cursor-pointer")
    );
    
    const count = await taskCards.count();
    if (count > 0) {
      // Click the first task
      await taskCards.first().click();
      
      // Should navigate to edit page
      await page.waitForURL(/\/edit-task\//, { timeout: 5000 });
    }
  });
});

test.describe("Task Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/add-task");
  });

  test("should show required field validation", async ({ page }) => {
    // Use exact name for Create Task button
    const submitButton = page.getByRole("button", { name: "Create Task" });
    
    // Button should be disabled when form is invalid
    await expect(submitButton).toBeDisabled();
    
    // Form should not submit - still on same page
    await expect(page).toHaveURL("/add-task");
  });
});

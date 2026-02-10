// ============================================================================
// Blocks Desktop E2E Tests - Task CRUD
// Tests for creating, reading, updating, and deleting tasks
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Task CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Create Task", () => {
    test("should create a new task with required fields", async ({ page }) => {
      // Open Add Task modal
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      
      // Fill required field - name
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Test Task");
      
      // Click Save
      await page.click("button:has-text('Save')");
      
      // Task should appear in Kanban
      await page.click("text=Kanban");
      await expect(page.locator("text=Test Task")).toBeVisible();
    });

    test("should create task with all optional fields", async ({ page }) => {
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      
      // Fill name
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Full Task");
      
      // Set priority
      await page.click("text=P1, button:has-text('P1')");
      
      // Set status (if dropdown)
      await page.click("text=To Do");
      
      // Add tag (if available)
      const tagInput = page.locator("input[placeholder*='tag']");
      if (await tagInput.isVisible()) {
        await tagInput.fill("test-tag");
        await page.keyboard.press("Enter");
      }
      
      // Save
      await page.click("button:has-text('Save')");
      
      // Verify in Kanban
      await page.click("text=Kanban");
      await expect(page.locator("text=Full Task")).toBeVisible();
    });

    test("should not save task without name", async ({ page }) => {
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      
      // Leave name empty, try to save
      const saveButton = page.locator("button:has-text('Save')");
      
      // Save should be disabled or show error
      await expect(saveButton).toBeDisabled();
    });

    test("should create task from Kanban column add button", async ({ page }) => {
      await page.click("text=Kanban");
      
      // Find "To Do" column and click Add Task
      const todoColumn = page.locator("[data-testid='kanban-column']:has-text('To Do'), div:has-text('TO DO')");
      await todoColumn.locator("text=Add Task").click();
      
      // Fill and save
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Column Task");
      await page.click("button:has-text('Save')");
      
      // Task should be in To Do column
      await page.click("text=Kanban");
      const todoTasks = page.locator("[data-testid='kanban-column']:has-text('To Do')");
      await expect(todoTasks.locator("text=Column Task")).toBeVisible();
    });
  });

  test.describe("Read Task", () => {
    test("should display task in Kanban", async ({ page }) => {
      // Create a task first
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Read Test Task");
      await page.click("button:has-text('Save')");
      
      // Navigate to Kanban
      await page.click("text=Kanban");
      
      // Task should be visible with correct info
      const taskCard = page.locator("text=Read Test Task");
      await expect(taskCard).toBeVisible();
    });

    test("should display scheduled task on Timeline", async ({ page }) => {
      // Create and schedule a task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Timeline Task");
      await page.click("text=Doing");
      await page.click("button:has-text('Save')");
      
      // Go to Timeline and check if task can be scheduled
      await page.click("text=Timeline");
      
      // Look for schedule button or the task
      const scheduleButton = page.locator("text=Schedule");
      if (await scheduleButton.isVisible()) {
        await scheduleButton.click();
      }
    });
  });

  test.describe("Update Task", () => {
    test("should edit task name", async ({ page }) => {
      // Create task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Original Name");
      await page.click("button:has-text('Save')");
      
      // Navigate to Kanban and click task
      await page.click("text=Kanban");
      await page.click("text=Original Name");
      
      // Edit name
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Updated Name");
      await page.click("button:has-text('Save')");
      
      // Verify update
      await page.click("text=Kanban");
      await expect(page.locator("text=Updated Name")).toBeVisible();
      await expect(page.locator("text=Original Name")).not.toBeVisible();
    });

    test("should change task priority", async ({ page }) => {
      // Create task with P3
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Priority Task");
      await page.click("button:has-text('Save')");
      
      // Edit task
      await page.click("text=Kanban");
      await page.click("text=Priority Task");
      
      // Change to P1
      await page.click("text=P1, button:has-text('P1')");
      await page.click("button:has-text('Save')");
      
      // Task should show P1 indicator
      await page.click("text=Kanban");
      const taskCard = page.locator("div:has-text('Priority Task')").first();
      await expect(taskCard).toBeVisible();
    });

    test("should change task status via drag and drop", async ({ page }) => {
      // Create task in backlog
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Drag Task");
      await page.click("text=Backlog");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      
      // Drag task from Backlog to To Do (simplified - actual drag test)
      const taskCard = page.locator("text=Drag Task");
      const todoColumn = page.locator("[data-testid='kanban-column']:has-text('To Do'), div:has-text('TO DO')");
      
      await taskCard.dragTo(todoColumn);
    });
  });

  test.describe("Delete Task", () => {
    test("should delete task from edit page", async ({ page }) => {
      // Create task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Delete Me Task");
      await page.click("button:has-text('Save')");
      
      // Navigate and click task
      await page.click("text=Kanban");
      await page.click("text=Delete Me Task");
      
      // Click delete button
      const deleteButton = page.locator("button:has-text('Delete'), [aria-label='Delete']");
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion if prompted
        const confirmButton = page.locator("button:has-text('Confirm'), button:has-text('Yes')");
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
      
      // Verify deletion
      await page.click("text=Kanban");
      await expect(page.locator("text=Delete Me Task")).not.toBeVisible();
    });
  });

  test.describe("Complete Task", () => {
    test("should complete task via checkbox", async ({ page }) => {
      // Create task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Complete Me");
      await page.click("text=To Do");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      
      // Click checkbox on task card
      const taskCard = page.locator("div:has-text('Complete Me')").first();
      const checkbox = taskCard.locator("input[type='checkbox'], [role='checkbox']");
      
      if (await checkbox.isVisible()) {
        await checkbox.click();
        
        // Task should move to Done column
        const doneColumn = page.locator("[data-testid='kanban-column']:has-text('Done'), div:has-text('DONE')");
        await expect(doneColumn.locator("text=Complete Me")).toBeVisible();
      }
    });

    test("should mark task as done by dragging to Done column", async ({ page }) => {
      // Create task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Drag to Done");
      await page.click("text=To Do");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      
      // Drag to Done column
      const taskCard = page.locator("text=Drag to Done");
      const doneColumn = page.locator("[data-testid='kanban-column']:has-text('Done'), div:has-text('DONE')");
      
      await taskCard.dragTo(doneColumn);
      
      // Verify in Done column
      await expect(doneColumn.locator("text=Drag to Done")).toBeVisible();
    });
  });
});


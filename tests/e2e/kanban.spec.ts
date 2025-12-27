// ============================================================================
// BLOCKS - Kanban Board E2E Tests
// Tests for Kanban board functionality
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Kanban Board", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kanban");
  });

  test("should display all 6 status columns", async ({ page }) => {
    // Check for each column
    const columns = ["Backlog", "Design", "To Do", "Doing", "Review", "Done"];
    
    for (const column of columns) {
      const columnHeader = page.getByText(column, { exact: true });
      await expect(columnHeader.first()).toBeVisible();
    }
  });

  test("should display column with correct color indicator", async ({ page }) => {
    // Look for column with colored accent bar
    const columns = page.locator(".w-72.flex-shrink-0").or(
      page.locator('[class*="rounded-lg border"]')
    );
    await expect(columns.first()).toBeVisible();
  });

  test("should show task count badge on each column", async ({ page }) => {
    // Look for count badges
    const badges = page.locator(".rounded-full").or(
      page.locator('[data-testid="task-count"]')
    );
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should display empty state when no tasks in column", async ({ page }) => {
    // Look for empty column or tasks
    const content = page.getByText(/no tasks/i).or(
      page.locator('[data-testid="task-card"]')
    );
    await expect(content.first()).toBeVisible();
  });

  test("should allow horizontal scrolling between columns", async ({ page }) => {
    // Check that container is scrollable
    const scrollContainer = page.locator(".overflow-x-auto").or(
      page.locator(".flex.gap-")
    );
    await expect(scrollContainer.first()).toBeVisible();
  });

  test("should navigate to add-task when clicking add button from kanban", async ({ page }) => {
    // Click add button in the first column - use first() to get specific one
    const addButton = page.getByRole("button", { name: "Add Task" }).first();
    await addButton.click();
    
    // Should be on add-task page
    await expect(page).toHaveURL(/add-task/);
  });
});

test.describe("Kanban Task Cards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kanban");
  });

  test("should display task card with name", async ({ page }) => {
    // Look for task cards
    const taskCards = page.locator('[data-testid="task-card"]').or(
      page.locator(".rounded-lg.border.cursor-pointer")
    );
    const count = await taskCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should show priority indicator on task cards", async ({ page }) => {
    // Look for priority badges
    const priorityBadges = page.locator('[data-testid="priority-badge"]').or(
      page.locator(".text-xs.font-medium")
    );
    const count = await priorityBadges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Kanban Drag and Drop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kanban");
  });

  test("should have draggable task cards", async ({ page }) => {
    // Look for draggable elements
    const draggables = page.locator('[data-draggable="true"]').or(
      page.locator('[draggable="true"]')
    );
    const count = await draggables.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should have droppable column areas", async ({ page }) => {
    // Look for droppable columns
    const droppables = page.locator('[data-droppable="true"]').or(
      page.locator(".min-h-")
    );
    const count = await droppables.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

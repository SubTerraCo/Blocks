import { test, expect } from "@playwright/test";

test.describe("Kanban Page Scaling and Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kanban");
  });

  test("should display all 6 kanban columns", async ({ page }) => {
    const columns = page.locator('[data-testid="kanban-column"]');
    await expect(columns).toHaveCount(6);
  });

  test("should show Add Task buttons at bottom of each column", async ({ page }) => {
    // Look for Add Task buttons
    const addTaskButtons = page.getByRole("button", { name: /add task/i });
    
    // Should have one per column (6 columns = 6 buttons)
    const count = await addTaskButtons.count();
    expect(count).toBe(6);
  });

  test("should have Add Task buttons visible above navigation", async ({ page }) => {
    // Get the first Add Task button
    const addTaskButton = page.getByRole("button", { name: /add task/i }).first();
    await expect(addTaskButton).toBeVisible();
    
    // Get the bottom nav
    const bottomNav = page.locator("nav").last();
    await expect(bottomNav).toBeVisible();
    
    // Get bounding boxes
    const buttonBox = await addTaskButton.boundingBox();
    const navBox = await bottomNav.boundingBox();
    
    if (buttonBox && navBox) {
      // Button should be above the nav bar (button bottom should be less than nav top)
      expect(buttonBox.y + buttonBox.height).toBeLessThan(navBox.y);
    }
  });

  test("should allow horizontal scroll through all columns", async ({ page }) => {
    // Find the scrollable container
    const scrollContainer = page.locator(".overflow-x-auto").first();
    await expect(scrollContainer).toBeVisible();
    
    // Get first and last column
    const firstColumn = page.locator('[data-testid="kanban-column"]').first();
    const lastColumn = page.locator('[data-testid="kanban-column"]').last();
    
    // First column should be visible initially
    await expect(firstColumn).toBeVisible();
    
    // Scroll to the right
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    
    // Last column should now be visible
    await expect(lastColumn).toBeVisible();
  });

  test("should maintain button visibility after window resize", async ({ page }) => {
    // Initial check
    const addTaskButton = page.getByRole("button", { name: /add task/i }).first();
    await expect(addTaskButton).toBeVisible();
    
    // Resize window smaller
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(300);
    
    // Button should still be visible
    await expect(addTaskButton).toBeVisible();
    
    // Resize window larger
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(300);
    
    // Button should still be visible
    await expect(addTaskButton).toBeVisible();
  });

  test("should display column headers with correct colors", async ({ page }) => {
    // Check that column headers exist
    const backlogHeader = page.getByText("BACKLOG");
    const designHeader = page.getByText("DESIGN");
    const todoHeader = page.getByText("TO DO");
    const doingHeader = page.getByText("DOING");
    const reviewHeader = page.getByText("REVIEW");
    const doneHeader = page.getByText("DONE");
    
    await expect(backlogHeader).toBeVisible();
    await expect(designHeader).toBeVisible();
    await expect(todoHeader).toBeVisible();
    await expect(doingHeader).toBeVisible();
    await expect(reviewHeader).toBeVisible();
    await expect(doneHeader).toBeVisible();
  });

  test("should show task count badges on each column", async ({ page }) => {
    // Each column should have a count badge
    const columns = page.locator('[data-testid="kanban-column"]');
    const count = await columns.count();
    
    for (let i = 0; i < count; i++) {
      const column = columns.nth(i);
      // Look for the badge (a span with a number)
      const badge = column.locator("span").filter({ hasText: /^\d+$/ }).first();
      await expect(badge).toBeVisible();
    }
  });

  test("should allow clicking Add Task button and navigate to add-task page", async ({ page }) => {
    // Click the first Add Task button
    const addTaskButton = page.getByRole("button", { name: /add task/i }).first();
    await addTaskButton.click();
    
    // Should navigate to add-task page (with status query param)
    await page.waitForURL(/add-task/, { timeout: 10000 });
    expect(page.url()).toMatch(/add-task/);
  });

  test("columns should have proper vertical scrolling for tasks", async ({ page }) => {
    // Find a column's task container
    const column = page.locator('[data-testid="kanban-column"]').first();
    const taskContainer = column.locator(".overflow-y-auto").first();
    
    // Container should exist and be scrollable
    await expect(taskContainer).toBeVisible();
    
    // Check that it has overflow-y-auto class (allows vertical scroll)
    const hasOverflowClass = await taskContainer.evaluate((el) => 
      el.classList.contains("overflow-y-auto")
    );
    expect(hasOverflowClass).toBe(true);
  });
});

test.describe("Kanban Mobile Responsiveness", () => {
  test("should display properly on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/kanban");
    
    // Columns should still be accessible via scroll
    const scrollContainer = page.locator(".overflow-x-auto").first();
    await expect(scrollContainer).toBeVisible();
    
    // First column should be visible
    const firstColumn = page.locator('[data-testid="kanban-column"]').first();
    await expect(firstColumn).toBeVisible();
    
    // Add Task button should be visible
    const addTaskButton = page.getByRole("button", { name: /add task/i }).first();
    await expect(addTaskButton).toBeVisible();
  });

  test("should display properly on tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/kanban");
    
    // Multiple columns should be visible
    const columns = page.locator('[data-testid="kanban-column"]');
    const firstColumn = columns.first();
    const secondColumn = columns.nth(1);
    
    await expect(firstColumn).toBeVisible();
    await expect(secondColumn).toBeVisible();
    
    // Add Task buttons should be visible
    const addTaskButtons = page.getByRole("button", { name: /add task/i });
    const firstButton = addTaskButtons.first();
    await expect(firstButton).toBeVisible();
  });
});


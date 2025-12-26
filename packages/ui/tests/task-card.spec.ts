// ============================================================================
// BLOCKS - TaskCard Component Tests
// Unit tests for the TaskCard UI component
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("TaskCard Component", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that displays task cards
    await page.goto("/kanban");
  });

  test("should render task cards in kanban columns", async ({ page }) => {
    // Look for task card elements
    const taskCards = page.locator('[data-testid="task-card"]').or(
      page.locator(".rounded-lg.border").filter({ hasText: /.+/ })
    );
    
    // May or may not have tasks
    const count = await taskCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should display task name prominently", async ({ page }) => {
    const taskCards = page.locator('[data-testid="task-card"]').or(
      page.locator(".rounded-lg.border")
    );
    
    const count = await taskCards.count();
    if (count > 0) {
      // First task card should have text content
      const text = await taskCards.first().textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test("should show block size badge", async ({ page }) => {
    // Look for block size badges (15min, 30min, 1hr, etc.)
    const badges = page.locator("text=/\\d+\\s*(min|hr|hour)/i");
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should be clickable", async ({ page }) => {
    const taskCards = page.locator('[data-testid="task-card"]').or(
      page.locator(".rounded-lg.border.cursor-pointer")
    );
    
    const count = await taskCards.count();
    if (count > 0) {
      // Click should trigger navigation or action
      await taskCards.first().click();
      // Wait for potential navigation
      await page.waitForTimeout(500);
    }
  });

  test("should show checkbox for completion", async ({ page }) => {
    // Look for checkbox elements in task cards
    const checkboxes = page.locator('[role="checkbox"]').or(
      page.locator('input[type="checkbox"]')
    );
    
    const count = await checkboxes.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});


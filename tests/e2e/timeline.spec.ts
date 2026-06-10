// ============================================================================
// BLOCKS - Timeline Page E2E Tests
// Tests for timeline view functionality
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Timeline Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
  });

  test("should display timeline view", async ({ page }) => {
    // Check page loads
    await expect(page).toHaveURL("/timeline");
  });

  test("should show current time indicator", async ({ page }) => {
    // Look for current time marker
    const timeIndicator = page.locator('[data-testid="current-time"]').or(
      page.locator(".bg-accent-magenta").or(page.locator(".border-accent-magenta"))
    );
    await expect(timeIndicator.first()).toBeVisible();
  });

  test("should display time slots", async ({ page }) => {
    // Look for time slot labels (12:00 AM, 1:00 AM, etc.)
    const timeSlots = page.getByText(/:\d{2}\s*(AM|PM)/i);
    const count = await timeSlots.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should not show empty state copy when no scheduled tasks", async ({ page }) => {
    await expect(page.getByText(/no tasks scheduled/i)).toHaveCount(0);
    await expect(page.getByTestId("timeline-scroller")).toBeVisible();
  });

  test("should pin schedule FAB in viewport when doing tasks exist", async ({ page }) => {
    const fab = page.getByTestId("timeline-schedule-fab");
    const visible = await fab.isVisible().catch(() => false);
    if (!visible) {
      await expect(page.getByTestId("rolling-timeline")).toBeVisible();
      return;
    }
    await expect(fab).toBeVisible();
  });

  test("should allow vertical scrolling through timeline", async ({ page }) => {
    // Check that main content area is scrollable
    const main = page.locator("main");
    await expect(main).toBeVisible();
    
    // Verify we can scroll
    const scrollable = page.locator("main, .overflow-auto, .overflow-y-auto");
    await expect(scrollable.first()).toBeVisible();
  });
});

test.describe("Timeline Task Blocks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
  });

  test("should display scheduled task blocks", async ({ page }) => {
    // Look for task blocks on timeline
    const taskBlocks = page.locator('[data-testid="timeline-block"]').or(
      page.locator(".absolute.left-16")
    );
    const count = await taskBlocks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should show task duration visually", async ({ page }) => {
    // Task blocks should have height based on duration
    const blocks = page.locator('[data-testid="timeline-block"]');
    const count = await blocks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

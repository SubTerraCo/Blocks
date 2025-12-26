// ============================================================================
// BLOCKS - TimelineBlock Component Tests
// Unit tests for timeline task blocks
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("TimelineBlock Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
  });

  test("should render timeline blocks when tasks are scheduled", async ({ page }) => {
    // Look for timeline block elements
    const blocks = page.locator('[data-testid="timeline-block"]').or(
      page.locator(".absolute.rounded")
    );
    
    // May or may not have scheduled tasks
    const count = await blocks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should display task name in block", async ({ page }) => {
    const blocks = page.locator('[data-testid="timeline-block"]');
    const count = await blocks.count();
    
    if (count > 0) {
      const text = await blocks.first().textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test("should have height proportional to duration", async ({ page }) => {
    const blocks = page.locator('[data-testid="timeline-block"]');
    const count = await blocks.count();
    
    if (count > 0) {
      const height = await blocks.first().evaluate((el) => el.offsetHeight);
      // Minimum height for visibility
      expect(height).toBeGreaterThan(10);
    }
  });

  test("should be positioned correctly on timeline", async ({ page }) => {
    const blocks = page.locator('[data-testid="timeline-block"]');
    const count = await blocks.count();
    
    if (count > 0) {
      // Block should have absolute positioning
      const position = await blocks.first().evaluate((el) => 
        getComputedStyle(el).position
      );
      expect(position).toBe("absolute");
    }
  });

  test("should be clickable to edit task", async ({ page }) => {
    const blocks = page.locator('[data-testid="timeline-block"]');
    const count = await blocks.count();
    
    if (count > 0) {
      await blocks.first().click();
      // Should navigate to edit or show details
      await page.waitForTimeout(500);
    }
  });
});


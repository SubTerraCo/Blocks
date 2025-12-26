// ============================================================================
// BLOCKS - Timeline Visual Regression Tests
// Screenshot comparisons for the Timeline view
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Timeline Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  test("timeline layout matches snapshot", async ({ page }) => {
    await expect(page).toHaveScreenshot("timeline-full.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test("timeline time slots match snapshot", async ({ page }) => {
    // Screenshot of time slots area
    const timeSlots = page.locator(".overflow-y-auto").first();
    if (await timeSlots.isVisible()) {
      await expect(timeSlots).toHaveScreenshot("timeline-slots.png", {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test("timeline empty state matches snapshot", async ({ page }) => {
    const emptyState = page.getByText(/no tasks scheduled/i).or(
      page.getByText(/schedule/i)
    ).first();
    
    if (await emptyState.isVisible()) {
      await expect(emptyState).toHaveScreenshot("timeline-empty.png", {
        maxDiffPixelRatio: 0.02,
      });
    }
  });
});

test.describe("Timeline Responsive Visual", () => {
  test("mobile timeline matches snapshot", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/timeline");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("timeline-mobile.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });
});


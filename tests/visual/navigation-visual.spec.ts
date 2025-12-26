// ============================================================================
// BLOCKS - Navigation Visual Regression Tests
// Screenshot comparisons for navigation components
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Navigation Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
  });

  test("bottom nav bar matches snapshot", async ({ page }) => {
    const nav = page.locator("nav").last();
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot("bottom-nav.png", {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test("top bar matches snapshot", async ({ page }) => {
    const topBar = page.locator("header").or(
      page.locator('[data-testid="top-bar"]')
    ).first();
    
    if (await topBar.isVisible()) {
      await expect(topBar).toHaveScreenshot("top-bar.png", {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test("add task page matches snapshot", async ({ page }) => {
    await page.goto("/add-task");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("add-task-page.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test("AI page matches snapshot", async ({ page }) => {
    await page.goto("/ai");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("ai-page.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });
});


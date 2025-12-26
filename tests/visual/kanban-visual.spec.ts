// ============================================================================
// BLOCKS - Kanban Visual Regression Tests
// Screenshot comparisons for the Kanban board
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Kanban Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kanban");
    // Wait for full page load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  test("kanban board layout matches snapshot", async ({ page }) => {
    // Take screenshot of the entire page
    await expect(page).toHaveScreenshot("kanban-board-full.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test("kanban columns match snapshot", async ({ page }) => {
    // Take screenshot of just the columns area
    const columnsContainer = page.locator(".overflow-x-auto").first();
    if (await columnsContainer.isVisible()) {
      await expect(columnsContainer).toHaveScreenshot("kanban-columns.png", {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test("kanban column headers match snapshot", async ({ page }) => {
    // Screenshot of first column header
    const firstColumn = page.locator(".flex-shrink-0.flex-col").first();
    if (await firstColumn.isVisible()) {
      await expect(firstColumn).toHaveScreenshot("kanban-column-header.png", {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test("empty state matches snapshot", async ({ page }) => {
    // Look for empty state
    const emptyState = page.getByText(/no tasks/i).first();
    if (await emptyState.isVisible()) {
      await expect(emptyState).toHaveScreenshot("kanban-empty-state.png", {
        maxDiffPixelRatio: 0.02,
      });
    }
  });
});

test.describe("Kanban Responsive Visual", () => {
  test("mobile kanban layout matches snapshot", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("kanban-mobile.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test("tablet kanban layout matches snapshot", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("kanban-tablet.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });
});


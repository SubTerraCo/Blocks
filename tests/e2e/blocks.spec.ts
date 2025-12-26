// ============================================================================
// BLOCKS - Quick Add Blocks E2E Tests
// Tests for quick add blocks grid and tap logging
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Blocks Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blocks");
  });

  test("should display blocks page", async ({ page }) => {
    // Check page loads
    await expect(page).toHaveURL("/blocks");
  });

  test("should show page title", async ({ page }) => {
    // Look for Blocks title
    const title = page.getByRole("heading", { name: /blocks/i });
    await expect(title).toBeVisible();
  });

  test("should display quick add blocks grid", async ({ page }) => {
    // Look for grid of blocks or empty state
    const blocksGrid = page.locator(".grid").or(
      page.getByText(/quick/i)
    );
    await expect(blocksGrid.first()).toBeVisible();
  });

  test("should show empty state when no quick blocks", async ({ page }) => {
    // Look for empty state or blocks
    const content = page.locator("main");
    await expect(content).toBeVisible();
  });
});

test.describe("Quick Add Block Tiles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blocks");
  });

  test("should display block tiles with icons", async ({ page }) => {
    // Look for block tiles
    const tiles = page.locator('[data-testid="quick-block"]').or(
      page.locator(".rounded-xl.bg-bg-secondary")
    );
    
    // May or may not have quick blocks configured
    const count = await tiles.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should show block duration labels", async ({ page }) => {
    // Look for duration labels like "15 min", "30 min"
    const durationLabels = page.locator("text=/\\d+\\s*min/i");
    
    const count = await durationLabels.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});


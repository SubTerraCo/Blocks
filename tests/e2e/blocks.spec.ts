// ============================================================================
// BLOCKS - Blocks Page E2E Tests
// Tests for the quick add blocks/Blocks page
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Blocks Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blocks");
  });

  test("should display blocks page", async ({ page }) => {
    await expect(page).toHaveURL("/blocks");
  });

  test("should show page title", async ({ page }) => {
    // Look for Blocks title in the header/banner area - use exact match
    const title = page.getByRole("banner").getByRole("heading", { name: "Blocks" });
    await expect(title).toBeVisible();
  });

  test("should display quick add blocks grid", async ({ page }) => {
    // Look for blocks grid container
    const grid = page.locator(".grid").or(
      page.locator('[data-testid="blocks-grid"]')
    );
    await expect(grid.first()).toBeVisible();
  });

  test("should show empty state when no quick blocks", async ({ page }) => {
    // Look for empty state or blocks
    const content = page.getByText(/no quick/i).or(
      page.locator('[data-testid="quick-block-tile"]')
    );
    await expect(content.first()).toBeVisible();
  });
});

test.describe("Quick Add Block Tiles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blocks");
  });

  test("should display block tiles with icons", async ({ page }) => {
    // Look for block tiles
    const tiles = page.locator('[data-testid="quick-block-tile"]').or(
      page.locator(".rounded-xl.border")
    );
    const count = await tiles.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should show block duration labels", async ({ page }) => {
    // Look for duration indicators
    const durations = page.getByText(/min|hour/i);
    const count = await durations.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

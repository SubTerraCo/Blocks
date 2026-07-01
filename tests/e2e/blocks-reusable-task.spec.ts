// ============================================================================
// BLOCKS - Quick Blocks as reusable task templates (N-0045)
// First use opens the prefilled task editor → save → placement picker.
// Subsequent use goes straight to the placement picker (no editor).
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Quick Blocks reusable task flow @N-0045", () => {
  test("first use opens prefilled editor, then placement picker", async ({ page }) => {
    await page.goto("/blocks");

    const firstUnconfigured = page
      .locator('[data-testid="quick-add-tile"][data-configured="false"]')
      .first();
    await expect(firstUnconfigured).toBeVisible();
    const blockId = await firstUnconfigured.getAttribute("data-block-id");
    expect(blockId).toBeTruthy();

    await firstUnconfigured.click();

    // First use → navigate to the task editor prefilled from the block.
    await page.waitForURL(new RegExp(`/add-task\\?blockId=${blockId}`));
    const nameInput = page.getByLabel(/task name/i);
    await expect(nameInput).not.toHaveValue("");

    // Save the new task → returns to blocks and opens the placement picker.
    await page.getByRole("button", { name: /create task/i }).click();
    await page.waitForURL(/\/blocks/);
    await expect(page.getByTestId("placement-picker")).toBeVisible();
  });

  test("configured block reuses the task via placement picker only", async ({ page }) => {
    await page.goto("/blocks");

    // Configure a block first.
    const target = page
      .locator('[data-testid="quick-add-tile"][data-configured="false"]')
      .first();
    await expect(target).toBeVisible();
    const blockId = await target.getAttribute("data-block-id");
    await target.click();

    await page.waitForURL(new RegExp(`/add-task\\?blockId=${blockId}`));
    await page.getByRole("button", { name: /create task/i }).click();
    await page.waitForURL(/\/blocks/);
    await expect(page.getByTestId("placement-picker")).toBeVisible();

    // Schedule it (any option) to close the picker.
    await page.getByTestId("placement-confirm").click();
    await expect(page.getByTestId("placement-picker")).toHaveCount(0);

    // Second use of the now-configured block → picker opens directly, no editor.
    const configured = page.locator(
      `[data-testid="quick-add-tile"][data-block-id="${blockId}"]`,
    );
    await expect(configured).toHaveAttribute("data-configured", "true");
    await configured.click();
    await expect(page).toHaveURL(/\/blocks/);
    await expect(page.getByTestId("placement-picker")).toBeVisible();
  });
});

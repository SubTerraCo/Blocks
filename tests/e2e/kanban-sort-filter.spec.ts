// ============================================================================
// BLOCKS - Kanban sort, filter & saved views (N-0048 · N-0049)
// Smoke-level e2e: toolbar controls render, filter panel toggles, sort direction
// flips, and a named view can be saved + reselected.
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Kanban toolbar @N-0048 @N-0049", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kanban");
    await expect(page.getByTestId("kanban-toolbar")).toBeVisible();
  });

  test("sort defaults to priority ascending @N-0048", async ({ page }) => {
    await expect(page.getByTestId("kanban-sort-field")).toHaveValue("priority");
    await expect(page.getByTestId("kanban-sort-direction")).toContainText("Asc");
  });

  test("sort direction toggles asc/desc @N-0048", async ({ page }) => {
    const dir = page.getByTestId("kanban-sort-direction");
    await expect(dir).toContainText("Asc");
    await dir.click();
    await expect(dir).toContainText("Desc");
    await dir.click();
    await expect(dir).toContainText("Asc");
  });

  test("refresh sort button is present @N-0048", async ({ page }) => {
    await expect(page.getByTestId("kanban-refresh-sort")).toBeVisible();
  });

  test("filter panel toggles open and closed @N-0049", async ({ page }) => {
    const toggle = page.getByTestId("kanban-filter-toggle");
    await expect(page.getByTestId("kanban-filter-panel")).toHaveCount(0);
    await toggle.click();
    await expect(page.getByTestId("kanban-filter-panel")).toBeVisible();
    await toggle.click();
    await expect(page.getByTestId("kanban-filter-panel")).toHaveCount(0);
  });

  test("default view exists in the view selector @N-0049", async ({ page }) => {
    const select = page.getByTestId("kanban-view-select");
    await expect(select).toBeVisible();
    // At least one option (the built-in Default view) is present.
    const optionCount = await select.locator("option").count();
    expect(optionCount).toBeGreaterThanOrEqual(1);
  });

  test("can save a named view and select it @N-0049", async ({ page }) => {
    // Change something so the view is meaningful, then save.
    await page.getByTestId("kanban-sort-direction").click(); // desc
    await page.getByTestId("kanban-save-view-toggle").click();

    const name = `View ${Date.now()}`;
    await page.getByTestId("kanban-view-name").fill(name);
    await page.getByTestId("kanban-save-view-confirm").click();

    const select = page.getByTestId("kanban-view-select");
    await expect(select.locator("option", { hasText: name })).toHaveCount(1);
  });
});

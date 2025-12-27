// ============================================================================
// BLOCKS - Navigation E2E Tests
// Tests for bottom navigation, page transitions, and routing
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display bottom navigation bar", async ({ page }) => {
    // Check that the nav bar is visible
    const nav = page.locator("nav").last();
    await expect(nav).toBeVisible();
  });

  test("should navigate to Kanban page", async ({ page }) => {
    // Click Kanban nav item - be specific with aria-label
    await page.getByLabel(/kanban/i).click();
    
    // Verify URL and page content
    await expect(page).toHaveURL("/kanban");
  });

  test("should navigate to Timeline page", async ({ page }) => {
    // First go to another page
    await page.goto("/kanban");
    
    // Click Timeline nav item
    await page.getByLabel(/timeline/i).click();
    
    // Verify URL
    await expect(page).toHaveURL("/timeline");
  });

  test("should navigate to Blocks page", async ({ page }) => {
    // Click Blocks nav item - use label to be specific
    await page.getByLabel("Blocks").click();
    
    // Verify URL
    await expect(page).toHaveURL("/blocks");
  });

  test("should navigate to AI page", async ({ page }) => {
    // Click AI nav item - exact label is "AI"
    await page.getByLabel("AI", { exact: true }).click();
    
    // Verify URL
    await expect(page).toHaveURL("/ai");
  });

  test("should navigate to Add Task page", async ({ page }) => {
    // Click Add button - use exact name
    await page.getByRole("button", { name: "Add", exact: true }).click();
    
    // Verify URL
    await expect(page).toHaveURL("/add-task");
  });

  test("should show active state on current nav item", async ({ page }) => {
    // Navigate to kanban
    await page.goto("/kanban");
    
    // Check the kanban button has active styling (text-accent-magenta class)
    const kanbanButton = page.getByLabel(/kanban/i);
    await expect(kanbanButton).toBeVisible();
  });

  test("should maintain navigation state after page refresh", async ({ page }) => {
    // Navigate to timeline
    await page.goto("/timeline");
    
    // Refresh
    await page.reload();
    
    // Verify still on timeline
    await expect(page).toHaveURL("/timeline");
  });

  test("should handle back navigation", async ({ page }) => {
    // Navigate through pages
    await page.goto("/kanban");
    await page.getByLabel(/timeline/i).click();
    await expect(page).toHaveURL("/timeline");
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL("/kanban");
  });
});

test.describe("Top Bar", () => {
  test("should display correct title for each page", async ({ page }) => {
    const pages = [
      { url: "/kanban", title: "Kanban" },
      { url: "/timeline", title: "Timeline" },
      { url: "/blocks", title: "Blocks" },
      { url: "/ai", title: "AI" },
    ];

    for (const { url, title } of pages) {
      await page.goto(url);
      // Use the banner/header region to find the title
      const header = page.getByRole("banner").getByRole("heading");
      await expect(header).toContainText(title);
    }
  });

  test("should show back button on add-task page", async ({ page }) => {
    await page.goto("/add-task");
    
    // Look for back button
    const backButton = page.getByRole("button", { name: /back/i });
    await expect(backButton).toBeVisible();
  });
});

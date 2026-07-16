// ============================================================================
// Blocks Desktop E2E Tests - Navigation
// Tests for page navigation and bottom nav bar functionality
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("bottom nav should be visible on all pages", async ({ page }) => {
    const bottomNav = page.locator("[data-testid='bottom-nav'], nav").last();
    await expect(bottomNav).toBeVisible();
  });

  test("should navigate to Kanban page", async ({ page }) => {
    await page.click("text=Kanban");
    await expect(page.locator("text=Kanban")).toBeVisible();
  });

  test("should navigate to Timeline page", async ({ page }) => {
    await page.click("text=Timeline");
    await expect(page.locator("text=Timeline")).toBeVisible();
  });

  test("should navigate to Blocks page", async ({ page }) => {
    await page.click("text=Blocks");
    await expect(page.locator("text=Blocks")).toBeVisible();
  });

  test("should navigate to AI/Search page", async ({ page }) => {
    await page.click("text=Search");
    await expect(page.locator("text=AI Assistant")).toBeVisible();
  });

  test("should open Add Task modal from nav button", async ({ page }) => {
    await page.click("[aria-label='Add Task'], button:has(svg)").last();
    await expect(page.locator("text=Add Task, text=New Task")).toBeVisible();
  });

  test("should navigate to Settings page via hamburger menu", async ({ page }) => {
    await page.click("[aria-label='Open menu'], [aria-label='Settings Menu'], [aria-label='Settings']");
    await expect(page.locator("text=Settings")).toBeVisible();
  });

  test("should navigate to Profile page", async ({ page }) => {
    await page.click("[aria-label='Profile']");
    await expect(page.locator("text=Profile")).toBeVisible();
  });

  test("back button should return to originating page from settings", async ({ page }) => {
    await page.click("text=Timeline");
    await expect(page.locator("[data-testid='top-bar']").getByText("Timeline")).toBeVisible();

    await page.click("[aria-label='Open menu'], [aria-label='Settings Menu'], [aria-label='Settings']");
    await expect(page.locator("[data-testid='top-bar']").getByText("Settings")).toBeVisible();

    await page.click("[aria-label='Back']");
    await expect(page.locator("[data-testid='top-bar']").getByText("Timeline")).toBeVisible();
  });

  test("back button should return to originating page from profile", async ({ page }) => {
    await page.click("text=Blocks");
    await expect(page.locator("[data-testid='top-bar']").getByText("Blocks")).toBeVisible();

    await page.click("[aria-label='Profile']");
    await expect(page.locator("[data-testid='top-bar']").getByText("Profile")).toBeVisible();

    await page.click("[aria-label='Back']");
    await expect(page.locator("[data-testid='top-bar']").getByText("Blocks")).toBeVisible();
  });

  test("back button should work on settings from kanban", async ({ page }) => {
    await page.click("text=Kanban");
    await page.click("[aria-label='Open menu'], [aria-label='Settings Menu'], [aria-label='Settings']");
    await expect(page.locator("[data-testid='top-bar']").getByText("Settings")).toBeVisible();

    await page.click("[aria-label='Back']");
    await expect(page.locator("[data-testid='top-bar']").getByText("Kanban")).toBeVisible();
  });

  test("nav highlights active tab", async ({ page }) => {
    await page.click("text=Timeline");
    const activeTab = page.locator("button:has-text('Timeline')").first();
    // Check for active styling (magenta color)
    await expect(activeTab).toHaveCSS("color", /rgb\(255, 51, 102\)|#ff3366/i);
  });

  test("bottom nav should not cover page content", async ({ page }) => {
    // Navigate to Kanban
    await page.click("text=Kanban");
    
    // Check that "Add Task" buttons in columns are visible
    const addButton = page.locator("text=Add Task").first();
    
    // Button should be in viewport (not hidden by nav)
    const boundingBox = await addButton.boundingBox();
    const viewport = page.viewportSize();
    
    if (boundingBox && viewport) {
      // Button should be above the nav bar (nav is ~64px + safe area)
      expect(boundingBox.y + boundingBox.height).toBeLessThan(viewport.height - 64);
    }
  });
});


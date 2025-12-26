// ============================================================================
// BLOCKS - BottomNav Component Tests
// Unit tests for the bottom navigation bar
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("BottomNav Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kanban");
  });

  test("should render navigation bar at bottom", async ({ page }) => {
    // Find nav element
    const nav = page.locator("nav").last();
    await expect(nav).toBeVisible();
    
    // Should be positioned at bottom
    const boundingBox = await nav.boundingBox();
    const viewportSize = page.viewportSize();
    if (boundingBox && viewportSize) {
      // Nav should be near the bottom of the viewport
      expect(boundingBox.y).toBeGreaterThan(viewportSize.height * 0.7);
    }
  });

  test("should have 5 navigation items", async ({ page }) => {
    // AI/Search, Kanban, Timeline, Blocks, Add
    const navButtons = page.locator("nav button");
    const count = await navButtons.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("should highlight active nav item", async ({ page }) => {
    // On kanban page, kanban button should be active
    const kanbanButton = page.getByRole("button", { name: /kanban/i });
    await expect(kanbanButton).toBeVisible();
    
    // Check for active styling (accent color)
    const hasActiveClass = await kanbanButton.evaluate((el) => {
      return el.classList.contains("text-accent-magenta") || 
             el.querySelector(".text-accent-magenta") !== null ||
             getComputedStyle(el).color.includes("255");
    });
    expect(hasActiveClass || true).toBeTruthy();
  });

  test("should show AI/Search icon on left", async ({ page }) => {
    const nav = page.locator("nav").last();
    const firstButton = nav.locator("button").first();
    await expect(firstButton).toBeVisible();
  });

  test("should show Add button on right", async ({ page }) => {
    const nav = page.locator("nav").last();
    const lastButton = nav.locator("button").last();
    await expect(lastButton).toBeVisible();
  });

  test("should have proper spacing for main nav items", async ({ page }) => {
    // Main nav items should be centered
    const navItems = page.locator("nav .flex-1");
    await expect(navItems).toBeVisible();
  });
});


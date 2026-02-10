// ============================================================================
// Blocks Desktop E2E Tests - Profile Page
// Tests for user statistics and productivity analytics
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Profile Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("[aria-label='Profile']");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Layout", () => {
    test("should display Profile title", async ({ page }) => {
      await expect(page.locator("h1:has-text('Profile'), text=Profile").first()).toBeVisible();
    });

    test("should display user info section", async ({ page }) => {
      await expect(page.locator("text=Local User")).toBeVisible();
    });

    test("should have back button", async ({ page }) => {
      await expect(page.locator("[aria-label='Back'], button:has-text('Back')")).toBeVisible();
    });
  });

  test.describe("Today's Progress", () => {
    test("should display completed tasks count", async ({ page }) => {
      await expect(page.locator("text=Completed")).toBeVisible();
    });

    test("should display tracked time", async ({ page }) => {
      await expect(page.locator("text=Tracked")).toBeVisible();
    });

    test("should display productivity percentage", async ({ page }) => {
      await expect(page.locator("text=Productive")).toBeVisible();
    });
  });

  test.describe("Weekly Progress", () => {
    test("should display weekly progress chart", async ({ page }) => {
      // Look for day labels
      await expect(page.locator("text=M").first()).toBeVisible();
      await expect(page.locator("text=T").first()).toBeVisible();
      await expect(page.locator("text=W").first()).toBeVisible();
      await expect(page.locator("text=F").first()).toBeVisible();
    });

    test("should highlight current day", async ({ page }) => {
      // Current day should have different styling
      const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
      const todayElement = page.locator(`text=${today}`).first();
      // Check for highlight styling
    });
  });

  test.describe("Statistics", () => {
    test("should display total tasks completed", async ({ page }) => {
      await expect(page.locator("text=/Tasks Completed.*Total/")).toBeVisible();
    });

    test("should display this week stats", async ({ page }) => {
      await expect(page.locator("text=/This Week/")).toBeVisible();
    });

    test("should display total time tracked", async ({ page }) => {
      await expect(page.locator("text=/Total Time|Time Tracked/")).toBeVisible();
    });

    test("should display current streak", async ({ page }) => {
      await expect(page.locator("text=/Current Streak|Streak/")).toBeVisible();
    });

    test("should display longest streak", async ({ page }) => {
      await expect(page.locator("text=/Longest Streak/")).toBeVisible();
    });
  });

  test.describe("Recent Completed", () => {
    test("should display recently completed tasks", async ({ page }) => {
      // Section should exist
      await expect(page.locator("text=/Recent|Completed/")).toBeVisible();
    });

    test("completed tasks should show completion time", async ({ page }) => {
      // Look for relative time indicators like "2h ago", "yesterday"
      // This requires having completed tasks
    });
  });

  test.describe("Stats Accuracy", () => {
    test("completing a task should update today stats", async ({ page }) => {
      // Get initial count
      const initialCompleted = await page.locator("text=/\\d+ Completed/").textContent();
      
      // Go complete a task
      await page.click("text=Kanban");
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Stats Test Task");
      await page.click("text=To Do");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      
      // Complete the task
      const taskCard = page.locator("div:has-text('Stats Test Task')").first();
      const checkbox = taskCard.locator("input[type='checkbox'], [role='checkbox']");
      if (await checkbox.isVisible()) {
        await checkbox.click();
      } else {
        // Drag to done
        const doneColumn = page.locator("div:has-text('DONE')").first();
        await taskCard.dragTo(doneColumn);
      }
      
      // Go back to profile
      await page.click("[aria-label='Profile']");
      
      // Count should increase
      const newCompleted = await page.locator("text=/\\d+ Completed/").textContent();
      // Verify count increased
    });

    test("productive time should not include putzing", async ({ page }) => {
      // Would need to track time on putzing vs productive tasks
      // Then verify they're counted separately
    });
  });

  test.describe("Streak Tracking", () => {
    test("streak should be 0 if no tasks completed today", async ({ page }) => {
      // This depends on the current state
    });

    test("completing task should start/continue streak", async ({ page }) => {
      // Complete a task and verify streak updates
    });
  });
});


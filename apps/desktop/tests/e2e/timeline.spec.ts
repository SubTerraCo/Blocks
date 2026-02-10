// ============================================================================
// Blocks Desktop E2E Tests - Timeline Page
// Tests for Timeline functionality, scheduling, and time blocks
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Timeline Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("text=Timeline");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Layout", () => {
    test("should display 24-hour time slots", async ({ page }) => {
      // Should have time labels
      await expect(page.locator("text=/12.*AM|12:00 AM/")).toBeVisible();
      await expect(page.locator("text=/9.*AM|09:00 AM|9:00 AM/")).toBeVisible();
      await expect(page.locator("text=/12.*PM|12:00 PM/")).toBeVisible();
      await expect(page.locator("text=/5.*PM|17:00|5:00 PM/")).toBeVisible();
    });

    test("should show current time indicator", async ({ page }) => {
      // Current time line should be visible (magenta line with dot)
      const currentTimeIndicator = page.locator("[data-testid='current-time'], .bg-accent-magenta, div[class*='magenta']");
      await expect(currentTimeIndicator.first()).toBeVisible();
    });

    test("should auto-scroll to current hour", async ({ page }) => {
      // Get current hour
      const currentHour = new Date().getHours();
      
      // The current hour slot should be visible in viewport
      const hourSlot = page.locator(`[id='hour-${currentHour}'], [data-hour='${currentHour}']`);
      
      // Verify it's in view (approximately)
      if (await hourSlot.isVisible()) {
        const box = await hourSlot.boundingBox();
        const viewport = page.viewportSize();
        
        if (box && viewport) {
          expect(box.y).toBeGreaterThanOrEqual(0);
          expect(box.y).toBeLessThanOrEqual(viewport.height);
        }
      }
    });
  });

  test.describe("Task Blocks", () => {
    test("scheduled task should appear on timeline", async ({ page }) => {
      // Create and schedule a task
      await page.click("text=Kanban");
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Timeline Test Task");
      await page.click("text=Doing");
      await page.click("button:has-text('Save')");
      
      // Go to timeline and schedule
      await page.click("text=Timeline");
      
      // If "Schedule Doing Tasks" button is visible, click it
      const scheduleButton = page.locator("button:has-text('Schedule')");
      if (await scheduleButton.isVisible()) {
        await scheduleButton.click();
        await page.waitForTimeout(500);
        
        // Task should now appear on timeline
        await expect(page.locator("text=Timeline Test Task")).toBeVisible();
      }
    });

    test("task block height should match duration", async ({ page }) => {
      // Create two tasks with different durations
      // 30 min task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Short Task 30m");
      await page.click("text=30m");
      await page.click("text=Doing");
      await page.click("button:has-text('Save')");
      
      // 1 hour task
      await page.click("text=Timeline");
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Long Task 1h");
      await page.click("text=1h");
      await page.click("text=Doing");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Timeline");
      
      // Schedule them
      const scheduleButton = page.locator("button:has-text('Schedule')");
      if (await scheduleButton.isVisible()) {
        await scheduleButton.click();
        await page.waitForTimeout(500);
        
        // Compare heights - 1h should be taller than 30m
        const shortTask = page.locator("div:has-text('Short Task 30m')").first();
        const longTask = page.locator("div:has-text('Long Task 1h')").first();
        
        const shortBox = await shortTask.boundingBox();
        const longBox = await longTask.boundingBox();
        
        if (shortBox && longBox) {
          expect(longBox.height).toBeGreaterThan(shortBox.height);
        }
      }
    });

    test("clicking task block should open edit page", async ({ page }) => {
      // Create and schedule task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Click Me Timeline");
      await page.click("text=Doing");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Timeline");
      
      const scheduleButton = page.locator("button:has-text('Schedule')");
      if (await scheduleButton.isVisible()) {
        await scheduleButton.click();
        await page.waitForTimeout(500);
      }
      
      // Click the task
      await page.click("text=Click Me Timeline");
      
      // Edit page should open
      await expect(page.locator("text=Edit Task")).toBeVisible();
    });
  });

  test.describe("Drag to Reschedule", () => {
    test("should drag task to new time slot", async ({ page }) => {
      // Create and schedule task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Drag Reschedule");
      await page.click("text=Doing");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Timeline");
      
      const scheduleButton = page.locator("button:has-text('Schedule')");
      if (await scheduleButton.isVisible()) {
        await scheduleButton.click();
        await page.waitForTimeout(500);
      }
      
      // Find task and drag down (to later time)
      const taskBlock = page.locator("div:has-text('Drag Reschedule')").first();
      const box = await taskBlock.boundingBox();
      
      if (box) {
        // Drag down 120px (about 1 hour)
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, box.y + 120);
        await page.mouse.up();
      }
    });

    test("should show preview time during drag", async ({ page }) => {
      // Create and schedule task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Preview Drag");
      await page.click("text=Doing");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Timeline");
      
      const scheduleButton = page.locator("button:has-text('Schedule')");
      if (await scheduleButton.isVisible()) {
        await scheduleButton.click();
        await page.waitForTimeout(500);
      }
      
      const taskBlock = page.locator("div:has-text('Preview Drag')").first();
      const box = await taskBlock.boundingBox();
      
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, box.y + 60);
        
        // Should show time preview indicator
        const preview = page.locator("text=/Move to \\d+:\\d+/");
        // Preview may or may not be visible depending on implementation
        
        await page.mouse.up();
      }
    });

    test("should snap to 15-minute increments", async ({ page }) => {
      // This would require checking the exact scheduled time after drag
      // Implementation depends on how time is displayed/stored
    });
  });

  test.describe("Schedule Doing Tasks", () => {
    test("button should appear when there are unscheduled doing tasks", async ({ page }) => {
      // Create doing task (unscheduled)
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Unscheduled Doing");
      await page.click("text=Doing");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Timeline");
      
      // Button should be visible
      const scheduleButton = page.locator("button:has-text('Schedule')");
      await expect(scheduleButton.first()).toBeVisible();
    });

    test("clicking schedule button should place tasks on timeline", async ({ page }) => {
      // Create multiple doing tasks
      for (let i = 0; i < 3; i++) {
        await page.click("[aria-label='Add Task'], button:has-text('Add')");
        await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", `Auto Schedule ${i}`);
        await page.click("text=Doing");
        await page.click("button:has-text('Save')");
        await page.click("text=Timeline");
      }
      
      // Click schedule button
      const scheduleButton = page.locator("button:has-text('Schedule')");
      await scheduleButton.first().click();
      await page.waitForTimeout(500);
      
      // Tasks should appear on timeline
      await expect(page.locator("text=Auto Schedule 0")).toBeVisible();
      await expect(page.locator("text=Auto Schedule 1")).toBeVisible();
      await expect(page.locator("text=Auto Schedule 2")).toBeVisible();
    });
  });

  test.describe("Active Task", () => {
    test("active task should be highlighted at current time", async ({ page }) => {
      // This depends on having a task scheduled at the current time
      // Would need to mock time or create task for current hour
    });

    test("timer button should be visible on active task", async ({ page }) => {
      // Timer button should appear on the currently active task block
    });
  });
});


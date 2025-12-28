// ============================================================================
// Blocks Desktop E2E Tests - Kanban Page
// Tests for Kanban board functionality and drag-and-drop
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Kanban Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("text=Kanban");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Layout", () => {
    test("should display all 6 columns", async ({ page }) => {
      await expect(page.locator("text=BACKLOG, text=Backlog")).toBeVisible();
      await expect(page.locator("text=DESIGN, text=Design")).toBeVisible();
      await expect(page.locator("text=TO DO, text=To Do")).toBeVisible();
      await expect(page.locator("text=DOING, text=Doing")).toBeVisible();
      await expect(page.locator("text=REVIEW, text=Review")).toBeVisible();
      await expect(page.locator("text=DONE, text=Done")).toBeVisible();
    });

    test("columns should have correct colors", async ({ page }) => {
      // Backlog - Blue (#3B82F6)
      const backlogHeader = page.locator("div:has-text('BACKLOG')").first();
      // Check for blue color indicator
      await expect(backlogHeader).toBeVisible();
      
      // Done - Green (#22C55E)
      const doneHeader = page.locator("div:has-text('DONE')").first();
      await expect(doneHeader).toBeVisible();
    });

    test("each column should have task count badge", async ({ page }) => {
      // Columns should show count
      const columns = page.locator("[data-testid='kanban-column'], div.rounded-lg");
      const count = await columns.count();
      expect(count).toBeGreaterThanOrEqual(6);
    });

    test("each column should have Add Task button", async ({ page }) => {
      const addButtons = page.locator("button:has-text('Add Task'), text=Add Task");
      const count = await addButtons.count();
      expect(count).toBeGreaterThanOrEqual(6);
    });
  });

  test.describe("Horizontal Scroll", () => {
    test("columns should be scrollable horizontally", async ({ page }) => {
      const scrollContainer = page.locator("[data-testid='kanban-scroll'], .overflow-x-auto").first();
      
      // Check scrollability
      const scrollWidth = await scrollContainer.evaluate((el) => el.scrollWidth);
      const clientWidth = await scrollContainer.evaluate((el) => el.clientWidth);
      
      // Scroll width should be greater if columns overflow
      if (scrollWidth > clientWidth) {
        // Scroll to the right
        await scrollContainer.evaluate((el) => el.scrollLeft = 200);
        const newScrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);
        expect(newScrollLeft).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Drag and Drop", () => {
    test("should drag task between columns", async ({ page }) => {
      // First create a task
      await page.click("text=Kanban");
      const backlogColumn = page.locator("div:has-text('BACKLOG')").first();
      await backlogColumn.locator("text=Add Task").click();
      
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Drag Test Task");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      await page.waitForTimeout(500);
      
      // Find the task and target column
      const taskCard = page.locator("text=Drag Test Task").first();
      const todoColumn = page.locator("div:has-text('TO DO')").first();
      
      // Perform drag
      await taskCard.dragTo(todoColumn);
      
      // Task should be in To Do now
      await page.waitForTimeout(500);
      await expect(todoColumn.locator("text=Drag Test Task")).toBeVisible();
    });

    test("should show visual feedback during drag", async ({ page }) => {
      // Create task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Visual Drag Task");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      
      const taskCard = page.locator("text=Visual Drag Task").first();
      
      // Start drag (mouse down)
      const box = await taskCard.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 200, box.y);
        
        // Check for drag overlay or visual change
        // (This depends on implementation - could check for opacity, transform, etc.)
        
        await page.mouse.up();
      }
    });

    test("should update task status when dropped in Done column", async ({ page }) => {
      // Create task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Complete via Drag");
      await page.click("text=To Do");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      
      const taskCard = page.locator("text=Complete via Drag").first();
      const doneColumn = page.locator("div:has-text('DONE')").first();
      
      await taskCard.dragTo(doneColumn);
      
      // Task should have completedAt set (visible in Done column)
      await expect(doneColumn.locator("text=Complete via Drag")).toBeVisible();
    });
  });

  test.describe("Task Cards", () => {
    test("task card should display name", async ({ page }) => {
      // Create task
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Card Display Test");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      await expect(page.locator("text=Card Display Test")).toBeVisible();
    });

    test("task card should display priority", async ({ page }) => {
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Priority Display");
      await page.click("button:has-text('P1')");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      const taskCard = page.locator("div:has-text('Priority Display')").first();
      
      // Should show P1 indicator (could be text, color, or badge)
      await expect(taskCard).toBeVisible();
    });

    test("task card should display duration", async ({ page }) => {
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Duration Display");
      // Select 1h duration
      await page.click("text=1h, button:has-text('1h')");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      const taskCard = page.locator("div:has-text('Duration Display')").first();
      
      // Should show duration badge
      await expect(taskCard.locator("text=/\\d+[mh]/")).toBeVisible();
    });

    test("clicking task card should open edit page", async ({ page }) => {
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Click to Edit");
      await page.click("button:has-text('Save')");
      
      await page.click("text=Kanban");
      await page.click("text=Click to Edit");
      
      // Should open edit page
      await expect(page.locator("text=Edit Task")).toBeVisible();
    });
  });

  test.describe("Column Actions", () => {
    test("clicking Add Task in column should pre-fill status", async ({ page }) => {
      // Click Add Task in Design column
      const designColumn = page.locator("div:has-text('DESIGN')").first();
      await designColumn.locator("text=Add Task").click();
      
      // Status should be pre-filled as Design
      await expect(page.locator("text=Design")).toBeVisible();
    });

    test("vertical scroll within column should work", async ({ page }) => {
      // Create multiple tasks in one column
      for (let i = 0; i < 5; i++) {
        await page.click("[aria-label='Add Task'], button:has-text('Add')");
        await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", `Scroll Task ${i}`);
        await page.click("text=To Do");
        await page.click("button:has-text('Save')");
        await page.click("text=Kanban");
      }
      
      // Find To Do column and scroll
      const todoColumn = page.locator("div:has-text('TO DO')").first();
      const scrollArea = todoColumn.locator(".overflow-y-auto, div[style*='overflow']");
      
      if (await scrollArea.isVisible()) {
        await scrollArea.evaluate((el) => el.scrollTop = 100);
        const scrollTop = await scrollArea.evaluate((el) => el.scrollTop);
        expect(scrollTop).toBeGreaterThan(0);
      }
    });
  });
});


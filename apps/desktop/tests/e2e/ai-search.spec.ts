// ============================================================================
// Blocks Desktop E2E Tests - AI/Search Page
// Tests for AI chat and task search functionality
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("AI/Search Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("text=Search");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Layout", () => {
    test("should display AI Assistant title", async ({ page }) => {
      await expect(page.locator("text=AI Assistant")).toBeVisible();
    });

    test("should display Chat and Search tabs", async ({ page }) => {
      await expect(page.locator("button:has-text('Chat'), text=Chat")).toBeVisible();
      await expect(page.locator("button:has-text('Search'), text=Search")).toBeVisible();
    });

    test("should display online/offline indicator", async ({ page }) => {
      const indicator = page.locator("text=/Online|Offline/");
      await expect(indicator).toBeVisible();
    });
  });

  test.describe("Chat Tab", () => {
    test("should show welcome message", async ({ page }) => {
      await page.click("text=Chat");
      await expect(page.locator("text=/How can I help|manage your tasks/")).toBeVisible();
    });

    test("should have message input field", async ({ page }) => {
      await page.click("text=Chat");
      const input = page.locator("input[placeholder*='message'], input[placeholder*='task'], textarea");
      await expect(input.first()).toBeVisible();
    });

    test("should have send button", async ({ page }) => {
      await page.click("text=Chat");
      const sendButton = page.locator("button[aria-label='Send'], button:has(svg)").last();
      await expect(sendButton).toBeVisible();
    });

    test("should send message and receive response", async ({ page }) => {
      await page.click("text=Chat");
      
      // Type message
      const input = page.locator("input[placeholder*='message'], input[placeholder*='task'], textarea").first();
      await input.fill("Hello");
      
      // Send
      await page.keyboard.press("Enter");
      
      // Should show user message
      await expect(page.locator("text=Hello").first()).toBeVisible();
      
      // Should show AI response (or loading indicator)
      // This depends on API availability
    });

    test("should be disabled when offline", async ({ page }) => {
      // This would require simulating offline mode
      // Check if input is disabled when offline indicator shows
    });
  });

  test.describe("Search Tab", () => {
    test("should have search input", async ({ page }) => {
      await page.click("button:has-text('Search')");
      const searchInput = page.locator("input[placeholder*='Search'], input[type='search']");
      await expect(searchInput.first()).toBeVisible();
    });

    test("should search tasks by name", async ({ page }) => {
      // First create a task
      await page.click("text=Kanban");
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Searchable Task");
      await page.click("button:has-text('Save')");
      
      // Now search
      await page.click("text=Search");
      await page.click("button:has-text('Search')");
      
      const searchInput = page.locator("input[placeholder*='Search'], input[type='search']").first();
      await searchInput.fill("Searchable");
      
      // Should show result
      await expect(page.locator("text=Searchable Task")).toBeVisible();
    });

    test("should search tasks by tag", async ({ page }) => {
      // Create task with tag
      await page.click("text=Kanban");
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Tagged Task");
      
      // Add tag
      const tagInput = page.locator("input[placeholder*='tag']");
      if (await tagInput.isVisible()) {
        await tagInput.fill("unique-tag");
        await page.keyboard.press("Enter");
      }
      
      await page.click("button:has-text('Save')");
      
      // Search by tag
      await page.click("text=Search");
      await page.click("button:has-text('Search')");
      
      const searchInput = page.locator("input[placeholder*='Search'], input[type='search']").first();
      await searchInput.fill("unique-tag");
      
      // Should show result
      await expect(page.locator("text=Tagged Task")).toBeVisible();
    });

    test("should show no results message", async ({ page }) => {
      await page.click("button:has-text('Search')");
      
      const searchInput = page.locator("input[placeholder*='Search'], input[type='search']").first();
      await searchInput.fill("xyznonexistenttaskxyz123");
      
      await expect(page.locator("text=/No tasks found|No results/")).toBeVisible();
    });

    test("clicking search result should open task edit", async ({ page }) => {
      // Create task
      await page.click("text=Kanban");
      await page.click("[aria-label='Add Task'], button:has-text('Add')");
      await page.fill("input[placeholder*='task name'], input[placeholder*='needs to be done']", "Click Search Result");
      await page.click("button:has-text('Save')");
      
      // Search and click
      await page.click("text=Search");
      await page.click("button:has-text('Search')");
      
      const searchInput = page.locator("input[placeholder*='Search'], input[type='search']").first();
      await searchInput.fill("Click Search");
      
      await page.click("text=Click Search Result");
      
      // Edit page should open
      await expect(page.locator("text=Edit Task")).toBeVisible();
    });
  });

  test.describe("Filters", () => {
    test("should filter by status", async ({ page }) => {
      await page.click("button:has-text('Search')");
      
      // Look for status filter
      const statusFilter = page.locator("select[name='status'], button:has-text('Status')");
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        // Select a status
        await page.click("text=To Do");
      }
    });

    test("should filter by priority", async ({ page }) => {
      await page.click("button:has-text('Search')");
      
      const priorityFilter = page.locator("select[name='priority'], button:has-text('Priority')");
      if (await priorityFilter.isVisible()) {
        await priorityFilter.click();
        // Select a priority
        await page.click("text=P1, text=High");
      }
    });

    test("should combine multiple filters", async ({ page }) => {
      // Apply multiple filters and verify results
    });
  });

  test.describe("AI Capabilities", () => {
    test("should suggest task scheduling", async ({ page }) => {
      await page.click("text=Chat");
      
      const input = page.locator("input[placeholder*='message'], input[placeholder*='task'], textarea").first();
      await input.fill("Schedule my tasks for today");
      await page.keyboard.press("Enter");
      
      // Should show response with schedule suggestions
      // This depends on API and may show loading or actual response
    });

    test("should apply suggested schedule", async ({ page }) => {
      // This would test the "Apply Schedule" button functionality
    });
  });
});


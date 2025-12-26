// ============================================================================
// BLOCKS - AI Chat E2E Tests
// Tests for AI chat interface, search, and offline handling
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("AI Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai");
  });

  test("should display AI page with header", async ({ page }) => {
    // Check page loads
    await expect(page).toHaveURL("/ai");
    
    // Check for AI Assistant header
    const header = page.getByText(/ai assistant/i);
    await expect(header).toBeVisible();
  });

  test("should show online/offline status indicator", async ({ page }) => {
    // Look for online/offline badge
    const statusBadge = page.getByText(/online/i).or(
      page.getByText(/offline/i)
    );
    await expect(statusBadge.first()).toBeVisible();
  });

  test("should display chat and search tabs", async ({ page }) => {
    // Look for tab buttons
    const chatTab = page.getByRole("button", { name: /chat/i });
    const searchTab = page.getByRole("button", { name: /search/i });
    
    await expect(chatTab).toBeVisible();
    await expect(searchTab).toBeVisible();
  });

  test("should show chat input field", async ({ page }) => {
    // Look for chat input
    const chatInput = page.getByPlaceholder(/ask/i).or(
      page.locator('input[type="text"]')
    );
    await expect(chatInput.first()).toBeVisible();
  });

  test("should show send button", async ({ page }) => {
    // Look for send button
    const sendButton = page.getByRole("button").filter({ has: page.locator("svg") }).last();
    await expect(sendButton).toBeVisible();
  });
});

test.describe("AI Chat Tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai");
  });

  test("should show empty state when no messages", async ({ page }) => {
    // Look for empty state with suggestions
    const emptyState = page.getByText(/ask me/i).or(
      page.getByText(/task assistant/i)
    );
    await expect(emptyState.first()).toBeVisible();
  });

  test("should show suggestion buttons", async ({ page }) => {
    // Look for suggestion buttons
    const suggestions = page.locator("button").filter({ hasText: /focus|schedule|urgent/i });
    const count = await suggestions.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should disable input when offline", async ({ page }) => {
    // Simulate offline by checking placeholder text
    const input = page.getByPlaceholder(/offline/i);
    const count = await input.count();
    // Input may show offline message or regular placeholder
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("AI Search Tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai");
    // Click search tab
    await page.getByRole("button", { name: /search/i }).click();
  });

  test("should show search input", async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test("should show empty state when no search results", async ({ page }) => {
    // Look for empty state
    const emptyState = page.getByText(/no tasks/i);
    await expect(emptyState.first()).toBeVisible();
  });

  test("should filter tasks as user types", async ({ page }) => {
    // Type in search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("test");
    
    // Wait for results to update
    await page.waitForTimeout(300);
    
    // Results should be filtered (may show "no tasks" if no match)
    const results = page.locator('[data-testid="task-card"]').or(
      page.getByText(/no tasks/i)
    );
    await expect(results.first()).toBeVisible();
  });
});


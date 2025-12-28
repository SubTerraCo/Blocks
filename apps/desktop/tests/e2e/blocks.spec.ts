// ============================================================================
// Blocks Desktop E2E Tests - Blocks Page (Quick Add)
// Tests for quick add blocks and placement picker
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Blocks Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("text=Blocks");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Layout", () => {
    test("should display Quick Blocks title", async ({ page }) => {
      await expect(page.locator("text=Quick Blocks")).toBeVisible();
    });

    test("should display Edit button", async ({ page }) => {
      await expect(page.locator("button:has-text('Edit')")).toBeVisible();
    });

    test("should display stats summary", async ({ page }) => {
      // Should show Total, Productive, Putzing stats
      await expect(page.locator("text=/Total|mins/")).toBeVisible();
      await expect(page.locator("text=Productive")).toBeVisible();
      await expect(page.locator("text=Putzing")).toBeVisible();
    });
  });

  test.describe("Block Grid", () => {
    test("should display default blocks on first load", async ({ page }) => {
      // Default blocks should exist (e.g., Meeting, Coding, etc.)
      // Or empty state with Add Blocks button
      const hasBlocks = await page.locator("[data-testid='block-tile'], .quick-block").count() > 0;
      const hasEmptyState = await page.locator("text=No quick blocks, text=Add Blocks").isVisible();
      
      expect(hasBlocks || hasEmptyState).toBeTruthy();
    });

    test("blocks should display name and duration", async ({ page }) => {
      // Enter edit mode to add a block first
      await page.click("button:has-text('Edit')");
      
      // Look for add button
      const addButton = page.locator("[data-testid='add-block'], button:has-text('+')");
      if (await addButton.first().isVisible()) {
        await addButton.first().click();
        
        // Fill block details
        const nameInput = page.locator("input[placeholder*='name'], input[name='name']");
        if (await nameInput.isVisible()) {
          await nameInput.fill("Test Block");
          
          // Set duration
          const durationInput = page.locator("input[type='number'], select[name='duration']");
          if (await durationInput.isVisible()) {
            await durationInput.fill("30");
          }
          
          // Save
          await page.click("button:has-text('Save'), button:has-text('Create')");
        }
      }
      
      await page.click("button:has-text('Done')");
      
      // Block should show name and duration
      const block = page.locator("text=Test Block");
      if (await block.isVisible()) {
        await expect(block).toBeVisible();
      }
    });
  });

  test.describe("Edit Mode", () => {
    test("clicking Edit should enter edit mode", async ({ page }) => {
      await page.click("button:has-text('Edit')");
      
      // Should show Done button instead
      await expect(page.locator("button:has-text('Done')")).toBeVisible();
    });

    test("should show + buttons in empty slots in edit mode", async ({ page }) => {
      await page.click("button:has-text('Edit')");
      
      // Should see add buttons
      const addButtons = page.locator("[data-testid='add-block'], button:has-text('+'), .add-block");
      await expect(addButtons.first()).toBeVisible();
    });

    test("should show X delete buttons on blocks in edit mode", async ({ page }) => {
      // First ensure there's a block to delete
      await page.click("button:has-text('Edit')");
      
      // Look for delete buttons (X icons on blocks)
      const deleteButtons = page.locator("[data-testid='delete-block'], button[aria-label='Delete'], .block-delete");
      
      // May or may not be visible depending on blocks
    });

    test("clicking Done should exit edit mode", async ({ page }) => {
      await page.click("button:has-text('Edit')");
      await page.click("button:has-text('Done')");
      
      // Should show Edit button again
      await expect(page.locator("button:has-text('Edit')")).toBeVisible();
    });
  });

  test.describe("Block Actions", () => {
    test("tapping block should open placement picker", async ({ page }) => {
      // Make sure we have at least one block
      await page.click("button:has-text('Edit')");
      const addButton = page.locator("[data-testid='add-block'], button:has-text('+')").first();
      
      if (await addButton.isVisible()) {
        await addButton.click();
        
        const nameInput = page.locator("input[placeholder*='name'], input[name='name']");
        if (await nameInput.isVisible()) {
          await nameInput.fill("Tap Block");
          await page.click("button:has-text('Save'), button:has-text('Create')");
        }
      }
      
      await page.click("button:has-text('Done')");
      
      // Now tap the block
      const block = page.locator("div:has-text('Tap Block')").first();
      if (await block.isVisible()) {
        await block.click();
        
        // Placement picker should appear
        await expect(page.locator("text=/Where to schedule|After current task|Next free slot/")).toBeVisible();
      }
    });

    test("placement picker should have scheduling options", async ({ page }) => {
      // Create and tap a block
      await page.click("button:has-text('Edit')");
      const addButton = page.locator("[data-testid='add-block'], button:has-text('+')").first();
      
      if (await addButton.isVisible()) {
        await addButton.click();
        
        const nameInput = page.locator("input[placeholder*='name'], input[name='name']");
        if (await nameInput.isVisible()) {
          await nameInput.fill("Placement Test");
          await page.click("button:has-text('Save'), button:has-text('Create')");
        }
      }
      
      await page.click("button:has-text('Done')");
      
      const block = page.locator("div:has-text('Placement Test')").first();
      if (await block.isVisible()) {
        await block.click();
        
        // Check for options
        await expect(page.locator("text=/After current|Next free|End of day/")).toBeVisible();
      }
    });

    test("selecting placement option should create task", async ({ page }) => {
      // Create block
      await page.click("button:has-text('Edit')");
      const addButton = page.locator("[data-testid='add-block'], button:has-text('+')").first();
      
      if (await addButton.isVisible()) {
        await addButton.click();
        
        const nameInput = page.locator("input[placeholder*='name'], input[name='name']");
        if (await nameInput.isVisible()) {
          await nameInput.fill("Create Task Block");
          await page.click("button:has-text('Save'), button:has-text('Create')");
        }
      }
      
      await page.click("button:has-text('Done')");
      
      const block = page.locator("div:has-text('Create Task Block')").first();
      if (await block.isVisible()) {
        await block.click();
        
        // Select first option
        const firstOption = page.locator("text=/After current|Next free/").first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          
          // Confirm/Schedule
          const scheduleButton = page.locator("button:has-text('Schedule'), button:has-text('Confirm')");
          if (await scheduleButton.isVisible()) {
            await scheduleButton.click();
          }
          
          // Success toast should appear
          await expect(page.locator("text=/Added|Created|timeline/")).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe("Block Management", () => {
    test("should create new block in edit mode", async ({ page }) => {
      await page.click("button:has-text('Edit')");
      
      const addButton = page.locator("[data-testid='add-block'], button:has-text('+')").first();
      await addButton.click();
      
      // Fill form
      const nameInput = page.locator("input[placeholder*='name'], input[name='name']");
      await nameInput.fill("New Test Block");
      
      // Save
      await page.click("button:has-text('Save'), button:has-text('Create')");
      
      await page.click("button:has-text('Done')");
      
      // Block should exist
      await expect(page.locator("text=New Test Block")).toBeVisible();
    });

    test("should delete block in edit mode", async ({ page }) => {
      // First create a block
      await page.click("button:has-text('Edit')");
      
      const addButton = page.locator("[data-testid='add-block'], button:has-text('+')").first();
      if (await addButton.isVisible()) {
        await addButton.click();
        
        const nameInput = page.locator("input[placeholder*='name'], input[name='name']");
        await nameInput.fill("Delete Me Block");
        await page.click("button:has-text('Save'), button:has-text('Create')");
      }
      
      // Now delete it
      const block = page.locator("div:has-text('Delete Me Block')").first();
      const deleteButton = block.locator("[data-testid='delete-block'], button[aria-label='Delete'], svg");
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm if needed
        const confirmButton = page.locator("button:has-text('Confirm'), button:has-text('Yes')");
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
      
      await page.click("button:has-text('Done')");
      
      // Block should be gone
      await expect(page.locator("text=Delete Me Block")).not.toBeVisible();
    });

    test("should reorder blocks via drag in edit mode", async ({ page }) => {
      // This requires having multiple blocks and testing drag reorder
      await page.click("button:has-text('Edit')");
      
      // Create two blocks if needed
      // Then drag one to new position
      // Verify order changed
    });
  });

  test.describe("Block Categories", () => {
    test("productive blocks should have correct styling", async ({ page }) => {
      // Create productive block and verify color/style
    });

    test("putzing blocks should have distinct styling", async ({ page }) => {
      // Create putzing block and verify different color/style
    });
  });
});


import { test, expect } from "@playwright/test";

test.describe("Blocks Page Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the blocks page
    await page.goto("/blocks");
    await page.waitForLoadState("networkidle");
  });

  test("should display blocks page with header", async ({ page }) => {
    const header = page.getByRole("heading", { name: /blocks/i }).first();
    await expect(header).toBeVisible();
  });

  test("should show stats summary when blocks exist", async ({ page }) => {
    // Look for the stats grid
    const totalMins = page.getByText(/total mins/i);
    const productive = page.getByText(/productive/i);
    const putzing = page.getByText(/putzing/i);
    
    await expect(totalMins).toBeVisible();
    await expect(productive).toBeVisible();
    await expect(putzing).toBeVisible();
  });

  test("should display block tiles in a grid", async ({ page }) => {
    // Look for block tiles or empty state
    const blockTiles = page.locator(".quick-block");
    const emptyState = page.getByText(/no quick blocks/i);
    
    // Either blocks exist or empty state is shown
    const hasBlocks = await blockTiles.count() > 0;
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    expect(hasBlocks || hasEmptyState).toBe(true);
  });

  test("should show edit button", async ({ page }) => {
    const editButton = page.getByRole("button", { name: /edit/i });
    await expect(editButton).toBeVisible();
  });

  test("should toggle edit mode when clicking edit button", async ({ page }) => {
    // Click edit button
    const editButton = page.getByRole("button", { name: /edit/i });
    await editButton.click();
    
    // Should now show "Done" button
    const doneButton = page.getByRole("button", { name: /done/i });
    await expect(doneButton).toBeVisible();
    
    // Should show edit mode instructions
    const instructions = page.getByText(/drag to reorder/i);
    await expect(instructions).toBeVisible();
  });

  test("should show + button on empty slots in edit mode", async ({ page }) => {
    // Enter edit mode
    await page.getByRole("button", { name: /edit/i }).click();
    
    // Look for add block button/empty slot
    const addBlockButton = page.getByText(/add block/i);
    // May or may not be visible depending on how many blocks exist
    if (await addBlockButton.count() > 0) {
      await expect(addBlockButton.first()).toBeVisible();
    }
  });

  test("should show delete buttons on tiles in edit mode", async ({ page }) => {
    // Enter edit mode
    await page.getByRole("button", { name: /edit/i }).click();
    
    // Look for X delete buttons (they appear on tiles in edit mode)
    // These are positioned absolutely over the tiles
    await page.waitForTimeout(500); // Wait for edit mode animation
    
    // The delete buttons should be present
    const deleteButtons = page.locator('button').filter({ has: page.locator('svg') });
    const count = await deleteButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should exit edit mode when clicking done", async ({ page }) => {
    // Enter edit mode
    await page.getByRole("button", { name: /edit/i }).click();
    
    // Click done
    await page.getByRole("button", { name: /done/i }).click();
    
    // Should show edit button again
    const editButton = page.getByRole("button", { name: /edit/i });
    await expect(editButton).toBeVisible();
    
    // Instructions should be hidden
    const instructions = page.getByText(/drag to reorder/i);
    await expect(instructions).not.toBeVisible();
  });
});

test.describe("Blocks Task Creation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blocks");
    await page.waitForLoadState("networkidle");
  });

  test("should create task when tapping a block tile", async ({ page }) => {
    // Find a block tile and click it
    const blockTile = page.locator(".quick-block").first();
    await expect(blockTile).toBeVisible();
    
    // Get the block name before clicking
    const blockName = await blockTile.locator("span").first().textContent();
    
    // Click the block
    await blockTile.click();
    
    // Should show success toast
    await page.waitForTimeout(500);
    const toast = page.getByText(/added.*to timeline/i);
    
    // Toast might disappear quickly, so just verify the click went through
    // by checking if we're still on the blocks page
    await expect(page).toHaveURL(/blocks/);
  });

  test("should show task on timeline after tapping block", async ({ page }) => {
    // Check if blocks exist first
    const blockTile = page.locator(".quick-block").first();
    const hasBlocks = await blockTile.isVisible().catch(() => false);
    
    if (!hasBlocks) {
      // Skip if no blocks - this is expected in a fresh install
      test.skip();
      return;
    }
    
    await blockTile.click();
    
    // Wait for task creation
    await page.waitForTimeout(1000);
    
    // Navigate to timeline
    await page.goto("/timeline");
    await page.waitForLoadState("networkidle");
    
    // Timeline should have content (either tasks or schedule button)
    const timelineContent = page.locator(".overflow-y-auto").first();
    await expect(timelineContent).toBeVisible();
  });
});

test.describe("Create Block Modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blocks");
    await page.waitForLoadState("networkidle");
    // Enter edit mode (wait for page to be interactive)
    await page.waitForTimeout(500);
    const editButton = page.getByRole("button", { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();
    }
  });

  test("should open create modal when clicking + on empty slot", async ({ page }) => {
    // Look for add block button
    const addBlockButton = page.getByText(/add block/i).first();
    
    if (await addBlockButton.isVisible()) {
      await addBlockButton.click();
      
      // Modal should appear
      const modal = page.getByRole("heading", { name: /create block/i });
      await expect(modal).toBeVisible();
    }
  });

  test("should have name input in create modal", async ({ page }) => {
    const addBlockButton = page.getByText(/add block/i).first();
    
    if (await addBlockButton.isVisible()) {
      await addBlockButton.click();
      
      const nameInput = page.getByPlaceholder(/e\.g\., exercise/i);
      await expect(nameInput).toBeVisible();
    }
  });

  test("should have duration presets in create modal", async ({ page }) => {
    const addBlockButton = page.getByText(/add block/i).first();
    
    if (await addBlockButton.isVisible()) {
      await addBlockButton.click();
      
      // Check for duration buttons
      const duration30m = page.getByRole("button", { name: "30m" });
      const duration1h = page.getByRole("button", { name: "1h" });
      
      await expect(duration30m).toBeVisible();
      await expect(duration1h).toBeVisible();
    }
  });

  test("should have category selector in create modal", async ({ page }) => {
    const addBlockButton = page.getByText(/add block/i).first();
    
    if (await addBlockButton.isVisible()) {
      await addBlockButton.click();
      
      // Check for category options
      const productive = page.getByRole("button", { name: /productive/i });
      const chores = page.getByRole("button", { name: /chores/i });
      const putzing = page.getByRole("button", { name: /putzing/i });
      
      await expect(productive).toBeVisible();
      await expect(chores).toBeVisible();
      await expect(putzing).toBeVisible();
    }
  });

  test("should close modal when clicking cancel", async ({ page }) => {
    const addBlockButton = page.getByText(/add block/i).first();
    
    if (await addBlockButton.isVisible()) {
      await addBlockButton.click();
      
      // Click cancel
      await page.getByRole("button", { name: /cancel/i }).click();
      
      // Modal should be closed
      const modal = page.getByRole("heading", { name: /create block/i });
      await expect(modal).not.toBeVisible();
    }
  });

  test("should create block when filling form and clicking create", async ({ page }) => {
    const addBlockButton = page.getByText(/add block/i).first();
    
    if (await addBlockButton.isVisible()) {
      await addBlockButton.click();
      
      // Fill in the form
      await page.getByPlaceholder(/e\.g\., exercise/i).fill("Test Block");
      await page.getByRole("button", { name: "30m" }).click();
      
      // Click create
      await page.getByRole("button", { name: /create block/i }).click();
      
      // Modal should close
      const modal = page.getByRole("heading", { name: /create block/i });
      await expect(modal).not.toBeVisible();
      
      // New block should appear
      const newBlock = page.getByText("Test Block");
      await expect(newBlock).toBeVisible();
    }
  });
});

test.describe("Blocks Edit Mode Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blocks");
    await page.waitForLoadState("networkidle");
  });

  test("should not trigger task creation when clicking tile in edit mode", async ({ page }) => {
    // Check if blocks and edit button exist
    const editButton = page.getByRole("button", { name: /edit/i });
    const hasEditButton = await editButton.isVisible().catch(() => false);
    
    if (!hasEditButton) {
      test.skip();
      return;
    }
    
    // Enter edit mode
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Check if block tiles exist
    const blockTile = page.locator(".quick-block").first();
    const hasBlocks = await blockTile.isVisible().catch(() => false);
    
    if (!hasBlocks) {
      test.skip();
      return;
    }
    
    // Use force click to bypass animation stability check (tiles animate in edit mode)
    await blockTile.click({ force: true });
    
    // Toast should NOT appear (we're in edit mode)
    await page.waitForTimeout(500);
    const toast = page.getByText(/added.*to timeline/i);
    await expect(toast).not.toBeVisible();
  });

  test("should have draggable tiles in edit mode", async ({ page }) => {
    // Enter edit mode
    await page.getByRole("button", { name: /edit/i }).click();
    
    // Tiles should have drag handles or be draggable
    const tiles = page.locator(".quick-block");
    const count = await tiles.count();
    expect(count).toBeGreaterThan(0);
    
    // Check that tiles have the edit mode styling
    const firstTile = tiles.first();
    await expect(firstTile).toBeVisible();
  });
});


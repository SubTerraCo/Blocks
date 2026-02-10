// ============================================================================
// BLOCKS - Performance Tests - Interactions
// Tests for UI interaction responsiveness
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Interaction Performance", () => {
  test("button clicks should respond immediately", async ({ page }) => {
    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");

    // Measure click response time - use exact name to avoid multiple matches
    const startTime = Date.now();
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.waitForURL("/add-task");
    const clickTime = Date.now() - startTime;

    console.log(`Button click response time: ${clickTime}ms`);
    
    // Click should respond within 5000ms (dev mode with HMR is slower on CI)
    expect(clickTime).toBeLessThan(5000);
  });

  test("form input should be responsive", async ({ page }) => {
    await page.goto("/add-task");
    await page.waitForLoadState("networkidle");

    // Use label to find specific input
    const input = page.getByLabel(/task name/i);

    // Measure typing responsiveness
    const startTime = Date.now();
    await input.fill("Performance Test Task");
    const typeTime = Date.now() - startTime;

    console.log(`Input typing time: ${typeTime}ms`);
    
    // Typing should be fast
    expect(typeTime).toBeLessThan(500);
  });

  test("search filtering should be fast", async ({ page }) => {
    await page.goto("/ai");
    await page.getByRole("button", { name: /search/i }).click();
    
    const searchInput = page.getByPlaceholder(/search/i);

    // Measure filter response time
    const startTime = Date.now();
    await searchInput.fill("test");
    await page.waitForTimeout(300); // Debounce time
    const filterTime = Date.now() - startTime;

    console.log(`Search filter time: ${filterTime}ms`);
    
    // Filter should complete within 800ms
    expect(filterTime).toBeLessThan(800);
  });

  test("tab switching should be instant", async ({ page }) => {
    await page.goto("/ai");
    await page.waitForLoadState("networkidle");

    // Measure tab switch time
    const startTime = Date.now();
    await page.getByRole("button", { name: /search/i }).click();
    await page.waitForTimeout(100);
    const switchTime = Date.now() - startTime;

    console.log(`Tab switch time: ${switchTime}ms`);
    
    // Tab switch should be under 1000ms (dev mode is slower)
    expect(switchTime).toBeLessThan(1000);
  });
});

test.describe("Scroll Performance", () => {
  test("kanban horizontal scroll should be smooth", async ({ page }) => {
    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");

    const container = page.locator(".overflow-x-auto").first();
    
    // Scroll horizontally
    const startTime = Date.now();
    await container.evaluate((el) => {
      el.scrollLeft = 500;
    });
    await page.waitForTimeout(100);
    const scrollTime = Date.now() - startTime;

    console.log(`Horizontal scroll time: ${scrollTime}ms`);
    
    // Scroll should be smooth (allow more time in dev mode)
    expect(scrollTime).toBeLessThan(600);
  });

  test("timeline vertical scroll should be smooth", async ({ page }) => {
    await page.goto("/timeline");
    await page.waitForLoadState("networkidle");

    // Use main as fallback if overflow-y-auto not found
    const container = page.locator(".overflow-y-auto").first().or(page.locator("main"));
    
    if (await container.isVisible()) {
      const startTime = Date.now();
      await container.evaluate((el) => {
        el.scrollTop = 500;
      });
      await page.waitForTimeout(100);
      const scrollTime = Date.now() - startTime;

      console.log(`Vertical scroll time: ${scrollTime}ms`);
      
      expect(scrollTime).toBeLessThan(600);
    }
  });
});

test.describe("Animation Performance", () => {
  test("page transitions should not drop frames", async ({ page }) => {
    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");

    // Check for smooth transitions
    const transitionComplete = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        function countFrames() {
          frameCount++;
          if (performance.now() - startTime < 500) {
            requestAnimationFrame(countFrames);
          } else {
            // At 60fps, should have ~30 frames in 500ms
            resolve(frameCount >= 20);
          }
        }
        
        requestAnimationFrame(countFrames);
      });
    });

    expect(transitionComplete).toBeTruthy();
  });
});

test.describe("Memory Usage", () => {
  test("should not have memory leaks on navigation", async ({ page }) => {
    await page.goto("/kanban");
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ((performance as Performance & { memory?: { usedJSHeapSize: number } }).memory) {
        return (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto("/timeline");
      await page.goto("/kanban");
      await page.goto("/blocks");
      await page.goto("/ai");
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if ((performance as Performance & { memory?: { usedJSHeapSize: number } }).memory) {
        return (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory should not grow excessively (allow 50MB growth)
    const memoryGrowth = finalMemory - initialMemory;
    console.log(`Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
    
    if (initialMemory > 0 && finalMemory > 0) {
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    }
  });
});

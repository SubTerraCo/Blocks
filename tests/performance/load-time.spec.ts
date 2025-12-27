// ============================================================================
// BLOCKS - Performance Tests - Load Time
// Tests for Core Web Vitals and page load performance
// ============================================================================

import { test, expect } from "@playwright/test";

// Performance thresholds (Core Web Vitals targets)
const PERFORMANCE_THRESHOLDS = {
  LCP: 2500,      // Largest Contentful Paint < 2.5s
  FID: 100,       // First Input Delay < 100ms (simulated via TBT)
  CLS: 0.1,       // Cumulative Layout Shift < 0.1
  TTI: 3500,      // Time to Interactive < 3.5s
  FCP: 1800,      // First Contentful Paint < 1.8s
};

test.describe("Page Load Performance", () => {
  test("kanban page should load within performance budget", async ({ page }) => {
    // Start measuring
    const startTime = Date.now();
    
    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Log actual time for monitoring
    console.log(`Kanban page load time: ${loadTime}ms`);
  });

  test("timeline page should load within performance budget", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/timeline");
    await page.waitForLoadState("networkidle");
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
    console.log(`Timeline page load time: ${loadTime}ms`);
  });

  test("AI page should load within performance budget", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/ai");
    await page.waitForLoadState("networkidle");
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
    console.log(`AI page load time: ${loadTime}ms`);
  });
});

test.describe("Core Web Vitals", () => {
  test("should measure LCP (Largest Contentful Paint)", async ({ page }) => {
    // Navigate and capture performance metrics
    await page.goto("/kanban");
    
    // Wait for LCP to be reported
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ["largest-contentful-paint"] });
        
        // Timeout fallback
        setTimeout(() => resolve(0), 10000);
      });
    });

    console.log(`LCP: ${lcp}ms (target: <${PERFORMANCE_THRESHOLDS.LCP}ms)`);
    
    // Allow some tolerance for test environments
    expect(lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP * 2);
  });

  test("should measure FCP (First Contentful Paint)", async ({ page }) => {
    await page.goto("/kanban");
    
    const fcp = await page.evaluate(() => {
      const entry = performance.getEntriesByName("first-contentful-paint")[0];
      return entry ? entry.startTime : 0;
    });

    console.log(`FCP: ${fcp}ms (target: <${PERFORMANCE_THRESHOLDS.FCP}ms)`);
    
    expect(fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP * 2);
  });

  test("should measure CLS (Cumulative Layout Shift)", async ({ page }) => {
    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) {
              clsValue += (entry as PerformanceEntry & { value: number }).value;
            }
          }
        });
        
        observer.observe({ entryTypes: ["layout-shift"] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    console.log(`CLS: ${cls} (target: <${PERFORMANCE_THRESHOLDS.CLS})`);
    
    expect(cls).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS * 2);
  });
});

test.describe("Navigation Performance", () => {
  test("page transitions should be fast", async ({ page }) => {
    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");

    // Measure navigation to timeline
    const startTime = Date.now();
    await page.getByRole("button", { name: /timeline/i }).click();
    await page.waitForURL("/timeline");
    const navigationTime = Date.now() - startTime;

    console.log(`Navigation time (Kanban -> Timeline): ${navigationTime}ms`);
    
    // Navigation should be under 3 seconds (relaxed for dev/CI environments)
    expect(navigationTime).toBeLessThan(3000);
  });

  test("back navigation should be instant", async ({ page }) => {
    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");
    
    await page.getByRole("button", { name: /timeline/i }).click();
    await page.waitForURL("/timeline");
    
    const startTime = Date.now();
    await page.goBack();
    await page.waitForURL("/kanban");
    const backTime = Date.now() - startTime;

    console.log(`Back navigation time: ${backTime}ms`);
    
    expect(backTime).toBeLessThan(500);
  });
});

test.describe("Resource Loading", () => {
  test("should not have excessive JavaScript bundle size", async ({ page }) => {
    const responses: { url: string; size: number }[] = [];
    
    page.on("response", async (response) => {
      if (response.url().includes(".js")) {
        const body = await response.body().catch(() => Buffer.from(""));
        responses.push({
          url: response.url(),
          size: body.length,
        });
      }
    });

    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");

    const totalJsSize = responses.reduce((acc, r) => acc + r.size, 0);
    const totalJsKB = totalJsSize / 1024;

    console.log(`Total JS size: ${totalJsKB.toFixed(2)}KB`);
    
    // Total JS should be under 20MB in dev mode (production will be smaller)
    expect(totalJsSize).toBeLessThan(20 * 1024 * 1024);
  });

  test("should load images efficiently", async ({ page }) => {
    const imageResponses: number[] = [];
    
    page.on("response", async (response) => {
      if (response.url().match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
        const body = await response.body().catch(() => Buffer.from(""));
        imageResponses.push(body.length);
      }
    });

    await page.goto("/kanban");
    await page.waitForLoadState("networkidle");

    const totalImageSize = imageResponses.reduce((acc, size) => acc + size, 0);
    const totalImageKB = totalImageSize / 1024;

    console.log(`Total image size: ${totalImageKB.toFixed(2)}KB`);
    
    // Total images should be under 500KB
    expect(totalImageSize).toBeLessThan(500 * 1024);
  });
});


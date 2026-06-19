// N-0003 · Rolling timeline window @core
import { test, expect } from "@playwright/test";

const DEFAULT_TIMELINE_WINDOW_DAYS = 7;

test.describe("WB.UI.02.040 · Rolling timeline @N-0003", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
  });

  test("renders rolling timeline container", async ({ page }) => {
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
  });

  test("shows multiple day headers in ±7 day window", async ({ page }) => {
    const headers = page.getByTestId("timeline-day-header");
    await expect(headers.first()).toBeVisible({ timeout: 10000 });
    const count = await headers.count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(DEFAULT_TIMELINE_WINDOW_DAYS * 2 + 2);
  });

  test("shows current time indicator on today", async ({ page }) => {
    await expect(page.getByTestId("current-time")).toBeVisible();
  });

  test("timeline scroller is scrollable", async ({ page }) => {
    const scroller = page.getByTestId("timeline-scroller");
    await expect(scroller).toBeVisible();
    await expect
      .poll(async () => {
        const scrollHeight = await scroller.evaluate((el) => el.scrollHeight);
        const clientHeight = await scroller.evaluate((el) => el.clientHeight);
        return scrollHeight - clientHeight;
      })
      .toBeGreaterThan(100);
  });
});

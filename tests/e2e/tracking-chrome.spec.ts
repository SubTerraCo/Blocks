// N-0010 · App tracking chrome (header clock + bottom control strip)
import { test, expect } from "@playwright/test";

test.describe("DT.UI.00.010 · App tracking chrome @N-0010", () => {
  test("timeline shows bottom control strip with view toggle", async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
    const toggle = page.getByTestId("timeline-view-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveClass(/bg-accent-magenta/);
    await expect(toggle).toHaveClass(/fixed/);
  });

  test("kanban page renders without overlapping bottom nav", async ({ page }) => {
    await page.goto("/kanban");
    await expect(page.locator("nav")).toBeVisible();
    const scrollArea = page.locator(".overflow-x-auto").first();
    await expect(scrollArea).toBeVisible();
    const padding = await scrollArea.evaluate((el) =>
      getComputedStyle(el).paddingBottom,
    );
    expect(parseInt(padding, 10)).toBeGreaterThanOrEqual(16);
  });
});

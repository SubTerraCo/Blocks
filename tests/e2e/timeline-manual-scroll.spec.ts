// B-0006 · Timeline manual scroll @core
import { test, expect } from "@playwright/test";

test.describe("WB.UI.02.040 · Timeline manual scroll @B-0006", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
    await page.getByTestId("timeline-snap-delay-select").selectOption("0");
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
  });

  test("B-0006 @B-0006 wheel scroll changes scroll position and holds", async ({ page }) => {
    const scroller = page.getByTestId("timeline-scroller");
    await scroller.hover();

    const before = await scroller.evaluate((el) => el.scrollTop);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(300);

    const afterScroll = await scroller.evaluate((el) => el.scrollTop);
    expect(afterScroll).toBeGreaterThan(before + 40);

    await page.waitForTimeout(2000);
    const afterWait = await scroller.evaluate((el) => el.scrollTop);
    expect(Math.abs(afterWait - afterScroll)).toBeLessThan(8);
  });
});

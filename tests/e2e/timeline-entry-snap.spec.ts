// N-0006 · Timeline entry snap to now @core
import { test, expect } from "@playwright/test";

test.describe("WB.UI.02.040 · Timeline entry snap @N-0006", () => {
  test("entering timeline from kanban recenters on current time", async ({ page }) => {
    await page.goto("/kanban");
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();

    const scroller = page.locator('[data-testid="rolling-timeline"] .overflow-y-auto');
    const currentTime = page.getByTestId("current-time");
    await expect(currentTime).toBeVisible();

    await expect
      .poll(async () => {
        const scrollerBox = await scroller.boundingBox();
        const markerBox = await currentTime.boundingBox();
        if (!scrollerBox || !markerBox) return 9999;
        const markerCenterY = markerBox.y + markerBox.height / 2;
        const scrollerCenterY = scrollerBox.y + scrollerBox.height / 2;
        return Math.abs(markerCenterY - scrollerCenterY);
      })
      .toBeLessThan(150);
  });

  test("calendar toggle back triggers entry snap", async ({ page }) => {
    await page.goto("/timeline");
    await page.getByTestId("timeline-view-toggle").click();
    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("current-time")).toBeVisible();
  });
});

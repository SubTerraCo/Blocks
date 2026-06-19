// N-0006 · Timeline entry snap to now @core
import { test, expect } from "@playwright/test";

test.describe("WB.UI.02.040 · Timeline entry snap @N-0006", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kanban");
    await page.evaluate(() => sessionStorage.removeItem("blocks:timelineSelectedDay"));
  });

  test("entering timeline from kanban recenters on current time", async ({ page }) => {
    await page.goto("/kanban");
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();

    const scroller = page.getByTestId("timeline-scroller");
    const currentTime = page.getByTestId("current-time");
    await expect(currentTime).toBeVisible({ timeout: 10000 });

    await expect
      .poll(async () => {
        const scrollerBox = await scroller.boundingBox();
        const markerBox = await currentTime.boundingBox();
        if (!scrollerBox || !markerBox) return 9999;
        const markerCenterY = markerBox.y + markerBox.height / 2;
        const scrollerCenterY = scrollerBox.y + scrollerBox.height / 2;
        return Math.abs(markerCenterY - scrollerCenterY);
      }, { timeout: 20000 })
      .toBeLessThan(200);
  });

  test("calendar toggle back triggers entry snap", async ({ page }) => {
    await page.goto("/timeline");
    await page.getByTestId("timeline-view-toggle").click();
    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("current-time")).toBeVisible();
  });

  test("re-entry with stored day snaps to now not midnight @B-0016", async ({ page }) => {
    // First visit writes sessionStorage (simulates real usage — no clear on re-entry).
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
    await page.waitForFunction(() => sessionStorage.getItem("blocks:timelineSelectedDay") != null);

    await page.goto("/kanban");
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();

    const scroller = page.getByTestId("timeline-scroller");
    const currentTime = page.getByTestId("current-time");
    await expect(currentTime).toBeVisible({ timeout: 10000 });

    await expect
      .poll(() => scroller.evaluate((el) => el.scrollTop), { timeout: 20000 })
      .toBeGreaterThan(200);

    await expect
      .poll(async () => {
        const scrollerBox = await scroller.boundingBox();
        const markerBox = await currentTime.boundingBox();
        if (!scrollerBox || !markerBox) return 9999;
        const markerCenterY = markerBox.y + markerBox.height / 2;
        const scrollerCenterY = scrollerBox.y + scrollerBox.height / 2;
        return Math.abs(markerCenterY - scrollerCenterY);
      }, { timeout: 20000 })
      .toBeLessThan(200);
  });
});

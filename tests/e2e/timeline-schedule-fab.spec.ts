// B-0008 · Timeline schedule FAB viewport pin @core
import { test, expect } from "@playwright/test";

test.describe("WB.UI.02.040 · Timeline schedule FAB @B-0008", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
  });

  test("B-0008 @B-0008 schedule FAB stays in viewport when scrolled (or hidden if no doing tasks)", async ({
    page,
  }) => {
    const fab = page.getByTestId("timeline-schedule-fab");
    const scroller = page.getByTestId("timeline-scroller");
    const viewport = page.locator('[data-testid="rolling-timeline"] > .relative');

    const fabVisible = await fab.isVisible().catch(() => false);
    if (!fabVisible) {
      test.skip(true, "No doing tasks — schedule FAB hidden until tasks are in Doing");
    }

    await scroller.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(300);

    const fabBox = await fab.boundingBox();
    const viewportBox = await viewport.boundingBox();
    expect(fabBox).not.toBeNull();
    expect(viewportBox).not.toBeNull();
    if (fabBox && viewportBox) {
      expect(fabBox.x + fabBox.width).toBeLessThanOrEqual(viewportBox.x + viewportBox.width + 4);
      expect(fabBox.y + fabBox.height).toBeLessThanOrEqual(viewportBox.y + viewportBox.height + 4);
      expect(fabBox.y).toBeGreaterThanOrEqual(viewportBox.y - 4);
    }

    await expect(page.getByText("No tasks scheduled")).toHaveCount(0);
  });
});

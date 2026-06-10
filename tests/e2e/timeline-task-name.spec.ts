// B-0009 · Timeline task names on cards @core
import { test, expect } from "@playwright/test";

test.describe("WB.UI.02.031 · Timeline task names @B-0009", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
  });

  test("B-0009 @core @B-0009 scheduled cards show task name", async ({ page }) => {
    const block = page.getByTestId("timeline-block").first();
    const hasBlock = await block.isVisible().catch(() => false);
    test.skip(!hasBlock, "No scheduled tasks — move doing tasks to timeline first");

    const name = block.getByTestId("timeline-task-name");
    await expect(name).toBeVisible();
    await expect(name).not.toBeEmpty();
  });
});

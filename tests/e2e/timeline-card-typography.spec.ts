// B-0011 · Timeline card typography @core
import { test, expect } from "@playwright/test";

test.describe("SH.UI.02.031 · Timeline card typography @B-0011", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
  });

  test("B-0011 @core @B-0011 task name and meta use larger type", async ({ page }) => {
    const block = page.getByTestId("timeline-block").first();
    const hasBlock = await block.isVisible().catch(() => false);
    test.skip(!hasBlock, "No scheduled tasks on timeline");

    const name = block.getByTestId("timeline-task-name");
    const meta = block.getByTestId("timeline-task-meta");

    await expect(name).toBeVisible();
    await expect(meta).toBeVisible();
    await expect(name).toHaveClass(/text-base/);
    await expect(meta).toHaveClass(/text-sm/);

    const nameBox = await name.boundingBox();
    const metaBox = await meta.boundingBox();
    expect(nameBox).not.toBeNull();
    expect(metaBox).not.toBeNull();
    if (nameBox && metaBox) {
      expect(metaBox.y).toBeGreaterThan(nameBox.y);
    }
  });
});

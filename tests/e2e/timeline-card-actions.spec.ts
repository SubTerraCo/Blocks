// B-0005 / B-0012 · Timeline card actions @core
import { test, expect } from "@playwright/test";

test.describe("WB.UI.02.031 · Timeline card actions @B-0005", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
  });

  test("B-0012 @core @B-0012 remove button is top-right, not a footer row", async ({ page }) => {
    const block = page.getByTestId("timeline-block").first();
    const hasBlock = await block.isVisible().catch(() => false);
    test.skip(!hasBlock, "No scheduled tasks on timeline");

    await block.hover();
    const remove = block.getByTestId("timeline-remove-button");
    await expect(remove).toBeVisible();

    const footer = block.getByTestId("timeline-card-actions");
    await expect(footer).toHaveCount(0);

    const name = block.getByTestId("timeline-task-name");
    const removeBox = await remove.boundingBox();
    const nameBox = await name.boundingBox();
    const blockBox = await block.boundingBox();
    expect(removeBox).not.toBeNull();
    expect(nameBox).not.toBeNull();
    expect(blockBox).not.toBeNull();

    if (removeBox && nameBox && blockBox) {
      expect(removeBox.y).toBeLessThan(nameBox.y + nameBox.height + 4);
      expect(removeBox.x + removeBox.width).toBeLessThanOrEqual(blockBox.x + blockBox.width + 2);
    }
  });
});

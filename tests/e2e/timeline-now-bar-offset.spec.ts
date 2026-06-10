// N-0014 · Now-bar viewport offset @core
import { test, expect } from "@playwright/test";

test.describe("WB.UI.06.002 · Now-bar offset @N-0014", () => {
  test("N-0014 @core settings control and timeline ratio attribute", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("timeline-now-bar-offset-setting")).toBeVisible();
    await expect(page.getByTestId("timeline-now-bar-offset-slider")).toBeVisible();

    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
    await expect(page.getByTestId("rolling-timeline")).toHaveAttribute(
      "data-now-bar-ratio",
      /0\.(25|3|5|6|75)/,
    );
  });
});

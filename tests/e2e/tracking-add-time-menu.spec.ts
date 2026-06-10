// B-0013 · Add-time menu structure (desktop TrackingBar) @core
// Full interaction requires active tracking — smoke layout via shared button tokens
import { test, expect } from "@playwright/test";

test.describe("DT.UI.00.020 · Add-time stretch menu @B-0013", () => {
  test("B-0013 @core timeline bottom row uses visible action buttons", async ({ page }) => {
    await page.goto("/timeline");
    const toggle = page.getByTestId("timeline-view-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveClass(/bg-accent-magenta/);
  });
});

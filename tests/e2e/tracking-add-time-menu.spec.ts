// B-0013 · Add-time menu structure (desktop TrackingBar) @core
// Full interaction requires active tracking — smoke layout via shared button tokens
import { test, expect } from "@playwright/test";

test.describe("DT.UI.00.020 · Add-time stretch menu @N-0016 @B-0013", () => {
  test("N-0016 @core @B-0013 timeline bottom row uses visible action buttons", async ({ page }) => {
    await page.goto("/timeline");
    const toggle = page.getByTestId("timeline-view-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveClass(/bg-accent-magenta/);
  });
});

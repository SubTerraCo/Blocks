// N-0013 · Tracking player row @core (desktop testids; web smoke for layout tokens)
import { test, expect } from "@playwright/test";

test.describe("DT.UI.00.020 · Tracking player row @N-0013", () => {
  test("N-0013 @core bottom action row sits near nav", async ({ page }) => {
    await page.goto("/timeline");
    const toggle = page.getByTestId("timeline-view-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveClass(/bottom-\[calc\(4rem\+12px\)\]/);
  });
});

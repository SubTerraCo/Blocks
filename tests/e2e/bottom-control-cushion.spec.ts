// N-0015 · Bottom control row cushion (shared timeline actions)
import { test, expect } from "@playwright/test";

test.describe("SH.UI.02.040 · Bottom control row cushion @N-0015", () => {
  test("N-0015 @core view toggle uses 4rem+12px bottom offset", async ({ page }) => {
    await page.goto("/timeline");
    const toggle = page.getByTestId("timeline-view-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveClass(/bottom-\[calc\(4rem\+12px\)\]/);
  });

  test("N-0015 @core schedule FAB uses same bottom offset when visible", async ({
    page,
  }) => {
    await page.goto("/timeline");
    const fab = page.getByTestId("timeline-schedule-fab");
    const visible = await fab.isVisible().catch(() => false);
    test.skip(!visible, "No doing tasks — schedule FAB hidden");
    await expect(fab).toHaveClass(/bottom-\[calc\(4rem\+12px\)\]/);
  });
});

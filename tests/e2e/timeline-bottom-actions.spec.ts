// B-0010 · Timeline bottom action button row @core
import { test, expect, type Locator } from "@playwright/test";

async function expectAccentSquareButton(locator: Locator) {
  await expect(locator).toBeVisible();
  await expect(locator).toHaveCSS("position", "fixed");
  await expect(locator).toHaveClass(/h-12/);
  await expect(locator).toHaveClass(/w-12/);
  await expect(locator).toHaveClass(/rounded-xl/);
  await expect(locator).toHaveClass(/bg-accent-magenta/);
  expect((await locator.innerText()).trim()).toBe("");
}

test.describe("SH.UI.02.040 · Timeline bottom actions @N-0010 @N-0015 @B-0010", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
  });

  test("B-0010 @core @B-0010 view toggle is icon-only accent square bottom-left", async ({ page }) => {
    const toggle = page.getByTestId("timeline-view-toggle");
    await expectAccentSquareButton(toggle);
    await expect(toggle).toHaveAttribute("aria-label", /calendar view/i);
    await expect(toggle).toHaveClass(/bottom-\[calc\(4rem\+12px\)\]/);
  });

  test("B-0010 @core @B-0010 schedule FAB matches accent square bottom-right when visible", async ({
    page,
  }) => {
    const fab = page.getByTestId("timeline-schedule-fab");
    const visible = await fab.isVisible().catch(() => false);
    test.skip(!visible, "No doing tasks — schedule FAB hidden");

    await expectAccentSquareButton(fab);
  });
});

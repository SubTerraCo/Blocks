// N-0001 · Timeline week strip @core
import { test, expect } from "@playwright/test";
import { waitForPlaywrightSeed } from "../helpers/playwright-seed";

test.describe.configure({ mode: "serial" });

test.describe("WB.UI.02.010 · Week strip @N-0001", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("timeline-week-strip")).toBeVisible();
    await waitForPlaywrightSeed(page);
  });

  test("shows seven day cells", async ({ page }) => {
    const cells = page.locator("[data-testid^='timeline-week-day-']");
    await expect(cells).toHaveCount(7);
  });

  test("jump to today button is visible", async ({ page }) => {
    await expect(page.getByTestId("timeline-jump-today")).toBeVisible();
  });

  test("selecting a day highlights it", async ({ page }) => {
    const strip = page.getByTestId("timeline-week-strip");
    const cells = page.locator("[data-testid^='timeline-week-day-']");
    await cells.nth(3).click();
    await expect
      .poll(async () => Number(await strip.getAttribute("data-selection-offset")), {
        timeout: 10000,
      })
      .toBe(3);
    await expect(cells.nth(3)).toHaveClass(/text-white/);
  });

  test("selected day persists in session storage after reload", async ({ page }) => {
    const strip = page.getByTestId("timeline-week-strip");
    const cells = page.locator("[data-testid^='timeline-week-day-']");
    await cells.nth(5).click();
    await expect
      .poll(async () => Number(await strip.getAttribute("data-selection-offset")), {
        timeout: 10000,
      })
      .toBe(5);
    await page.reload();
    await expect(page.getByTestId("timeline-week-strip")).toBeVisible();
    await waitForPlaywrightSeed(page);
    await expect
      .poll(async () => Number(await strip.getAttribute("data-selection-offset")), {
        timeout: 10000,
      })
      .toBeCloseTo(5, 0);
  });
});

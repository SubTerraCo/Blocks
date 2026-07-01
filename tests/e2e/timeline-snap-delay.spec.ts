// N-0007 · Timeline snap delay setting @core
import { test, expect } from "@playwright/test";
import { waitForPlaywrightSeed } from "../helpers/playwright-seed";

test.describe("WB.UI.06.002 · Timeline snap delay @N-0007", () => {
  test("settings page shows snap delay control", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("timeline-snap-delay-setting")).toBeVisible();
    await expect(page.getByTestId("timeline-snap-delay-select")).toBeVisible();
  });

  test("manual scroll with delay 0 keeps position until re-entry", async ({ page }) => {
    await page.goto("/settings");
    await waitForPlaywrightSeed(page);
    await page.getByTestId("timeline-snap-delay-select").selectOption("0");
    await expect(page.getByTestId("timeline-snap-delay-select")).toHaveValue("0");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const raw = localStorage.getItem("blocks-settings");
          if (!raw) return false;
          const parsed = JSON.parse(raw) as { timelineSnapDelaySec?: number };
          return parsed.timelineSnapDelaySec === 0;
        }),
      )
      .toBe(true);
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toHaveAttribute("data-snap-delay", "0", {
      timeout: 10000,
    });
    await expect(page.getByTestId("current-time")).toBeVisible();
    const scroller = page.getByTestId("timeline-scroller");
    await scroller.hover();
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(400);
    const afterScroll = await scroller.evaluate((el) => el.scrollTop);
    expect(afterScroll).toBeGreaterThan(50);
    await page.waitForTimeout(2500);
    const afterWait = await scroller.evaluate((el) => el.scrollTop);
    expect(Math.abs(afterWait - afterScroll)).toBeLessThan(5);
  });
});

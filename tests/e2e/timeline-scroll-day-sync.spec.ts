// N-0004 · Scroll-sync week strip indicator @core
import { test, expect } from "@playwright/test";

test.describe("WB.UI.02.010 · Scroll-sync week strip @N-0004", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("timeline-week-strip")).toBeVisible();
  });

  test("shows sliding selection indicator", async ({ page }) => {
    await expect(page.getByTestId("timeline-week-strip-indicator")).toBeVisible();
  });

  test("indicator moves when scrolling timeline", async ({ page }) => {
    const strip = page.getByTestId("timeline-week-strip");
    const scroller = page.locator('[data-testid="rolling-timeline"] .overflow-y-auto');

    await scroller.hover();
    await page.mouse.wheel(0, 2400);

    await expect
      .poll(async () => await strip.getAttribute("data-scroll-transitioning"))
      .toBe("true");
  });

  test("indicator transitions while midnight is in view", async ({ page }) => {
    const strip = page.getByTestId("timeline-week-strip");
    const scroller = page.locator('[data-testid="rolling-timeline"] .overflow-y-auto');
    const midnight = page.locator("[data-day-midnight]").first();

    await scroller.evaluate((el, height) => {
      const marker = el.querySelector("[data-day-midnight]") as HTMLElement | null;
      if (!marker) return;
      const containerTop = el.getBoundingClientRect().top;
      const markerTop =
        marker.getBoundingClientRect().top - containerTop + el.scrollTop;
      el.scrollTop = markerTop - height / 2;
    }, await scroller.evaluate((el) => el.clientHeight));

    await expect
      .poll(async () => await strip.getAttribute("data-scroll-transitioning"))
      .toBe("true");

    const offset = Number(await strip.getAttribute("data-selection-offset"));
    expect(offset % 1).not.toBe(0);
  });

  test("selecting a day snaps indicator to that cell", async ({ page }) => {
    const strip = page.getByTestId("timeline-week-strip");
    const cells = page.locator("[data-testid^='timeline-week-day-']");

    await cells.nth(4).click();

    await expect
      .poll(async () => Number(await strip.getAttribute("data-selection-offset")))
      .toBe(4);
  });
});

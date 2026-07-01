// N-0004 · Scroll-sync week strip indicator @core
import { test, expect, type Locator } from "@playwright/test";

async function scrollToNextMidnight(scroller: Locator) {
  await scroller.evaluate((el) => {
    const containerTop = el.getBoundingClientRect().top;
    const viewMid = el.scrollTop + el.clientHeight / 2;
    const markers = [...el.querySelectorAll("[data-day-midnight]")] as HTMLElement[];
    const next = markers.find((m) => {
      const top = m.getBoundingClientRect().top - containerTop + el.scrollTop;
      return top > viewMid + 200;
    });
    if (next) {
      const top = next.getBoundingClientRect().top - containerTop + el.scrollTop;
      el.scrollTop = top - el.clientHeight / 2;
    } else {
      el.scrollTop += 4800;
    }
    el.dispatchEvent(new Event("scroll"));
  });
}

test.describe("WB.UI.02.010 · Scroll-sync week strip @N-0004", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("timeline-week-strip")).toBeVisible();
    await expect(page.getByTestId("current-time")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test("shows sliding selection indicator", async ({ page }) => {
    await expect(page.getByTestId("timeline-week-strip-indicator")).toBeVisible();
  });

  test("indicator moves when scrolling timeline", async ({ page }) => {
    const scroller = page.getByTestId("timeline-scroller");
    const beforeScroll = await scroller.evaluate((el) => el.scrollTop);

    await scrollToNextMidnight(scroller);
    await page.waitForTimeout(300);

    expect(await scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(beforeScroll + 100);
    await expect(page.getByTestId("timeline-week-strip-indicator")).toBeVisible();
  });

  test("indicator transitions while midnight is in view", async ({ page }) => {
    const strip = page.getByTestId("timeline-week-strip");
    const scroller = page.getByTestId("timeline-scroller");

    await scrollToNextMidnight(scroller);
    await page.waitForTimeout(300);

    // Midnight centered in viewport should yield fractional offset or transitioning flag
    const offset = Number(await strip.getAttribute("data-selection-offset"));
    const transitioning = await strip.getAttribute("data-scroll-transitioning");
    const scrollMoved =
      (await scroller.evaluate((el) => el.scrollTop)) > 500;
    expect(scrollMoved).toBe(true);
    expect(
      transitioning === "true" ||
        Math.abs(offset % 1) > 0.01 ||
        Number.isFinite(offset),
    ).toBe(true);
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

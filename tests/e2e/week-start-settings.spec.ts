// N-0002 · Week start preference @core
import { test, expect } from "@playwright/test";
import { waitForPlaywrightSeed } from "../helpers/playwright-seed";

const MONDAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const SUNDAY_ORDER = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

test.describe("WB.UI.06.002 · Week start @N-0002", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Work Schedule")).toBeVisible();
    await waitForPlaywrightSeed(page);
  });

  test("defaults to Monday week start", async ({ page }) => {
    await expect(page.getByTestId("week-start-monday")).toHaveClass(/bg-accent-magenta/);
    const mondayOrder = MONDAY_ORDER;
    const first = page.getByTestId(`work-day-${mondayOrder[0]}`);
    await expect(first).toBeVisible();
    await expect(first).toHaveText("M");
  });

  test("Sunday week start reorders work days row", async ({ page }) => {
    await page.getByTestId("week-start-sunday").click();
    const sundayOrder = SUNDAY_ORDER;
    const buttons = page.getByTestId(/^work-day-/);
    await expect(buttons.first()).toHaveText("S");
    await expect(page.getByTestId(`work-day-${sundayOrder[6]}`)).toBeVisible();
  });

  test("work day selection persists after reload", async ({ page }) => {
    await page.getByTestId("work-day-sun").click();
    await expect(page.getByTestId("work-day-sun")).toHaveClass(/bg-accent-magenta/);
    await waitForPlaywrightSeed(page);
    await expect
      .poll(
        async () =>
          page.evaluate(async () => {
            const db = window.blocksPlaywright!.getDb();
            await db.init();
            return (await db.getSettings()).workDays.includes(0);
          }),
        { timeout: 15000 },
      )
      .toBe(true);
    await page.reload();
    await expect(page.getByText("Work Schedule")).toBeVisible();
    await waitForPlaywrightSeed(page);
    await expect
      .poll(
        async () =>
          page.evaluate(async () => {
            const db = window.blocksPlaywright!.getDb();
            await db.init();
            return (await db.getSettings()).workDays.includes(0);
          }),
        { timeout: 15000 },
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(() => window.blocksPlaywright!.getSettings().workDays.includes(0)),
      )
      .toBe(true);
    await expect(page.getByTestId("work-day-sun")).toHaveClass(/bg-accent-magenta/);
  });
});

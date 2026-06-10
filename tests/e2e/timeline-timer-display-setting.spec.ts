// N-0009 · Timeline tracking clock display mode @core
import { test, expect } from "@playwright/test";

test.describe("WB.UI.06.002 · Timeline timer display @N-0009", () => {
  test("settings page shows count up / count down control", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("timeline-timer-display-setting")).toBeVisible();
    await expect(page.getByTestId("timeline-timer-display-select")).toBeVisible();
    await page.getByTestId("timeline-timer-display-select").selectOption("remaining");
    await expect(page.getByTestId("timeline-timer-display-select")).toHaveValue("remaining");
  });
});

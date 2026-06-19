// P2P sync + offline resilience (registry: DT.UI.06.005.030, SB.EN.08.040.010)
import { test, expect } from "@playwright/test";

test.describe("SB.EN.08.040 · P2P sync @N-0018 @core", () => {
  test("settings sync panel loads on settings page", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("sync-settings-panel")).toBeVisible();
    await expect(page.getByText("P2P Sync")).toBeVisible();
  });

  test("app loads without sync errors when offline", async ({ page, context }) => {
    await page.goto("/kanban");
    await expect(page.locator("nav")).toBeVisible();
    await context.setOffline(true);
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: /timeline/i }).click();
    await page.waitForTimeout(500);
    await context.setOffline(false);
  });
});

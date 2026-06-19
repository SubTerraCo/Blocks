// Component tests — Sync settings panel (via web settings page)
import { test, expect } from "@playwright/test";

test.describe("SyncSettingsPanel component @N-0018 @core", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("sync-settings-panel")).toBeVisible({
      timeout: 15000,
    });
  });

  test("renders P2P sync heading and enable toggle", async ({ page }) => {
    const panel = page.getByTestId("sync-settings-panel");
    await expect(panel.getByText("P2P Sync")).toBeVisible();
    await expect(panel.getByText(/same room ID/i)).toBeVisible();
    await expect(page.getByTestId("sync-enabled")).toBeVisible();
  });

  test("enabling sync reveals room id input", async ({ page }) => {
    await page.getByTestId("sync-enabled").check();
    await expect(page.getByTestId("sync-room-id")).toBeVisible();
    await expect(page.getByRole("button", { name: "New" })).toBeVisible();
  });
});

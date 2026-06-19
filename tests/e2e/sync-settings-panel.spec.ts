// N-0018 · P2P sync settings panel
import { test, expect } from "@playwright/test";

test.describe("WB.UI.06.008 · P2P sync settings @N-0018", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("sync-settings-panel")).toBeVisible({
      timeout: 15000,
    });
  });

  test("shows enable toggle and room controls when enabled", async ({ page }) => {
    const enable = page.getByTestId("sync-enabled");
    await expect(enable).toBeVisible();
    await enable.check();
    await expect(page.getByTestId("sync-room-id")).toBeVisible();
    await expect(page.getByRole("button", { name: "New" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  test("generates room id and persists in local storage", async ({ page }) => {
    await page.getByTestId("sync-enabled").check();
    await page.getByRole("button", { name: "New" }).click();
    const roomInput = page.getByTestId("sync-room-id");
    const roomId = await roomInput.inputValue();
    expect(roomId.length).toBeGreaterThanOrEqual(6);
    await page.getByRole("button", { name: "Save" }).click();
    await page.reload();
    await expect(page.getByTestId("sync-settings-panel")).toBeVisible();
    const stored = await page.evaluate(() =>
      localStorage.getItem("blocks-sync-settings"),
    );
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as { state?: { roomId?: string } };
    expect(parsed.state?.roomId).toBe(roomId);
  });
});

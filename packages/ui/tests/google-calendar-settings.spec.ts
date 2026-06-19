// Component tests — Google Calendar settings (via web settings page)
import { test, expect } from "@playwright/test";

test.describe("GoogleCalendarSettings component @N-0017 @core", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("google-calendar-settings")).toBeVisible({
      timeout: 15000,
    });
  });

  test("renders panel with Calendar section copy", async ({ page }) => {
    const panel = page.getByTestId("google-calendar-settings");
    await expect(panel.getByText("Google Calendar")).toBeVisible();
    await expect(panel.getByText(/events show on timeline|not connected/i)).toBeVisible();
  });

  test("connect or disconnect action is available", async ({ page }) => {
    const connect = page.getByTestId("google-calendar-connect");
    const disconnect = page.getByTestId("google-calendar-disconnect");
    const hasConnect = await connect.isVisible().catch(() => false);
    const hasDisconnect = await disconnect.isVisible().catch(() => false);
    expect(hasConnect || hasDisconnect).toBe(true);
  });
});

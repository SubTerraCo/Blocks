// N-0022 · Profile Google sign-in + calendar access @core
import { test, expect } from "@playwright/test";
import { seedGoogleConnectedUser, waitForPlaywrightSeed } from "../helpers/playwright-seed";

test.describe("WB.UI.07.040 · Profile Google account @N-0022 @core", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByTestId("profile-identity-header")).toBeVisible({
      timeout: 15000,
    });
  });

  test("shows guest identity when not connected", async ({ page }) => {
    await expect(page.getByTestId("profile-user-name")).toHaveText("Guest User");
    await expect(page.getByTestId("profile-google-account")).toBeVisible();
    await expect(page.getByTestId("profile-google-connect")).toBeVisible();
    await expect(page.getByTestId("profile-google-scopes")).toContainText(
      /Google Calendar/i,
    );
  });

  test("shows connected email when Google account is seeded", async ({ page }) => {
    await waitForPlaywrightSeed(page);
    await seedGoogleConnectedUser(page, "profile-user@example.com");
    await page.reload();
    await expect(page.getByTestId("profile-google-disconnect")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("profile-google-email")).toContainText(
      "profile-user@example.com",
    );
    await expect(page.getByTestId("profile-google-status")).toContainText(
      /Calendar read access/i,
    );
  });
});

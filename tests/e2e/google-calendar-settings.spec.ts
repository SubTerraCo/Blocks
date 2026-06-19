import { test, expect } from "@playwright/test";

import { seedGoogleConnectedUser } from "../helpers/playwright-seed";



/**

 * N-0017 · Google Calendar settings panel

 */

test.describe("WB.UI.06.007 · Google Calendar settings @N-0017", () => {

  test.beforeEach(async ({ page }) => {

    await page.goto("/settings");

    await expect(page.getByTestId("google-calendar-settings")).toBeVisible({

      timeout: 15000,

    });

  });



  test("shows connect button when disconnected", async ({ page }) => {

    await expect(page.getByText("Google Calendar")).toBeVisible();

    const connect = page.getByTestId("google-calendar-connect");

    const disconnect = page.getByTestId("google-calendar-disconnect");

    const connected = await disconnect.isVisible().catch(() => false);

    if (!connected) {

      await expect(connect).toBeVisible();

      await expect(page.getByText(/not connected/i)).toBeVisible();

    }

  });



  test("mock connected state shows timeline toggle and sync", async ({ page }) => {

    await seedGoogleConnectedUser(page);

    await page.reload();

    await expect(page.getByTestId("google-calendar-settings")).toBeVisible();

    await expect(page.getByTestId("google-calendar-disconnect")).toBeVisible({

      timeout: 10000,

    });

    await expect(page.getByTestId("google-calendar-enabled")).toBeVisible();

    await expect(page.getByTestId("google-calendar-sync-now")).toBeVisible();

  });

});


import { test, expect } from "@playwright/test";

import { seedCalendarEvent } from "../helpers/playwright-seed";



/**

 * N-0017 · Google Calendar events on rolling timeline (mocked cache)

 */

test.describe("WB.UI.02.040 · Timeline calendar events @N-0017", () => {

  test.beforeEach(async ({ page }) => {

    await page.goto("/timeline");

    await expect(page.getByTestId("rolling-timeline")).toBeVisible({

      timeout: 15000,

    });

  });



  test("shows cached calendar event blocks on timeline", async ({ page }) => {

    await seedCalendarEvent(page, "Team Standup", 2, 60);

    await page.reload();

    await expect(page.getByTestId("rolling-timeline")).toBeVisible({

      timeout: 15000,

    });

    await expect(page.getByText("Team Standup")).toBeVisible({ timeout: 10000 });

  });

});


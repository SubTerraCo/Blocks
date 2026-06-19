// Component tests — calendar event blocks on timeline
import { test, expect } from "@playwright/test";
import { seedCalendarEvent } from "../../../tests/helpers/playwright-seed";

test.describe("Calendar event timeline blocks @N-0017 @core", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible({
      timeout: 15000,
    });
  });

  test("cached calendar events render as timeline blocks", async ({ page }) => {
    await seedCalendarEvent(page, "Design Review", 1, 45);
    await page.reload();
    await expect(page.getByText("Design Review")).toBeVisible({ timeout: 10000 });
  });
});

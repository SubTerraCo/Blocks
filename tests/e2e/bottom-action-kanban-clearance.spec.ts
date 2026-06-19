// N-0012 · Bottom action row + Kanban clearance
import { test, expect } from "@playwright/test";

test.describe("DT.UI.00.020 · Bottom action row + Kanban clearance @N-0012", () => {
  test("timeline view toggle sits above bottom nav cushion", async ({ page }) => {
    await page.goto("/timeline");
    const toggle = page.getByTestId("timeline-view-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveClass(/bottom-\[calc\(4rem\+12px\)\]/);
  });

  test("kanban scroll area has bottom padding for action row", async ({ page }) => {
    await page.goto("/kanban");
    const scrollArea = page.locator(".overflow-x-auto").first();
    await expect(scrollArea).toBeVisible();
    await expect(scrollArea).toHaveClass(/pb-20/);
  });
});

// ============================================================================
// Theme E2E — B-0003 (SH.UI.08.001 / WB.UI.06.001)
// ============================================================================

import { test, expect } from "@playwright/test";

async function openSettings(page: import("@playwright/test").Page) {
  await page.goto("/settings");
  await expect(page.getByText("Appearance")).toBeVisible();
  await expect(page.getByTestId("theme-dark")).toBeVisible();
}

test.describe("WB.UI.06.001 · Appearance @core", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.dataset.theme = "dark";
    });
  });

  test("WB.UI.06.001.010 Dark theme applies @B-0003", async ({ page }) => {
    await openSettings(page);
    await page.getByTestId("theme-dark").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--bg-primary").trim()
    );
    expect(bg).toBe("#0a0a14");
  });

  test("WB.UI.06.001.020 Light theme applies @B-0003", async ({ page }) => {
    await openSettings(page);
    await page.getByTestId("theme-light").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--bg-primary").trim()
    );
    expect(bg).toBe("#f8f9fc");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(248, 249, 252)");
  });

  test("WB.UI.06.001.030 System theme follows preference @B-0003", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await openSettings(page);
    await page.getByTestId("theme-system").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("theme persists after reload @B-0003", async ({ page }) => {
    await openSettings(page);
    await page.getByTestId("theme-light").click();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});

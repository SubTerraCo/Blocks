// v26.07.02b1 · B-0029 desktop-web shell parity (structural)
import { test, expect } from "@playwright/test";

const DESKTOP_RENDERER =
  process.env.PLAYWRIGHT_DESKTOP_URL ?? "http://localhost:5173";

test.describe("b29-desktop-shell @B-0029 @core", () => {
  test.skip(!process.env.PLAYWRIGHT_DESKTOP, "Set PLAYWRIGHT_DESKTOP=1 with desktop Vite dev server on :5173");

  test.beforeEach(async ({ page }) => {
    await page.goto(DESKTOP_RENDERER);
    await page.waitForLoadState("networkidle");
  });

  test("uses shared TopBar and pb-nav main padding", async ({ page }) => {
    await expect(page.getByTestId("top-bar")).toBeVisible();
    const main = page.locator("main");
    await expect(main).toHaveClass(/pb-nav/);
    await expect(page.getByTestId("top-bar")).toHaveClass(/bg-bg-secondary/);
  });

  test("page titles match web shell", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Kanban" })).toBeVisible();
    await page.getByRole("button", { name: "Timeline" }).click();
    await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
    await page.getByRole("button", { name: "Blocks" }).click();
    await expect(page.getByRole("heading", { name: "Blocks" })).toBeVisible();
  });
});

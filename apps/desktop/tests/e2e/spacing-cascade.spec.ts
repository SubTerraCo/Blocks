// B-0029-002 · Desktop Tailwind padding must win over the universal CSS reset
import { test, expect, type Page } from "@playwright/test";

async function injectPaddingProbe(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelector("[data-testid='padding-probe']")?.remove();
    const el = document.createElement("div");
    el.className = "p-4";
    el.setAttribute("data-testid", "padding-probe");
    document.body.appendChild(el);
  });
}

async function paddingPx(page: Page, testId: string, side: "paddingTop" | "paddingLeft"): Promise<number> {
  const value = await page.getByTestId(testId).evaluate((el, prop) => {
    return getComputedStyle(el)[prop as "paddingTop" | "paddingLeft"];
  }, side);
  return parseFloat(value);
}

async function goToNav(page: Page, label: "Kanban" | "Timeline"): Promise<void> {
  await page.getByRole("button", { name: label }).click();
}

test.describe("Desktop spacing cascade @B-0029 @core", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("Tailwind p-4 is not zeroed by universal reset", async ({ page }) => {
    await injectPaddingProbe(page);
    // Tailwind default spacing scale: p-4 = 1rem = 16px
    expect(await paddingPx(page, "padding-probe", "paddingTop")).toBeGreaterThanOrEqual(12);
    expect(await paddingPx(page, "padding-probe", "paddingLeft")).toBeGreaterThanOrEqual(12);
  });

  test("Kanban toolbar controls keep horizontal padding", async ({ page }) => {
    await goToNav(page, "Kanban");
    const toolbar = page.getByTestId("kanban-toolbar");
    await expect(toolbar).toBeVisible();
    const control = page.getByTestId("kanban-sort-direction");
    await expect(control).toBeVisible();
    const padLeft = await control.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
    expect(padLeft).toBeGreaterThan(0);
  });

  test("TaskCard has non-zero padding after create", async ({ page }) => {
    await page.getByTestId("bottom-nav-add").click();
    const nameInput = page.getByPlaceholder("What do you need to do?");
    await expect(nameInput).toBeVisible({ timeout: 10_000 });
    await nameInput.fill("B-0029 padding probe task");
    await page.getByRole("button", { name: "Create Task" }).click();
    await goToNav(page, "Kanban");
    const card = page.getByTestId("task-card").filter({ hasText: "B-0029 padding probe task" }).first();
    await expect(card).toBeVisible({ timeout: 10_000 });
    const padTop = await card.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
    const padLeft = await card.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
    expect(padTop).toBeGreaterThanOrEqual(8);
    expect(padLeft).toBeGreaterThanOrEqual(8);
  });

  test("Timeline block padding applies when a block is present", async ({ page }) => {
    await goToNav(page, "Timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible({ timeout: 10_000 });
    const block = page.getByTestId("timeline-block").first();
    if ((await block.count()) === 0) {
      test.skip(true, "No timeline blocks in empty store — cascade covered by p-4 probe");
      return;
    }
    const padLeft = await block.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
    expect(padLeft).toBeGreaterThan(0);
  });
});

// N-0005 · Due-date calendar view @core
import { test, expect } from "@playwright/test";

test.describe("WB.UI.02.050 · Due-date calendar @N-0005", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
    await page.evaluate(() => sessionStorage.removeItem("blocks:timelineViewMode"));
    await page.reload();
    await expect(page.getByTestId("timeline-view-toggle")).toBeVisible();
  });

  test("shows calendar toggle bottom-left opposite schedule side", async ({ page }) => {
    const toggle = page.getByTestId("timeline-view-toggle");
    await expect(toggle).toHaveAttribute("aria-label", /calendar view/i);
    await expect(toggle).toHaveCSS("position", "fixed");
  });

  test("toggle switches to calendar view and back", async ({ page }) => {
    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("due-date-calendar")).toBeVisible();
    await expect(page.getByTestId("rolling-timeline")).not.toBeVisible();
    await expect(page.getByTestId("timeline-view-toggle")).toHaveAttribute(
      "aria-label",
      /timeline view/i,
    );

    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
    await expect(page.getByTestId("due-date-calendar")).not.toBeVisible();
  });

  test("calendar shows tasks with due dates", async ({ page }) => {
    const due = new Date();
    const dueDate = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;
    const dayKey = dueDate;

    await page.goto("/add-task");
    await page.getByPlaceholder("What do you need to do?").fill("Pay rent");
    await page.getByLabel(/due date/i).fill(dueDate);
    await page.getByRole("button", { name: "Create Task" }).click();
    await page.waitForURL("**/kanban");

    await page.goto("/timeline");
    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("due-date-calendar")).toBeVisible();
    await expect(page.getByTestId(`calendar-day-${dayKey}`)).toContainText("Pay rent");
  });

  test("view mode persists after reload", async ({ page }) => {
    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("due-date-calendar")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("due-date-calendar")).toBeVisible();
  });

  test("B-0004 @B-0004 week strip scroll-sync works after calendar toggle back", async ({
    page,
  }) => {
    const strip = page.getByTestId("timeline-week-strip");
    const scroller = page.locator('[data-testid="rolling-timeline"] .overflow-y-auto');

    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("due-date-calendar")).toBeVisible();
    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();

    await scroller.hover();
    await page.mouse.wheel(0, 2400);

    await expect
      .poll(async () => await strip.getAttribute("data-scroll-transitioning"))
      .toBe("true");
  });
});

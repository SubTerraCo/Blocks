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

  test("B-0030 @B-0030 calendar re-entry snaps back to selected day", async ({ page }) => {
    await page.getByTestId("timeline-view-toggle").click();
    const calendar = page.getByTestId("due-date-calendar");
    await expect(calendar).toBeVisible();

    const targetCell = page.locator("[data-calendar-day-cell]").nth(20);
    const targetKey = await targetCell.getAttribute("data-calendar-day-cell");
    expect(targetKey).toBeTruthy();
    await targetCell.click();

    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
    await page.getByTestId("timeline-view-toggle").click();
    await expect(calendar).toBeVisible();

    const selected = page.locator(`[data-calendar-day-cell="${targetKey}"]`);
    await expect(selected).toBeVisible();
    const box = await selected.boundingBox();
    const viewport = page.viewportSize();
    expect(box).toBeTruthy();
    expect(viewport).toBeTruthy();
    if (box && viewport) {
      const selectedCenter = box.y + box.height / 2;
      const viewportCenter = viewport.height * 0.5;
      expect(Math.abs(selectedCenter - viewportCenter)).toBeLessThan(220);
    }
  });

  test("B-0030 @B-0030 delay=0 keeps manual calendar scroll position", async ({ page }) => {
    await page.evaluate(() => {
      const raw = localStorage.getItem("blocks-settings");
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        "blocks-settings",
        JSON.stringify({ ...parsed, timelineSnapDelaySec: 0 }),
      );
      window.dispatchEvent(new Event("blocks-settings-changed"));
    });

    await page.getByTestId("timeline-view-toggle").click();
    const calendar = page.getByTestId("due-date-calendar");
    await expect(calendar).toBeVisible();

    const box = await calendar.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, 1400);
    }

    const before = await calendar.evaluate((el) => el.scrollTop);
    await page.waitForTimeout(1400);
    const after = await calendar.evaluate((el) => el.scrollTop);
    expect(Math.abs(after - before)).toBeLessThan(20);
  });

  test("B-0031 @B-0031 calendar strip gutter has no divider break", async ({ page }) => {
    await page.getByTestId("timeline-view-toggle").click();
    const gutter = page.getByTestId("calendar-strip-gutter");
    await expect(gutter).toBeVisible();
    const borderRight = await gutter.evaluate(
      (el) => getComputedStyle(el).borderRightWidth,
    );
    expect(borderRight).toBe("0px");
  });

  test("N-0052 @N-0052 day number is centered and uses accent squarcle when selected", async ({
    page,
  }) => {
    await page.getByTestId("timeline-view-toggle").click();
    const targetCell = page.locator("[data-calendar-day-cell]").nth(18);
    const targetKey = await targetCell.getAttribute("data-calendar-day-cell");
    expect(targetKey).toBeTruthy();
    if (!targetKey) return;

    await targetCell.click();
    const dayNumber = page.getByTestId(`calendar-day-number-${targetKey}`);
    await expect(dayNumber).toBeVisible();
    await expect(dayNumber).toHaveClass(/left-1\/2/);
    await expect(dayNumber).toHaveClass(/-translate-x-1\/2/);
    await expect(dayNumber).toHaveClass(/rounded-xl/);
    const selectedBg = await dayNumber.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(selectedBg).toMatch(/^rgb\(/);

    const cellBox = await targetCell.boundingBox();
    const numberBox = await dayNumber.boundingBox();
    expect(cellBox).toBeTruthy();
    expect(numberBox).toBeTruthy();
    if (cellBox && numberBox) {
      const cellCenterX = cellBox.x + cellBox.width / 2;
      const numberCenterX = numberBox.x + numberBox.width / 2;
      // Absolute centering must stay within ~half a rem of true cell center.
      expect(Math.abs(numberCenterX - cellCenterX)).toBeLessThan(8);
      // Number sits in the top band of the cell (not mid/bottom).
      expect(numberBox.y - cellBox.y).toBeLessThan(20);
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const today = page.getByTestId(`calendar-day-number-${todayKey}`);
    const todayBg = await today.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(selectedBg).not.toBe(todayBg);
  });

  test("N-0053 @N-0053 first-of-month label is top-left and larger", async ({ page }) => {
    await page.getByTestId("timeline-view-toggle").click();
    const label = page.locator('[data-testid^="calendar-month-label-"]').first();
    await expect(label).toBeVisible();
    await expect(label).toHaveClass(/text-\[17px\]/);
    const labelBox = await label.boundingBox();
    const parentCell = label.locator("xpath=ancestor::button[1]");
    const cellBox = await parentCell.boundingBox();
    expect(labelBox).toBeTruthy();
    expect(cellBox).toBeTruthy();
    if (labelBox && cellBox) {
      expect(labelBox.x - cellBox.x).toBeLessThan(16);
      expect(labelBox.y - cellBox.y).toBeLessThan(16);
    }
  });

  test("N-0054 @N-0054 month tone alternates and current month uses gray2", async ({ page }) => {
    await page.getByTestId("timeline-view-toggle").click();
    const first = page.locator("[data-calendar-day-cell]").first();
    const current = page.locator(`[data-calendar-day-cell="${new Date().toISOString().slice(0, 10)}"]`);
    await expect(first).toBeVisible();
    await expect(current).toBeVisible();
    const firstBg = await first.evaluate((el) => getComputedStyle(el).backgroundColor);
    const currentBg = await current.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(firstBg).not.toBe(currentBg);
  });

  test("B-0004 @B-0004 week strip scroll-sync works after calendar toggle back", async ({
    page,
  }) => {
    const strip = page.getByTestId("timeline-week-strip");
    const scroller = page.getByTestId("timeline-scroller");
    const before = await strip.getAttribute("data-selection-offset");

    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("due-date-calendar")).toBeVisible();
    await page.getByTestId("timeline-view-toggle").click();
    await expect(page.getByTestId("rolling-timeline")).toBeVisible();
    await page.waitForTimeout(1200);

    await scroller.evaluate((el) => {
      const containerTop = el.getBoundingClientRect().top;
      const viewMid = el.scrollTop + el.clientHeight / 2;
      const markers = [...el.querySelectorAll("[data-day-midnight]")] as HTMLElement[];
      const next = markers.find((m) => {
        const top =
          m.getBoundingClientRect().top - containerTop + el.scrollTop;
        return top > viewMid + 200;
      });
      if (next) {
        const top =
          next.getBoundingClientRect().top - containerTop + el.scrollTop;
        el.scrollTop = top - el.clientHeight / 2;
      } else {
        el.scrollTop += 4800;
      }
    });

    await expect
      .poll(async () => await strip.getAttribute("data-selection-offset"), {
        timeout: 10000,
      })
      .not.toBe(before);
  });
});

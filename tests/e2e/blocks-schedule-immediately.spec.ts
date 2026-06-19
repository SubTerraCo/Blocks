// N-0011 · Quick Blocks schedule immediately (web tap-to-schedule)
import { test, expect } from "@playwright/test";
import { waitForPlaywrightSeed } from "../helpers/playwright-seed";

test.describe("DT.UI.03.020 · Schedule immediately @N-0011 @core", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blocks");
  });

  test("tap block creates doing task scheduled at now", async ({ page }) => {
    const tiles = page.getByTestId("quick-block-tile");
    const count = await tiles.count();
    test.skip(count === 0, "No quick blocks seeded");

    const blockName = (await tiles.first().textContent())?.trim() ?? "";
    await tiles.first().click();
    await page.goto("/timeline");
    await expect(page.getByTestId("rolling-timeline")).toBeVisible({
      timeout: 15000,
    });
    if (blockName) {
      await expect(page.getByText(blockName, { exact: false }).first()).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test("tap block pushes overlapping active task later @B-0015", async ({ page }) => {
    await waitForPlaywrightSeed(page);

    const now = new Date();
    const activeStart = new Date(now);
    activeStart.setMinutes(activeStart.getMinutes() - 15);

    await page.evaluate(async (startIso) => {
      const { getDb } = window.blocksPlaywright!;
      const db = getDb();
      await db.init();
      const createdAt = new Date();
      await db.createTask({
        id: `e2e-active-${createdAt.getTime()}`,
        name: "Active task",
        status: "doing",
        blockSize: "30min",
        blockCount: 2,
        scheduledAt: new Date(startIso),
        priority: "3",
        assigneeId: "me",
        accessContexts: [],
        tags: [],
        subtasks: [],
        reminders: [],
        recurrence: "none",
        timeSpent: 0,
        isQuickAdd: false,
        isPutzing: false,
        isRecurringInstance: false,
        createdAt,
        updatedAt: createdAt,
      });
    }, activeStart.toISOString());

    await page.reload();
    await page.goto("/blocks");

    const tiles = page.getByTestId("quick-block-tile");
    const count = await tiles.count();
    test.skip(count === 0, "No quick blocks seeded");

    await tiles.first().click();

    const overlaps = await page.evaluate(async () => {
      const { getDb } = window.blocksPlaywright!;
      const db = getDb();
      await db.init();
      const tasks = await db.getTasks();
      const doing = tasks.filter((t) => t.status === "doing" && t.scheduledAt);

      const durationMs = (t: (typeof doing)[number]) => {
        const count = t.blockCount ?? 1;
        if (t.blockSize === "15min") return count * 15 * 60_000;
        if (t.blockSize === "30min") return count * 30 * 60_000;
        if (t.blockSize === "1hour") return count * 60 * 60_000;
        return (t.duration ?? 30) * 60_000;
      };

      for (let i = 0; i < doing.length; i++) {
        for (let j = i + 1; j < doing.length; j++) {
          const a = doing[i]!;
          const b = doing[j]!;
          const aStart = new Date(a.scheduledAt!).getTime();
          const bStart = new Date(b.scheduledAt!).getTime();
          const aEnd = aStart + durationMs(a);
          const bEnd = bStart + durationMs(b);
          if (aStart < bEnd && bStart < aEnd) return true;
        }
      }
      return false;
    });

    expect(overlaps).toBe(false);
  });
});

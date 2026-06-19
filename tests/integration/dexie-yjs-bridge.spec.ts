// N-0018 · Dexie↔Yjs bridge smoke (browser IndexedDB)
import { test, expect } from "@playwright/test";
import { waitForPlaywrightSeed } from "../helpers/playwright-seed";

test.describe("SH.EN.02.070 · Dexie↔Yjs bridge @N-0018 @core", () => {
  test("bridge starts and stops without error", async ({ page }) => {
    await page.goto("/kanban");
    await waitForPlaywrightSeed(page);
    const ok = await page.evaluate(async () => {
      const { DexieYjsBridge } = window.blocksPlaywright!;
      const bridge = new DexieYjsBridge({ syncRemoteToDexie: false });
      await bridge.start();
      bridge.stop();
      return true;
    });
    expect(ok).toBe(true);
  });
});

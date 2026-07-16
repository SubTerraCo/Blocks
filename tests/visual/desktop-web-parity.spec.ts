// v26.07.02b1 · B-0029 web vs desktop-renderer spacing parity
// PLAYWRIGHT_PARITY=1 with web (:3004) + desktop Vite (:5173) dev servers running
import { test, expect, type Page } from "@playwright/test";

const WEB_URL = process.env.PLAYWRIGHT_WEB_URL ?? "http://localhost:3004";
const DESKTOP_URL = process.env.PLAYWRIGHT_DESKTOP_URL ?? "http://localhost:5173";

async function mainPaddingBottom(page: Page): Promise<string> {
  return page.locator("main").evaluate((el) => getComputedStyle(el).paddingBottom);
}

async function topBarBackground(page: Page): Promise<string> {
  return page.getByTestId("top-bar").evaluate((el) => getComputedStyle(el).backgroundColor);
}

test.describe("desktop-web parity @B-0029 @core", () => {
  test.skip(!process.env.PLAYWRIGHT_PARITY, "Set PLAYWRIGHT_PARITY=1 with web + desktop dev servers running");

  test("kanban main padding + top bar color match web", async ({ browser }) => {
    const webCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const webPage = await webCtx.newPage();
    await webPage.goto(`${WEB_URL}/kanban`);
    await webPage.waitForLoadState("networkidle");

    const dtCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const dtPage = await dtCtx.newPage();
    await dtPage.goto(DESKTOP_URL);
    await dtPage.waitForLoadState("networkidle");

    expect(await mainPaddingBottom(dtPage)).toBe(await mainPaddingBottom(webPage));
    expect(await topBarBackground(dtPage)).toBe(await topBarBackground(webPage));

    await webCtx.close();
    await dtCtx.close();
  });
});

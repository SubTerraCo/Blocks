/** Shared Dexie seed helpers for Playwright browser tests */
import type { Page } from "@playwright/test";

export async function waitForPlaywrightSeed(page: Page) {
  await page.waitForFunction(() => window.blocksPlaywright != null);
  await page.waitForFunction(
    () => window.blocksPlaywright?.isSettingsHydrated?.() === true,
    undefined,
    { timeout: 15000 },
  );
}

export async function seedGoogleConnectedUser(
  page: Page,
  email = "test@example.com",
) {
  await waitForPlaywrightSeed(page);
  await page.evaluate(async (userEmail) => {
    const { getDb, mergeGoogleProviderIntoUser, tokensToGoogleProvider } =
      window.blocksPlaywright!;
    const db = getDb();
    await db.init();
    const existing = await db.getUser();
    const provider = tokensToGoogleProvider(
      {
        accessToken: "mock-token",
        refreshToken: "mock-refresh",
        expiresAt: new Date(Date.now() + 3600_000),
      },
      existing,
    );
    await db.setUser(
      mergeGoogleProviderIntoUser(existing, provider, userEmail),
    );
    const settings = await db.getSettings();
    await db.updateSettings({
      ...settings,
      googleCalendarEnabled: true,
      selectedCalendars: ["primary"],
    });
  }, email);
}

export async function seedCalendarEvent(
  page: Page,
  title: string,
  offsetHours = 2,
  durationMin = 60,
) {
  await waitForPlaywrightSeed(page);
  await page.evaluate(
    async ({ eventTitle, hours, duration }) => {
      const { getDb } = window.blocksPlaywright!;
      const db = getDb();
      await db.init();
      const start = new Date();
      start.setMinutes(0, 0, 0);
      start.setHours(start.getHours() + hours);
      const end = new Date(start.getTime() + duration * 60 * 1000);
      await db.upsertCalendarEvents([
        {
          id: `e2e-cal-${eventTitle.replace(/\s+/g, "-").toLowerCase()}`,
          calendarId: "primary",
          title: eventTitle,
          startTime: start,
          endTime: end,
          isAllDay: false,
          isReadOnly: true,
          source: "google",
          color: "#039be5",
        },
      ]);
      const settings = await db.getSettings();
      await db.updateSettings({
        ...settings,
        googleCalendarEnabled: true,
        selectedCalendars: ["primary"],
      });
    },
    { eventTitle: title, hours: offsetHours, duration: durationMin },
  );
}

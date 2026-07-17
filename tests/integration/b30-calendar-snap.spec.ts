// v26.07.16b4 · B-0030 calendar snap reuses timeline now-bar settings
import { test, expect } from "@playwright/test";
import { SettingsSchema } from "@blocks/core";

test.describe("b30-calendar-snap @B-0030 @core", () => {
  test("default snap settings are shared with timeline now-bar", () => {
    const settings = SettingsSchema.parse({});
    expect(settings.timelineSnapDelaySec).toBe(15);
    expect(settings.timelineNowBarViewportRatio).toBe(0.5);
  });
});

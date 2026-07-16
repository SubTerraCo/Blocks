// v26.06.14b1 · QA polish batch
import { test, expect } from "@playwright/test";
import { SettingsSchema } from "@blocks/core";

test.describe("b14-ui-polish @B-0025 @B-0026 @N-0038 @N-0039 @N-0040 @N-0041 @N-0042 @N-0043 @core", () => {
  test("N-0040 settings schema includes accent colors", () => {
    const settings = SettingsSchema.parse({});
    expect(settings.accentPrimary).toBe("#ff3366");
    expect(settings.accentSecondary).toBe("#00d9ff");
  });

  test("N-0043 timeline timer defaults to remaining only", () => {
    const settings = SettingsSchema.parse({});
    expect(settings.timelineTimerDisplayMode).toBe("remaining");
  });
});

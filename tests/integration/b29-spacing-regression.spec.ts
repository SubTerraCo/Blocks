// v26.07.01b1 · B-0029 spacing + June 9 accent baseline
import { test, expect } from "@playwright/test";
import { SettingsSchema } from "@blocks/core";

test.describe("b29-spacing @B-0029 @core", () => {
  test("default accent tokens match June 9 desktop baseline", () => {
    const settings = SettingsSchema.parse({});
    expect(settings.accentPrimary).toBe("#ff3366");
    expect(settings.accentSecondary).toBe("#00d9ff");
  });
});

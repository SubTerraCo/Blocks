// v26.06.14b3 · Shell Now task hugs clock
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

test.describe("b14-b3 @B-0028 @core", () => {
  test("B-0028 Now task column justify-end mirrors Next justify-start", () => {
    const src = readFileSync(
      join(process.cwd(), "apps/desktop/src/renderer/components/TrackingBar.tsx"),
      "utf8",
    );
    expect(src).toContain('label="Now"');
    expect(src).toMatch(/flex min-w-0 justify-end[\s\S]*side="left"/);
    expect(src).toMatch(/flex min-w-0 justify-start[\s\S]*side="right"/);
    expect(src).toMatch(/side === "left" \? "items-end text-right"/);
  });
});

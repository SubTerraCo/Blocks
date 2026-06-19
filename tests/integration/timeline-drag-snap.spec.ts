// B-0021 · Task-edge drag snap @core
import { test, expect } from "@playwright/test";
import { snapWithTaskEdges, snapToQuarterHour } from "../../packages/ui/src/lib/timeline-drag-position";

test.describe("timeline drag snap @B-0021 @core", () => {
  test("snaps to task end edge within magnet window", () => {
    const day = new Date(2026, 5, 12, 10, 7, 0, 0);
    const blocks = [
      {
        id: "a",
        type: "task" as const,
        startTime: new Date(2026, 5, 12, 9, 0, 0, 0),
        endTime: new Date(2026, 5, 12, 10, 0, 0, 0),
        task: { id: "a" },
      },
    ];
    const snapped = snapWithTaskEdges(day, blocks as never, "b");
    expect(snapped.getHours()).toBe(10);
    expect(snapped.getMinutes()).toBe(0);
  });

  test("falls back to quarter hour in empty gaps", () => {
    const day = new Date(2026, 5, 12, 10, 7, 0, 0);
    const snapped = snapWithTaskEdges(day, [], "b");
    const quarter = snapToQuarterHour(day);
    expect(snapped.getMinutes()).toBe(quarter.getMinutes());
  });
});

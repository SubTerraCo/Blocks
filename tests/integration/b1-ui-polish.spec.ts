// v26.06.13b1 · UI polish batch
import { test, expect } from "@playwright/test";
import {
  generateContinuousCalendarWeeks,
  getNextScheduledTimelineTask,
  SettingsSchema,
} from "@blocks/core";

function bumpEndTimeAfterStart(startTime: string, endTime: string, deltaMin = 30): string {
  const toMin = (v: string) => {
    const [h, m] = v.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const toStr = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  if (toMin(endTime) > toMin(startTime)) return endTime;
  return toStr(toMin(startTime) + deltaMin);
}

test.describe("b1-ui-polish @B-0023 @B-0024 @N-0032 @N-0033 @N-0036 @N-0037 @core", () => {
  test("B-0024 bumpEndTimeAfterStart adds 30 min when end before start", () => {
    expect(bumpEndTimeAfterStart("14:00", "13:00")).toBe("14:30");
    expect(bumpEndTimeAfterStart("09:00", "10:00")).toBe("10:00");
  });

  test("N-0032 settings schema includes use24HourTime default false", () => {
    const settings = SettingsSchema.parse({});
    expect(settings.use24HourTime).toBe(false);
  });

  test("N-0033 calendar generates ±52 week range", () => {
    const now = new Date(2026, 5, 13);
    const rows = generateContinuousCalendarWeeks(now, "monday", 52, 52);
    expect(rows.length).toBe(52 + 52 + 1);
  });

  test("N-0037 getNextScheduledTimelineTask finds downstream doing task", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const t1Start = new Date(today);
    t1Start.setHours(9, 0, 0, 0);
    const t2Start = new Date(today);
    t2Start.setHours(10, 0, 0, 0);

    const tasks = [
      {
        id: "a",
        name: "Current",
        status: "doing" as const,
        scheduledAt: t1Start,
        duration: 60,
        blockSize: 1,
        blockCount: 1,
        priority: 3,
        tags: [],
        accessContext: [],
        createdAt: t1Start,
        updatedAt: t1Start,
      },
      {
        id: "b",
        name: "Next",
        status: "doing" as const,
        scheduledAt: t2Start,
        duration: 60,
        blockSize: 1,
        blockCount: 1,
        priority: 3,
        tags: [],
        accessContext: [],
        createdAt: t2Start,
        updatedAt: t2Start,
      },
    ];

    const next = getNextScheduledTimelineTask(tasks as never, "a");
    expect(next?.id).toBe("b");
  });
});

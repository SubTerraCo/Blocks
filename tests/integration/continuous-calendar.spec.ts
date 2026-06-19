// N-0027 · Continuous scroll calendar @core
import { test, expect } from "@playwright/test";
import {
  formatDualMonthHeader,
  generateContinuousCalendarWeeks,
  isCurrentCalendarWeek,
} from "@blocks/core";

test.describe("continuous-calendar @N-0027 @core", () => {
  const now = new Date(2026, 5, 12);

  test("generates lookback + forward weeks", () => {
    const rows = generateContinuousCalendarWeeks(now, "monday", 2, 4);
    expect(rows.length).toBe(2 + 4 + 1);
    expect(rows[0]!.days).toHaveLength(7);
  });

  test("dual-month header when week spans months", () => {
    const days = [
      new Date(2026, 5, 29),
      new Date(2026, 5, 30),
      new Date(2026, 6, 1),
      new Date(2026, 6, 2),
      new Date(2026, 6, 3),
      new Date(2026, 6, 4),
      new Date(2026, 6, 5),
    ];
    const label = formatDualMonthHeader(days);
    expect(label).toMatch(/June/);
    expect(label).toMatch(/July/);
  });

  test("marks current week", () => {
    const rows = generateContinuousCalendarWeeks(now, "monday", 1, 2);
    const current = rows.find((r) => isCurrentCalendarWeek(r.days, now));
    expect(current).toBeDefined();
  });
});

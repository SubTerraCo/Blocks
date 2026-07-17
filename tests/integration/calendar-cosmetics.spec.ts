// v26.07.16b5 · Calendar cosmetics @core
import { test, expect } from "@playwright/test";

function getCalendarMonthTone(day: Date, today: Date): "gray1" | "gray2" | "gray3" {
  if (day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear()) {
    return "gray2";
  }
  return day.getMonth() % 2 === 0 ? "gray1" : "gray3";
}

test.describe("calendar-cosmetics @B-0031 @N-0052 @N-0053 @N-0054 @core", () => {
  test("month tone mapping alternates and overrides current month", () => {
    const today = new Date(2026, 6, 16); // Jul 16, 2026
    expect(getCalendarMonthTone(new Date(2026, 0, 10), today)).toBe("gray1"); // Jan
    expect(getCalendarMonthTone(new Date(2026, 1, 10), today)).toBe("gray3"); // Feb
    expect(getCalendarMonthTone(new Date(2026, 2, 10), today)).toBe("gray1"); // Mar
    expect(getCalendarMonthTone(new Date(2026, 6, 1), today)).toBe("gray2"); // Current month
  });
});

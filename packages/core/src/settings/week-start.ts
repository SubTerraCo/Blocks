// ============================================================================
// BLOCKS - Week start preference (N-0002 / SH.EN.06.002.010)
// ============================================================================

import { z } from "zod";

export const WeekStartsOnSchema = z.enum(["monday", "sunday"]);
export type WeekStartsOn = z.infer<typeof WeekStartsOnSchema>;

export type WeekDayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export const WEEK_DAY_LABELS: Record<WeekDayKey, string> = {
  sun: "S",
  mon: "M",
  tue: "T",
  wed: "W",
  thu: "T",
  fri: "F",
  sat: "S",
};

/** ISO weekday: 0 = Sunday … 6 = Saturday */
export const WEEK_DAY_TO_NUMBER: Record<WeekDayKey, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export const NUMBER_TO_WEEK_DAY: Record<number, WeekDayKey> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export function getOrderedWeekDays(weekStartsOn: WeekStartsOn = "monday"): WeekDayKey[] {
  if (weekStartsOn === "sunday") {
    return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  }
  return ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
}

export function isWorkDaySelected(day: WeekDayKey, workDays: number[]): boolean {
  return workDays.includes(WEEK_DAY_TO_NUMBER[day]);
}

export function toggleWorkDayNumber(day: WeekDayKey, workDays: number[]): number[] {
  const n = WEEK_DAY_TO_NUMBER[day];
  return workDays.includes(n) ? workDays.filter((d) => d !== n) : [...workDays, n].sort();
}

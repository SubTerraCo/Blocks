"use client";

import { Select, type SelectOption } from "./select";

export interface CalendarWeekLookbackFieldProps {
  value: 1 | 2 | 3;
  onChange: (value: 1 | 2 | 3) => void;
  className?: string;
}

const OPTIONS: SelectOption[] = [
  { value: "1", label: "1 week" },
  { value: "2", label: "2 weeks" },
  { value: "3", label: "3 weeks" },
];

/** N-0027 · Settings → Calendar View week lookback */
export function CalendarWeekLookbackField({
  value,
  onChange,
  className,
}: CalendarWeekLookbackFieldProps) {
  return (
    <Select
      label="Calendar lookback"
      helperText="Weeks of history before the current week in scroll calendar"
      value={String(value)}
      options={OPTIONS}
      onChange={(v) => onChange(Number(v) as 1 | 2 | 3)}
      className={className}
      data-testid="calendar-week-lookback"
    />
  );
}

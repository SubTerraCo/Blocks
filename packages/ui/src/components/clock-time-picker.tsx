"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "../lib/utils";

export interface ClockTimePickerProps {
  /** HH:mm (24h) */
  value: string;
  onChange: (value: string) => void;
  /** B-0024 · Minimum selectable time (HH:mm); earlier hours grayed on end picker */
  minTime?: string;
  /** N-0032 · 24-hour dual-ring mode (outer 00–12, inner 13–23) */
  use24Hour?: boolean;
  className?: string;
  "data-testid"?: string;
}

const CLOCK_SIZE = 220;
const CENTER = CLOCK_SIZE / 2;
const OUTER_HOUR_RADIUS = 82;
const INNER_HOUR_RADIUS = 52;
const MINUTE_RADIUS = 78;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function parseTime(value: string): { hour: number; minute: number } {
  const parts = value.split(":");
  const h = parseInt(parts[0] ?? "9", 10);
  const m = parseInt(parts[1] ?? "0", 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return { hour: 9, minute: 0 };
  return { hour: Math.min(23, Math.max(0, h)), minute: Math.min(59, Math.max(0, m)) };
}

function timeToMinutes(value: string): number {
  const { hour, minute } = parseTime(value);
  return hour * 60 + minute;
}

function formatTime(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`;
}

function polarToXY(angleRad: number, radius: number): { x: number; y: number } {
  return {
    x: CENTER + radius * Math.sin(angleRad),
    y: CENTER - radius * Math.cos(angleRad),
  };
}

function snapHourFromPointer12(clientX: number, clientY: number, rect: DOMRect): number {
  const cx = rect.left + CENTER;
  const cy = rect.top + CENTER;
  const dx = clientX - cx;
  const dy = clientY - cy;
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  let h = Math.round(deg / 30) % 12;
  if (h === 0) h = 12;
  return h;
}

function snapMinuteFromPointer(clientX: number, clientY: number, rect: DOMRect): number {
  const cx = rect.left + CENTER;
  const cy = rect.top + CENTER;
  const dx = clientX - cx;
  const dy = clientY - cy;
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return Math.round(deg / 6) % 60;
}

function snapHour24FromPointer(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): { hour: number; ring: "outer" | "inner" } {
  const cx = rect.left + CENTER;
  const cy = rect.top + CENTER;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  const ring = dist > (OUTER_HOUR_RADIUS + INNER_HOUR_RADIUS) / 2 ? "outer" : "inner";
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  const slot = Math.round(deg / 30) % 12;
  const outerHour = slot === 0 ? 0 : slot;
  const innerHour = slot === 0 ? 12 : slot + 12;
  return { hour: ring === "outer" ? outerHour : innerHour, ring };
}

function isHourDisabled(hour24: number, minTime?: string): boolean {
  if (!minTime) return false;
  return hour24 * 60 < timeToMinutes(minTime);
}

function isMinuteDisabled(hour24: number, minute: number, minTime?: string): boolean {
  if (!minTime) return false;
  return hour24 * 60 + minute < timeToMinutes(minTime);
}

/** B-0020 · GCal-style analog clock · B-0024 min time · N-0032 dual-ring 24h. */
export function ClockTimePicker({
  value,
  onChange,
  minTime,
  use24Hour = false,
  className,
  "data-testid": testId = "clock-time-picker",
}: ClockTimePickerProps) {
  const parsed = useMemo(() => parseTime(value), [value]);
  const [step, setStep] = useState<"hour" | "minute">("hour");
  const displayHour = parsed.hour % 12 || 12;
  const isPm = parsed.hour >= 12;

  const emit = useCallback(
    (hour: number, minute: number) => {
      onChange(formatTime(hour, minute));
    },
    [onChange],
  );

  const handleClockClick = (e: React.MouseEvent<SVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    if (step === "hour") {
      if (use24Hour) {
        const { hour } = snapHour24FromPointer(e.clientX, e.clientY, rect);
        if (isHourDisabled(hour, minTime)) return;
        emit(hour, parsed.minute);
        setStep("minute");
        return;
      }
      let h12 = snapHourFromPointer12(e.clientX, e.clientY, rect);
      let hour24 = h12 % 12;
      if (isPm) hour24 += 12;
      if (h12 === 12 && !isPm) hour24 = 0;
      if (h12 === 12 && isPm) hour24 = 12;
      if (isHourDisabled(hour24, minTime)) return;
      emit(hour24, parsed.minute);
      setStep("minute");
      return;
    }
    const minute = snapMinuteFromPointer(e.clientX, e.clientY, rect);
    if (isMinuteDisabled(parsed.hour, minute, minTime)) return;
    emit(parsed.hour, minute);
  };

  const hourMarkers12 = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const label = i === 0 ? 12 : i;
      const angle = (i * 30 * Math.PI) / 180;
      const { x, y } = polarToXY(angle, OUTER_HOUR_RADIUS);
      let hour24 = label % 12;
      if (isPm && label !== 12) hour24 += 12;
      if (label === 12 && isPm) hour24 = 12;
      if (label === 12 && !isPm) hour24 = 0;
      return { label, x, y, disabled: isHourDisabled(hour24, minTime) };
    });
  }, [isPm, minTime]);

  const hourMarkers24Outer = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = i;
      const angle = (i * 30 * Math.PI) / 180;
      const { x, y } = polarToXY(angle, OUTER_HOUR_RADIUS);
      return {
        label: pad2(hour),
        x,
        y,
        disabled: isHourDisabled(hour, minTime),
      };
    });
  }, [minTime]);

  const hourMarkers24Inner = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = i === 0 ? 12 : i + 12;
      const slot = i;
      const angle = (slot * 30 * Math.PI) / 180;
      const { x, y } = polarToXY(angle, INNER_HOUR_RADIUS);
      return {
        label: pad2(hour),
        x,
        y,
        disabled: isHourDisabled(hour, minTime),
      };
    });
  }, [minTime]);

  const minuteMarkers = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const minute = i * 5;
      const angle = (minute * 6 * Math.PI) / 180;
      const { x, y } = polarToXY(angle, MINUTE_RADIUS);
      return {
        minute,
        x,
        y,
        disabled: isMinuteDisabled(parsed.hour, minute, minTime),
      };
    });
  }, [parsed.hour, minTime]);

  const handAngle =
    step === "hour"
      ? use24Hour
        ? (parsed.hour * 30 * Math.PI) / 180
        : ((displayHour % 12) * 30 * Math.PI) / 180
      : (parsed.minute * 6 * Math.PI) / 180;

  const handLen = step === "hour" ? (use24Hour ? 44 : 56) : 72;
  const handEnd = polarToXY(handAngle, handLen);

  const displayLabel = use24Hour
    ? `${pad2(parsed.hour)}:${pad2(parsed.minute)}`
    : `${pad2(displayHour)}:${pad2(parsed.minute)} ${isPm ? "PM" : "AM"}`;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)} data-testid={testId}>
      <div className="text-center">
        <button
          type="button"
          className={cn(
            "rounded px-2 py-0.5 text-2xl font-semibold tabular-nums",
            step === "hour" ? "text-accent-magenta" : "text-text-primary",
          )}
          onClick={() => setStep("hour")}
        >
          {use24Hour ? pad2(parsed.hour) : pad2(displayHour)}
        </button>
        <span className="text-2xl font-semibold text-text-primary">:</span>
        <button
          type="button"
          className={cn(
            "rounded px-2 py-0.5 text-2xl font-semibold tabular-nums",
            step === "minute" ? "text-accent-magenta" : "text-text-primary",
          )}
          onClick={() => setStep("minute")}
        >
          {pad2(parsed.minute)}
        </button>
        {!use24Hour && (
          <div className="mt-1 flex justify-center gap-1 text-xs">
            <button
              type="button"
              className={cn(
                "rounded px-2 py-0.5",
                !isPm ? "bg-accent-magenta/20 text-accent-magenta" : "text-text-secondary",
              )}
              onClick={() => emit(parsed.hour >= 12 ? parsed.hour - 12 : parsed.hour, parsed.minute)}
            >
              AM
            </button>
            <button
              type="button"
              className={cn(
                "rounded px-2 py-0.5",
                isPm ? "bg-accent-magenta/20 text-accent-magenta" : "text-text-secondary",
              )}
              onClick={() => emit(parsed.hour < 12 ? parsed.hour + 12 : parsed.hour, parsed.minute)}
            >
              PM
            </button>
          </div>
        )}
        {use24Hour && (
          <p className="mt-1 text-xs text-text-muted tabular-nums">{displayLabel}</p>
        )}
      </div>

      <svg
        width={CLOCK_SIZE}
        height={CLOCK_SIZE}
        className="cursor-pointer touch-none select-none"
        onClick={handleClockClick}
        data-testid={`${testId}-face`}
        role="img"
        aria-label={step === "hour" ? "Select hour" : "Select minute"}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={CLOCK_SIZE / 2 - 4}
          className="fill-bg-secondary stroke-border-default"
          strokeWidth={1}
        />
        {use24Hour && step === "hour" && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={INNER_HOUR_RADIUS + 14}
            className="fill-none stroke-border-default/50"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )}
        {step === "hour" &&
          (use24Hour
            ? [...hourMarkers24Outer, ...hourMarkers24Inner].map((m) => (
                <text
                  key={`h24-${m.label}`}
                  x={m.x}
                  y={m.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    "text-[10px] font-medium",
                    m.disabled ? "fill-text-muted/40" : "fill-text-secondary",
                  )}
                >
                  {m.label}
                </text>
              ))
            : hourMarkers12.map((m) => (
                <text
                  key={`h12-${m.label}`}
                  x={m.x}
                  y={m.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    "text-[11px] font-medium",
                    m.disabled ? "fill-text-muted/40" : "fill-text-secondary",
                  )}
                >
                  {m.label}
                </text>
              )))}
        {step === "minute" &&
          minuteMarkers.map((m) => (
            <text
              key={`m-${m.minute}`}
              x={m.x}
              y={m.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn(
                "text-[11px] font-medium",
                m.disabled ? "fill-text-muted/40" : "fill-text-secondary",
              )}
            >
              {m.minute}
            </text>
          ))}
        <line
          x1={CENTER}
          y1={CENTER}
          x2={handEnd.x}
          y2={handEnd.y}
          className="stroke-accent-magenta"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={CENTER} cy={CENTER} r={4} className="fill-accent-magenta" />
      </svg>
      <p className="text-xs text-text-muted">
        {step === "hour"
          ? use24Hour
            ? "Outer ring 00–11 · inner ring 12–23"
            : "Tap an hour on the clock"
          : "Tap minutes on the clock"}
      </p>
    </div>
  );
}

/** B-0024 · Bump end time if start moves past it (+30 min default). */
export function bumpEndTimeAfterStart(startTime: string, endTime: string, deltaMin = 15): string {
  if (!startTime || !endTime) return endTime;
  if (timeToMinutes(endTime) > timeToMinutes(startTime)) return endTime;
  const startM = timeToMinutes(startTime);
  const h = Math.floor((startM + deltaMin) / 60) % 24;
  const m = (startM + deltaMin) % 60;
  return formatTime(h, m);
}

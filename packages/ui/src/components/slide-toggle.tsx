"use client";

import { cn } from "../lib/utils";

export interface SlideToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
  "aria-label"?: string;
}

/** B-0023 · Unified slide-toggle pill (settings + task properties). */
export function SlideToggle({
  checked,
  onChange,
  disabled = false,
  className,
  "data-testid": testId,
  "aria-label": ariaLabel,
}: SlideToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-testid={testId}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-accent-magenta" : "bg-bg-tertiary",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

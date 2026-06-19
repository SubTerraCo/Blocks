"use client";

import { DEFAULT_ACCENT_PRIMARY, DEFAULT_ACCENT_SECONDARY } from "../lib/accent-colors";
import { cn } from "../lib/utils";

export interface AccentColorFieldsProps {
  accentPrimary: string;
  accentSecondary: string;
  onAccentPrimaryChange: (value: string) => void;
  onAccentSecondaryChange: (value: string) => void;
  className?: string;
}

function ColorRow({
  label,
  description,
  value,
  onChange,
  testId,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  testId: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3" data-testid={testId}>
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded border border-border-default bg-transparent"
        aria-label={label}
      />
    </div>
  );
}

/** N-0040 · Primary + secondary accent color pickers. */
export function AccentColorFields({
  accentPrimary,
  accentSecondary,
  onAccentPrimaryChange,
  onAccentSecondaryChange,
  className,
}: AccentColorFieldsProps) {
  return (
    <div className={cn("space-y-4", className)} data-testid="accent-color-fields">
      <ColorRow
        label="Primary accent"
        description="Today highlights, active states, main accent"
        value={accentPrimary || DEFAULT_ACCENT_PRIMARY}
        onChange={onAccentPrimaryChange}
        testId="accent-primary-picker"
      />
      <ColorRow
        label="Secondary accent"
        description="Selected calendar day header and secondary chrome"
        value={accentSecondary || DEFAULT_ACCENT_SECONDARY}
        onChange={onAccentSecondaryChange}
        testId="accent-secondary-picker"
      />
    </div>
  );
}

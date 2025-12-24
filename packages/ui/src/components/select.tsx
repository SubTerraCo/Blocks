// ============================================================================
// BLOCKS - Select Component
// ============================================================================

import * as React from "react";
import { cn } from "../lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      onChange,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? React.useId();
    const hasError = !!error;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              "flex h-10 w-full appearance-none rounded-lg border bg-bg-secondary px-3 py-2 pr-10 text-sm text-text-primary",
              "transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary",
              hasError
                ? "border-status-error focus:ring-status-error"
                : "border-border-default hover:border-border-hover focus:border-accent-magenta focus:ring-accent-magenta",
              "disabled:cursor-not-allowed disabled:opacity-50",
              !value && "text-text-muted",
              className
            )}
            ref={ref}
            value={value}
            onChange={handleChange}
            aria-invalid={hasError}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        </div>
        {hasError && (
          <p className="mt-1.5 text-xs text-status-error">{error}</p>
        )}
        {helperText && !hasError && (
          <p className="mt-1.5 text-xs text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";


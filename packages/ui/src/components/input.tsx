// ============================================================================
// BLOCKS - Input Component
// ============================================================================

import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? React.useId();
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-bg-secondary px-3 py-2 text-sm text-text-primary",
              "placeholder:text-text-muted",
              "transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary",
              hasError
                ? "border-status-error focus:ring-status-error"
                : "border-border-default hover:border-border-hover focus:border-accent-magenta focus:ring-accent-magenta",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        {hasError && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-status-error">
            {error}
          </p>
        )}
        {helperText && !hasError && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Textarea variant
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id ?? React.useId();
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[100px] w-full rounded-lg border bg-bg-secondary px-3 py-2 text-sm text-text-primary",
            "placeholder:text-text-muted",
            "transition-colors resize-none",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary",
            hasError
              ? "border-status-error focus:ring-status-error"
              : "border-border-default hover:border-border-hover focus:border-accent-magenta focus:ring-accent-magenta",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          aria-invalid={hasError}
          {...props}
        />
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

Textarea.displayName = "Textarea";


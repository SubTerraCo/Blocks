// ============================================================================
// BLOCKS - Custom Navigation Icons
// Based on Figma design mockups
// ============================================================================

import { cn } from "../../lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Search Icon - Magnifying glass (kept for backward compatibility)
 */
export function SearchIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="11"
        cy="11"
        r="6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 15.5L20 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * AI Search Icon - Combined magnifying glass with AI sparkle
 * Used in nav bar for the AI + Search functionality
 */
export function AISearchIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Magnifying glass */}
      <circle
        cx="10"
        cy="10"
        r="5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 14L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* AI Sparkle/Star - top right */}
      <path
        d="M18 3L18.5 4.5L20 5L18.5 5.5L18 7L17.5 5.5L16 5L17.5 4.5L18 3Z"
        fill="currentColor"
      />
      {/* Small sparkle accent */}
      <path
        d="M21 8L21.25 8.75L22 9L21.25 9.25L21 10L20.75 9.25L20 9L20.75 8.75L21 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Kanban Icon - 3 vertical bars (rounded)
 * Matches Figma design: |||
 */
export function KanbanIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left bar */}
      <rect
        x="4"
        y="4"
        width="4"
        height="16"
        rx="2"
        fill="currentColor"
      />
      {/* Center bar */}
      <rect
        x="10"
        y="4"
        width="4"
        height="16"
        rx="2"
        fill="currentColor"
      />
      {/* Right bar */}
      <rect
        x="16"
        y="4"
        width="4"
        height="16"
        rx="2"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Timeline Icon - 3 horizontal stacked lines (rounded)
 * Matches Figma design: ≡ (horizontal bars)
 */
export function TimelineIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top bar */}
      <rect
        x="4"
        y="5"
        width="16"
        height="3"
        rx="1.5"
        fill="currentColor"
      />
      {/* Middle bar */}
      <rect
        x="4"
        y="10.5"
        width="16"
        height="3"
        rx="1.5"
        fill="currentColor"
      />
      {/* Bottom bar */}
      <rect
        x="4"
        y="16"
        width="16"
        height="3"
        rx="1.5"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Blocks Icon - 2x2 rounded squares grid
 * Matches Figma design: ⊞ (four squares)
 */
export function BlocksIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top-left square */}
      <rect
        x="4"
        y="4"
        width="7"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Top-right square */}
      <rect
        x="13"
        y="4"
        width="7"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Bottom-left square */}
      <rect
        x="4"
        y="13"
        width="7"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Bottom-right square */}
      <rect
        x="13"
        y="13"
        width="7"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * Add Icon - Plus sign (used inside the rounded square button)
 */
export function AddIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 5V19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Add Button Container - Rounded square with plus icon
 * This is the styled wrapper for the Add action button
 */
export function AddButtonIcon({ className, size = 48 }: IconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-accent-magenta",
        className
      )}
      style={{ width: size, height: size }}
    >
      <AddIcon size={size * 0.5} className="text-white" />
    </div>
  );
}

// Export all icons
export const NavIcons = {
  Search: SearchIcon,
  AISearch: AISearchIcon,
  Kanban: KanbanIcon,
  Timeline: TimelineIcon,
  Blocks: BlocksIcon,
  Add: AddIcon,
  AddButton: AddButtonIcon,
};


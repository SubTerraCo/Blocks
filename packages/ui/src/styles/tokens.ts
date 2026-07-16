// ============================================================================
// BLOCKS - Design Tokens (from Figma Mockups)
// ============================================================================

/**
 * Color palette extracted from Figma designs
 */
export const colors = {
  // Background colors
  background: {
    primary: "#0a0a14",      // Main dark navy background
    secondary: "#12121f",    // Slightly lighter for cards
    tertiary: "#1a1a2e",     // Even lighter for hover states
    elevated: "#1e1e32",     // Modal/overlay background
  },
  
  // Accent colors
  accent: {
    magenta: "#ff3366",      // Primary accent (Backlog headers, active states)
    magentaLight: "#ff5c85", // Hover state
    magentaDark: "#cc2952",  // Pressed state
    teal: "#00d9ff",         // Secondary accent (some task blocks)
    tealLight: "#26c6da",
    tealDark: "#00acc1",
  },
  
  // Task block colors (Quick Add grid)
  blocks: {
    green: "#22c55e",        // Productive tasks
    greenLight: "#4ade80",
    greenDark: "#16a34a",
    darkGreen: "#166534",    // Putzing (less prominent)
    red: "#ef4444",          // Negative/overtime
    redDark: "#7f1d1d",
  },
  
  // Text colors
  text: {
    primary: "#ffffff",
    secondary: "#a0a0b0",
    tertiary: "#6b6b7b",
    muted: "#4a4a5a",
    inverse: "#0a0a14",
  },
  
  // Border colors
  border: {
    default: "#2a2a3e",
    hover: "#3a3a4e",
    focus: "#ff3366",
  },
  
  // Status colors
  status: {
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  
  // Priority colors
  priority: {
    "1": "#ef4444", // Urgent - Red
    "2": "#f59e0b", // High - Orange
    "3": "#eab308", // Medium - Yellow
    "4": "#22c55e", // Low - Green
    "5": "#6b7280", // Minimal - Gray
  },
} as const;

/**
 * Typography scale
 */
export const typography = {
  fontFamily: {
    sans: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", "Fira Code", "Consolas", monospace',
  },
  fontSize: {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.625",
  },
} as const;

/**
 * Spacing scale
 */
export const spacing = {
  0: "0",
  1: "0.25rem",   // 4px
  2: "0.5rem",    // 8px
  3: "0.75rem",   // 12px
  4: "1rem",      // 16px
  5: "1.25rem",   // 20px
  6: "1.5rem",    // 24px
  8: "2rem",      // 32px
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px
  16: "4rem",     // 64px
  20: "5rem",     // 80px
} as const;

/**
 * Border radius
 */
export const borderRadius = {
  none: "0",
  sm: "0.25rem",   // 4px
  default: "0.5rem", // 8px
  md: "0.75rem",   // 12px
  lg: "1rem",      // 16px
  xl: "1.5rem",    // 24px
  full: "9999px",
} as const;

/**
 * Shadows
 */
export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
  default: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
  glow: "0 0 20px rgba(155, 77, 202, 0.3)", // Magenta glow
} as const;

/**
 * Transitions
 */
export const transitions = {
  fast: "150ms ease-in-out",
  default: "200ms ease-in-out",
  slow: "300ms ease-in-out",
} as const;

/**
 * Z-index scale
 */
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const;

/**
 * Breakpoints
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Bottom navigation height (for layout calculations)
 */
export const layout = {
  bottomNavHeight: "64px",
  topBarHeight: "56px",
  sidebarWidth: "280px",
} as const;


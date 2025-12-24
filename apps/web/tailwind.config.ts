import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background
        "bg-primary": "#0a0a14",
        "bg-secondary": "#12121f",
        "bg-tertiary": "#1a1a2e",
        "bg-elevated": "#1e1e32",

        // Accent
        "accent-magenta": "#9b4dca",
        "accent-magenta-light": "#b366d9",
        "accent-magenta-dark": "#7a3da1",
        "accent-teal": "#00bcd4",
        "accent-teal-light": "#26c6da",
        "accent-teal-dark": "#00acc1",

        // Blocks
        "block-green": "#22c55e",
        "block-green-light": "#4ade80",
        "block-green-dark": "#16a34a",
        "block-dark-green": "#166534",

        // Text
        "text-primary": "#ffffff",
        "text-secondary": "#a0a0b0",
        "text-tertiary": "#6b6b7b",
        "text-muted": "#4a4a5a",

        // Border
        "border-default": "#2a2a3e",
        "border-hover": "#3a3a4e",
        "border-focus": "#9b4dca",

        // Status
        "status-success": "#22c55e",
        "status-warning": "#f59e0b",
        "status-error": "#ef4444",
        "status-info": "#3b82f6",
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"Inter"', "system-ui", "sans-serif"],
        mono: ['"SF Mono"', '"Fira Code"', "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(155, 77, 202, 0.3)",
      },
      dropShadow: {
        glow: "0 0 8px rgba(155, 77, 202, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;


import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        "bg-primary": "#0D0D0D",
        "bg-secondary": "#1A1A1A",
        "bg-tertiary": "#262626",
        "bg-elevated": "#2D2D2D",
        
        // Text colors
        "text-primary": "#FFFFFF",
        "text-secondary": "#A3A3A3",
        "text-tertiary": "#737373",
        "text-muted": "#525252",
        
        // Accent colors
        "accent-magenta": "#FF3366",
        "accent-cyan": "#00D9FF",
        "accent-green": "#00FF88",
        "accent-orange": "#FF9500",
        "accent-purple": "#9D4EDD",
        
        // Border colors
        "border-default": "#333333",
        "border-focus": "#FF3366",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 51, 102, 0.3)",
        "glow-cyan": "0 0 20px rgba(0, 217, 255, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;


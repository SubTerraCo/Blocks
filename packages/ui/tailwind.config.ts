import type { Config } from "tailwindcss";
import { semanticColors } from "../../packages/ui/tailwind.semantic.js";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ...semanticColors,
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

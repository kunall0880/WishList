import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        brand: {
          primary: "#6C63FF",
          secondary: "#06D6A0",
          accent: "#FF6B6B",
          gold: "#FFD166",
        },
        surface: {
          900: "rgb(var(--color-surface-900) / <alpha-value>)",
          800: "rgb(var(--color-surface-800) / <alpha-value>)",
          700: "rgb(var(--color-surface-700) / <alpha-value>)",
          600: "rgb(var(--color-surface-600) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        },
      },
      fontSize: {
        hero: ["64px", { lineHeight: "1.1", letterSpacing: "-2px", fontWeight: "800" }],
        section: ["40px", { lineHeight: "1.2", letterSpacing: "-1px", fontWeight: "700" }],
        "card-heading": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.7", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.5", letterSpacing: "0.5px", fontWeight: "500" }],
      },
      spacing: {
        18: "72px",
        22: "88px",
        26: "104px",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.24)",
        "glass-light": "0 8px 32px rgba(0, 0, 0, 0.08)",
        glow: "0 0 40px rgba(108, 99, 255, 0.15)",
        "glow-lg": "0 0 60px rgba(108, 99, 255, 0.25)",
        lift: "0 20px 60px rgba(108, 99, 255, 0.2)",
      },
      animation: {
        "float-1": "float-1 8s ease-in-out infinite",
        "float-2": "float-2 10s ease-in-out infinite",
        "float-3": "float-3 12s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        drift: "drift 6s ease-in-out infinite",
        "scroll-x": "scroll-x 40s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "gradient-violet": "linear-gradient(135deg, #6C63FF, #8B7FFF)",
        "gradient-violet-indigo": "linear-gradient(135deg, #6C63FF 0%, #4338CA 100%)",
        "gradient-mint": "linear-gradient(135deg, #06D6A0, #34D399)",
        "gradient-coral": "linear-gradient(135deg, #FF6B6B, #FF8787)",
        "gradient-gold": "linear-gradient(135deg, #FFD166, #FBBF24)",
        "gradient-hero": "linear-gradient(135deg, #6C63FF 0%, #06D6A0 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          plum: "#6B21A8",
          "plum-dark": "#581C87",
        },
        muted: "#f5f5f5",
        primary: "#6B21A8",
        "primary-foreground": "#ffffff",
        accent: "#f0f0f0",
        "accent-foreground": "#333333",
        // New brand palette
        "brand-night": "#1A2C60", // deep bedtime blue
        "brand-night-2": "#2A3B78", // mid blue for gradient
        "brand-sun": "#F7C94A", // warm golden yellow
        "brand-dream": "#A98FF0", // soft purple accent
        "brand-warm": "#FFD8A8", // peach highlight
        "brand-cloud": "#F9FAFB", // gentle cloud white
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        // soft ambient shadow to match original mock
        soft: "0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)",
        dream: "0 10px 30px rgba(169, 143, 240, 0.35)",
        sun: "0 12px 28px rgba(247, 201, 74, 0.35)",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%, 100%": { filter: "drop-shadow(0 0 0px rgba(247,201,74,0.0))" },
          "50%": { filter: "drop-shadow(0 0 10px rgba(247,201,74,0.55))" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeScale: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        twinkle: "twinkle 2.2s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        glow: "glow 3.5s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out both",
        fadeScale: "fadeScale 0.6s ease-out both",
      },
    },
  },
  safelist: [
    "bg-brand-plum",
    "hover:bg-brand-plum-dark",
    "text-brand-plum",
    "border-brand-plum",
    "bg-muted",
    "bg-primary",
    "text-primary-foreground",
    "hover:bg-accent",
    "hover:text-accent-foreground",
  ],
  plugins: [],
};

export default config;

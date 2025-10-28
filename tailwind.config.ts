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
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        // soft ambient shadow to match original mock
        soft: "0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)",
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
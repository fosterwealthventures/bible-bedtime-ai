import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          plum: "#8b5cf6",
          plumDark: "#7c3aed",
          lavender: "#f4eaff",
          ink: "#1f1d2b",
          mist: "#faf8ff",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 6px 24px rgba(0,0,0,.06)",
      },
      container: {
        center: true,
        padding: "1rem",
        screens: { lg: "1080px", xl: "1200px", "2xl": "1280px" },
      },
    },
  },
  safelist: [
    // Buttons / badges you referenced
    "bg-purple-600","hover:bg-purple-700","text-white",
    "bg-purple-500","bg-purple-100","text-purple-700",
    // Gradients used in cards/hero
    "from-purple-600","to-purple-400","bg-gradient-to-r",
    "from-indigo-500","to-indigo-300",
    // Layout utilities sometimes built dynamically
    "grid","sm:grid-cols-2","lg:grid-cols-3","gap-6","gap-8",
    "rounded-xl","rounded-2xl","shadow","shadow-sm","shadow-md",
    // Borders
    "border","border-purple-200","border-gray-200",
  ],
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/container-queries"),
  ],
};

export default config;
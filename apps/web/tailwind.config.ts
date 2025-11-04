import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        primary: {
          DEFAULT: "#0A1828",
          50: "#1a2f47",
          100: "#152638",
          200: "#0A1828",
          300: "#070f1a",
          400: "#05090f",
        },
        secondary: {
          DEFAULT: "#178582",
          50: "#5fcfcc",
          100: "#3db9b6",
          200: "#1fa09d",
          300: "#178582",
          400: "#126b68",
          500: "#0e5452",
        },
        accent: {
          DEFAULT: "#BFA181",
          50: "#f5ede3",
          100: "#e8d8c5",
          200: "#d9c2a5",
          300: "#BFA181",
          400: "#a88764",
          500: "#8f6f4f",
        },
        background: "#0A1828",
        foreground: "#BFA181",
        card: {
          DEFAULT: "#132032",
          foreground: "#BFA181",
        },
        popover: {
          DEFAULT: "#132032",
          foreground: "#BFA181",
        },
        muted: {
          DEFAULT: "#1a2f47",
          foreground: "#8f9bb3",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fef2f2",
        },
        border: "#1a2f47",
        input: "#1a2f47",
        ring: "#178582",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

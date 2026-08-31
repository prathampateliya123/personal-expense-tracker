/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // SpendWise-inspired palette
        background: "#F0FDF4",
        surface: "#FFFFFF",
        border: "#D1FAE5",
        primary: "#064E3B",
        primaryDeep: "#022C22",
        primaryGlow: "#059669",
        secondary: "#10B981",
        secondaryLight: "#34D399",
        accent: "#059669",
        income: "#059669",
        expense: "#022C22",
        warning: "#F59E0B",
        textPrimary: "#022C22",
        textSecondary: "#64748B",
        textMuted: "#94A3B8",
        navBar: "#022C22",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        heading: "-0.025em",
      },
      borderRadius: {
        card: "1.25rem",
        pill: "9999px",
      },
      boxShadow: {
        glow: "0 4px 24px rgba(5, 150, 105, 0.28)",
        card: "0 1px 2px rgba(2, 44, 34, 0.04), 0 8px 24px rgba(2, 44, 34, 0.06)",
        cardDark: "0 12px 32px rgba(2, 44, 34, 0.35)",
      },
    },
  },
  plugins: [],
};

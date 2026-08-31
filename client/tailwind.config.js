/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFB",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        primary: "#064E3B",
        primaryGlow: "#065F46",
        secondary: "#10B981",
        secondaryLight: "#34D399",
        income: "#10B981",
        expense: "#062D24",
        warning: "#F59E0B",
        textPrimary: "#062D24",
        textSecondary: "#6B7280",
        textMuted: "#9CA3AF",
        navBar: "#111827",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        heading: "-0.025em",
      },
      boxShadow: {
        glow: "0 4px 20px rgba(16, 185, 129, 0.25)",
        card: "0 1px 3px rgba(6, 78, 59, 0.06), 0 4px 16px rgba(6, 78, 59, 0.04)",
        cardDark: "0 8px 24px rgba(6, 78, 59, 0.25)",
      },
    },
  },
  plugins: [],
};

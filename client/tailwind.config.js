/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F1117",
        surface: "#1A1D29",
        border: "#2A2E3D",
        primary: "#6C5CE7",
        primaryGlow: "#8B7FFF",
        secondary: "#00D4FF",
        income: "#00E396",
        expense: "#FF5C7C",
        warning: "#FFB800",
        textPrimary: "#FFFFFF",
        textSecondary: "#9CA3AF",
        textMuted: "#6B7280",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        heading: "-0.025em",
      },
      boxShadow: {
        glow: "0 0 20px rgba(139, 127, 255, 0.35)",
        card: "0 4px 24px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

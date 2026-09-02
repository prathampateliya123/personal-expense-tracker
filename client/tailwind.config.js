/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    borderRadius: {
      none: "0",
      sm: "8px",
      DEFAULT: "8px",
      md: "8px",
      lg: "8px",
      xl: "8px",
      "2xl": "8px",
      "3xl": "8px",
      full: "8px",
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
      },
      colors: {
        appBg: "#FFFFFF",
        surfaceLight: "#F8F9FA",
        surfaceGray: "#F1F3F5",
        primaryDark: "#0D3B2E",
        primaryMid: "#1F5C42",
        primaryLight: "#3D8B5F",
        accentGreen: "#22A96C",
        successBg: "#DCFCE7",
        successText: "#22C55E",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(17, 24, 39, 0.06)",
        card: "0 2px 12px rgba(17, 24, 39, 0.05)",
        pill: "0 8px 32px rgba(13, 59, 46, 0.18)",
      },
      backgroundImage: {
        "gradient-green-card":
          "linear-gradient(135deg, #0D3B2E 0%, #1F5C42 50%, #3D8B5F 100%)",
      },
    },
  },
  plugins: [],
};

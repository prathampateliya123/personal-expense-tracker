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
        surfaceLight: "#DAF1DE",
        surfaceGray: "#E8F5EB",
        primaryDark: "#051F20",
        primaryMid: "#0B2B26",
        primaryLight: "#163832",
        accentGreen: "#235347",
        accentSage: "#8EB69B",
        successBg: "#DAF1DE",
        successText: "#235347",
        textPrimary: "#051F20",
        textSecondary: "#4A6B5E",
        border: "#BFD9C8",
      },
      boxShadow: {
        soft: "none",
        card: "none",
        pill: "none",
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
        inner: "none",
        none: "none",
      },
      backgroundImage: {
        "gradient-green-card":
          "linear-gradient(135deg, #051F20 0%, #0B2B26 40%, #235347 100%)",
        "gradient-brand-card":
          "linear-gradient(135deg, #051F20 0%, #0B2B26 40%, #235347 100%)",
      },
    },
  },
  plugins: [],
};

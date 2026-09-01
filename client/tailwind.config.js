/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22",
        },
        ink: {
          50: "#F4F7F6",
          100: "#E3EAE8",
          200: "#C5D4D0",
          300: "#9BB3AD",
          400: "#6B8A82",
          500: "#4D6B63",
          600: "#3D554F",
          700: "#334641",
          800: "#1E2E2A",
          900: "#14201D",
          950: "#0B1412",
        },
        surface: {
          DEFAULT: "#F6F9F8",
          card: "#FFFFFF",
          muted: "#EEF4F2",
          border: "#E2EAE7",
        },
        accent: {
          income: "#10B981",
          expense: "#F43F5E",
          warning: "#F59E0B",
          info: "#0EA5E9",
        },
      },
      boxShadow: {
        auth: "0 25px 50px -12px rgba(2, 44, 34, 0.12)",
        card: "0 1px 3px rgba(11, 20, 18, 0.06), 0 8px 24px rgba(11, 20, 18, 0.04)",
        sidebar: "4px 0 24px rgba(11, 20, 18, 0.08)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #022C22 0%, #064E3B 50%, #047857 100%)",
        "brand-glow":
          "radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.35), transparent 50%)",
      },
    },
  },
  plugins: [],
};

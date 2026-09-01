/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#022C22",
        },
      },
      boxShadow: {
        auth: "0 25px 50px -12px rgba(2, 44, 34, 0.15)",
      },
    },
  },
  plugins: [],
};

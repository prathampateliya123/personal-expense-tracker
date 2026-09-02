/**
 * app/toastConfig.js
 * Global react-hot-toast options — light fintech theme.
 */

export const toastOptions = {
  position: "top-right",
  toastOptions: {
    duration: 3000,
    style: {
      background: "#FFFFFF",
      color: "#111827",
      fontSize: "14px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      boxShadow: "0 4px 24px rgba(17, 24, 39, 0.08)",
    },
    success: {
      iconTheme: { primary: "#22A96C", secondary: "#DCFCE7" },
    },
    error: {
      iconTheme: { primary: "#EF4444", secondary: "#FEE2E2" },
    },
  },
};

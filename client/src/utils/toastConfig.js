/**
 * utils/toastConfig.js
 * Global react-hot-toast options — forest mint theme.
 */

export const toastOptions = {
  position: "top-right",
  toastOptions: {
    duration: 3000,
    style: {
      background: "#FFFFFF",
      color: "#051F20",
      fontSize: "14px",
      border: "1px solid #BFD9C8",
      borderRadius: "8px",
      boxShadow: "none",
    },
    success: {
      iconTheme: { primary: "#235347", secondary: "#DAF1DE" },
    },
    error: {
      iconTheme: { primary: "#EF4444", secondary: "#FEE2E2" },
    },
  },
};

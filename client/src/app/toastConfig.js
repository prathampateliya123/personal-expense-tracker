/**
 * app/toastConfig.js
 * Global react-hot-toast options.
 */

export const toastOptions = {
  position: "top-right",
  toastOptions: {
    duration: 3000,
    style: {
      background: "#14201D",
      color: "#F6F9F8",
      fontSize: "14px",
    },
    success: {
      iconTheme: { primary: "#10B981", secondary: "#14201D" },
    },
    error: {
      iconTheme: { primary: "#F43F5E", secondary: "#14201D" },
    },
  },
};

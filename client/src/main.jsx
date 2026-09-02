/**
 * main.jsx
 * React application entry point.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./lib/queryClient";
import { setupAxiosInterceptors } from "./utils/setupAxiosInterceptors";
import { toastOptions } from "./utils/toastConfig";
import App from "./App.jsx";
import "./index.css";

setupAxiosInterceptors();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster {...toastOptions} />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

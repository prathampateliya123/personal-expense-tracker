/**
 * main.jsx
 * React application entry point.
 * Renders the app inside Redux Provider and StrictMode.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import { setupAxiosInterceptors } from "./utils/setupAxiosInterceptors";
import App from "./app/App.jsx";
import "./index.css";

setupAxiosInterceptors(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);

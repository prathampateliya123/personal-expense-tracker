/**
 * app/App.jsx
 * Root component — providers and routing shell.
 */

import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { checkAuthSession } from "../redux/slices/authSlice";
import { toastOptions } from "./toastConfig";
import AppRoutes from "./routes";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster {...toastOptions} />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;

/**
 * App.jsx
 * Root component — React Router with auth and protected routes.
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { checkAuthSession } from "./redux/authSlice";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicAuthRoute from "./components/PublicAuthRoute";
import HomeRedirect from "./components/HomeRedirect";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
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
        }}
      />

      <Routes>
        <Route element={<PublicAuthRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

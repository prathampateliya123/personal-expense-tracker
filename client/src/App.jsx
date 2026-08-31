/**
 * App.jsx
 * Root component — sets up React Router with public and protected routes.
 * Public: /login, /register
 * Protected: /dashboard (wrapped in DashboardLayout via ProtectedRoute)
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { fetchProfile } from "./redux/authSlice";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import BudgetPlanner from "./pages/BudgetPlanner";
import Goals from "./pages/Goals";
import Wallets from "./pages/Wallets";
import Subscriptions from "./pages/Subscriptions";
import WhatIfSimulator from "./pages/WhatIfSimulator";
import Investments from "./pages/Investments";
import Reports from "./pages/Reports";
import Timeline from "./pages/Timeline";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Attempt to restore session from httpOnly cookie on app load
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/income" element={<Income />} />
            <Route path="/budget" element={<BudgetPlanner />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/simulator" element={<WhatIfSimulator />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/timeline" element={<Timeline />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

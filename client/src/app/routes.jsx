/**
 * app/routes.jsx
 * Application route definitions.
 */

import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/routing/ProtectedRoute";
import PublicAuthRoute from "../components/routing/PublicAuthRoute";
import HomeRedirect from "../components/routing/HomeRedirect";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/Dashboard";
import Expenses from "../pages/Expenses";
import AddExpense from "../pages/expenses/AddExpense";
import EditExpense from "../pages/expenses/EditExpense";

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicAuthRoute />}>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expenses/add" element={<AddExpense />} />
        <Route path="/expenses/:id/edit" element={<EditExpense />} />
      </Route>
    </Route>

    <Route path="/" element={<HomeRedirect />} />
    <Route path="*" element={<HomeRedirect />} />
  </Routes>
);

export default AppRoutes;

/**
 * App.jsx
 * Root component — route guards and route definitions.
 */

import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  UserProfileProvider,
  useUserProfile,
} from "./context/UserProfileContext";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import EditExpense from "./pages/EditExpense";

const AuthLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-appBg">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentGreen border-t-transparent" />
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, initializing } = useUserProfile();
  const location = useLocation();

  if (initializing) return <AuthLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

const PublicAuthRoute = () => {
  const { isAuthenticated, initializing } = useUserProfile();

  if (initializing) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

const HomeRedirect = () => {
  const { isAuthenticated, initializing } = useUserProfile();

  if (initializing) return <AuthLoading />;
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const App = () => (
  <UserProfileProvider>
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
  </UserProfileProvider>
);

export default App;

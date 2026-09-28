import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import {
  UserProfileProvider,
  useUserProfile,
} from "../context/UserProfileContext";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import SettingsLayout from "../layouts/SettingsLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import Expenses from "../pages/expenses/Expenses";
import AddExpense from "../pages/expenses/AddExpense";
import EditExpense from "../pages/expenses/EditExpense";
import ExpenseTimeline from "../pages/expenses/ExpenseTimeline";
import Incomes from "../pages/incomes/Incomes";
import AddIncome from "../pages/incomes/AddIncome";
import EditIncome from "../pages/incomes/EditIncome";
import Categories from "../pages/categories/Categories";
import Budgets from "../pages/budgets/Budgets";
import Wealth from "../pages/wealth/Wealth";
import AddSaving from "../pages/wealth/AddSaving";
import EditSaving from "../pages/wealth/EditSaving";
import AddInvestment from "../pages/wealth/AddInvestment";
import EditInvestment from "../pages/wealth/EditInvestment";
import Subscriptions from "../pages/subscriptions/Subscriptions";
import AddSubscription from "../pages/subscriptions/AddSubscription";
import EditSubscription from "../pages/subscriptions/EditSubscription";
import BillEmiSimulator from "../pages/simulator/BillEmiSimulator";
import AddSimulation from "../pages/simulator/AddSimulation";
import EditSimulation from "../pages/simulator/EditSimulation";
import Trips from "../pages/trips/Trips";
import AddTrip from "../pages/trips/AddTrip";
import EditTrip from "../pages/trips/EditTrip";
import TripDetail from "../pages/trips/TripDetail";
import Reports from "../pages/reports/Reports";
import PaymentMethods from "../pages/settings/PaymentMethods";

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

const AppRoutes = () => (
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
          <Route path="/timeline" element={<ExpenseTimeline />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/add" element={<AddTrip />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/trips/:id/edit" element={<EditTrip />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/incomes" element={<Incomes />} />
          <Route path="/incomes/add" element={<AddIncome />} />
          <Route path="/incomes/:id/edit" element={<EditIncome />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/subscriptions/add" element={<AddSubscription />} />
          <Route
            path="/subscriptions/:id/edit"
            element={<EditSubscription />}
          />
          <Route path="/simulator" element={<BillEmiSimulator />} />
          <Route path="/simulator/add" element={<AddSimulation />} />
          <Route path="/simulator/:id/edit" element={<EditSimulation />} />
          <Route path="/wealth" element={<Wealth />} />
          <Route path="/wealth/savings/add" element={<AddSaving />} />
          <Route path="/wealth/savings/:id/edit" element={<EditSaving />} />
          <Route path="/wealth/investments/add" element={<AddInvestment />} />
          <Route
            path="/wealth/investments/:id/edit"
            element={<EditInvestment />}
          />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="payment-methods" replace />} />
            <Route path="payment-methods" element={<PaymentMethods />} />
          </Route>
          <Route
            path="/payment-methods"
            element={<Navigate to="/settings/payment-methods" replace />}
          />
        </Route>
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  </UserProfileProvider>
);

export default AppRoutes;

/**
 * components/ProtectedRoute.jsx
 * Blocks dashboard routes until JWT cookie is verified via /auth/profile.
 * No cookie / invalid token → always redirect to /login.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated, initializing } = useSelector((state) => state.auth);
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-appBg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentGreen border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

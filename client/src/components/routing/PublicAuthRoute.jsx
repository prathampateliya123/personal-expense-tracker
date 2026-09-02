/**
 * components/PublicAuthRoute.jsx
 * Keeps users on login/register until a valid JWT cookie exists.
 * Authenticated users are sent to dashboard.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicAuthRoute = () => {
  const { isAuthenticated, initializing } = useSelector((state) => state.auth);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-appBg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentGreen border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicAuthRoute;

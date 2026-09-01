/**
 * components/PublicAuthRoute.jsx
 * Redirects authenticated users away from auth pages.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicAuthRoute = () => {
  const { isAuthenticated, initializing } = useSelector((state) => state.auth);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicAuthRoute;

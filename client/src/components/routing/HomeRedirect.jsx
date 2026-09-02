/**
 * components/HomeRedirect.jsx
 * Sends users to dashboard or login based on auth state.
 */

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const HomeRedirect = () => {
  const { isAuthenticated, initializing } = useSelector((state) => state.auth);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
  );
};

export default HomeRedirect;

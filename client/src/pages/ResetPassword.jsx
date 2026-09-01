/**
 * pages/ResetPassword.jsx
 * Set a new password using the reset token from email.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  resetPassword,
  validateResetToken,
  clearError,
} from "../redux/authSlice";
import AuthCard, {
  authInputClass,
  authButtonClass,
  authLinkClass,
} from "../components/AuthCard";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, tokenValid, tokenChecking } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (token) {
      dispatch(validateResetToken(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(result)) {
      toast.success("Password updated! You are now signed in.");
      navigate("/dashboard");
    }
  };

  if (tokenChecking) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <AuthCard
        title="Invalid or expired link"
        subtitle="This password reset link is no longer valid. Please request a new one."
        footer={
          <p className="text-center text-sm text-ink-400">
            <Link to="/forgot-password" className={authLinkClass}>
              Request new link
            </Link>
          </p>
        }
      />
    );
  }

  return (
    <AuthCard
      title="Set new password"
      subtitle="Choose a strong password with at least 6 characters"
      footer={
        <p className="text-center text-sm text-ink-400">
          <Link to="/login" className={authLinkClass}>
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            New password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Confirm password
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={authInputClass}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;

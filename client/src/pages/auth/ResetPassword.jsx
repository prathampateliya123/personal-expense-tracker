/**
 * pages/ResetPassword.jsx
 * Set new password after forgot-password OTP is verified.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearError } from "../../redux/slices/authSlice";
import useReduxErrorToast from "../../hooks/useReduxErrorToast";
import { showErrorToast, showSuccessToast } from "../../hooks/useHandleError";
import AuthCard, {
  authInputClass,
  authButtonClass,
  authLinkClass,
} from "../../components/auth/AuthCard";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otpVerified = location.state?.otpVerified;
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!email || !otpVerified) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, otpVerified, navigate]);

  useReduxErrorToast(error, clearError);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }

    const result = await dispatch(resetPassword({ email, password }));
    if (resetPassword.fulfilled.match(result)) {
      showSuccessToast("Password updated! You are now signed in.");
      navigate("/dashboard", { replace: true });
    }
  };

  if (!email || !otpVerified) {
    return null;
  }

  return (
    <AuthCard
      title="Set new password"
      subtitle="Choose a strong password with at least 6 characters"
      footer={
        <p className="text-center text-sm text-textSecondary">
          <Link to="/login" className={authLinkClass}>
            Back to sign in
          </Link>
        </p>
      }
    >
      <p className="mb-5 text-center text-sm text-textSecondary">
        Resetting password for{" "}
        <span className="font-medium text-textPrimary">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-textPrimary">
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
          <label className="mb-1.5 block text-sm font-medium text-textPrimary">
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

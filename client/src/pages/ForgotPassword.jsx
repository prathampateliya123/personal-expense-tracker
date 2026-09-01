/**
 * pages/ForgotPassword.jsx
 * Request a password reset link.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { forgotPassword, clearError, clearAuthMessage } from "../redux/authSlice";
import AuthCard, {
  authInputClass,
  authButtonClass,
  authLinkClass,
} from "../components/AuthCard";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, message, devResetUrl } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthMessage());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      setSubmitted(true);
      toast.success("Check your email for reset instructions.");
    }
  };

  if (submitted) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle={
          message ||
          "If an account exists with that email, a password reset link has been sent."
        }
        footer={
          <p className="text-center text-sm text-ink-400">
            <Link to="/login" className={authLinkClass}>
              Back to sign in
            </Link>
          </p>
        }
      >
        {devResetUrl && (
          <div className="rounded-xl border border-accent-warning/30 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Development mode</p>
            <p className="mt-1 text-amber-800/90">
              SMTP is not configured. Use this link to reset your password:
            </p>
            <a
              href={devResetUrl}
              className="mt-2 inline-block break-all font-medium text-brand-700 underline"
            >
              {devResetUrl}
            </a>
          </div>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <p className="text-center text-sm text-ink-400">
          Remember your password?{" "}
          <Link to="/login" className={authLinkClass}>
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            placeholder="you@example.com"
          />
        </div>

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;

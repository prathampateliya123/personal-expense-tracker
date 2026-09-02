/**
 * pages/auth/Login.jsx
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import authService from "../../services/authService";
import { authKeys } from "../../services/queryKeys";
import { handleApiError, showSuccessToast } from "../../hooks/useHandleError";
import AuthCard, {
  authInputClass,
  authButtonClass,
  authLinkClass,
} from "../../components/auth/AuthCard";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const loginMutation = useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      const purpose = data.purpose || "login";
      showSuccessToast(
        purpose === "register"
          ? "Account not verified. Enter OTP to complete setup."
          : "OTP sent! Enter the code to continue."
      );
      navigate("/verify-otp", {
        state: {
          email: data.email,
          purpose,
          from,
          otp: data.otp || null,
        },
      });
    },
    onError: handleApiError,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your expense tracker account"
      footer={
        <p className="text-center text-sm text-textSecondary">
          Don&apos;t have an account?{" "}
          <Link to="/register" className={authLinkClass}>
            Create account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-textPrimary">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            className={authInputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-textPrimary">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-accentGreen hover:text-primaryMid"
            >
              Forgot password?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            className={authInputClass}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className={authButtonClass}
        >
          {loginMutation.isPending ? "Sending OTP..." : "Continue"}
        </button>
      </form>
    </AuthCard>
  );
};

export default Login;

/**
 * pages/auth/ForgotPassword.jsx
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import authService from "../../services/authService";
import { authKeys } from "../../services/queryKeys";
import { handleApiError, showSuccessToast } from "../../hooks/useHandleError";
import AuthCard, {
  authInputClass,
  authButtonClass,
  authLinkClass,
} from "../../components/auth/AuthCard";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const forgotMutation = useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: (payload) => authService.forgotPassword(payload),
    onSuccess: (data) => {
      showSuccessToast("OTP sent! Enter the code to continue.");
      navigate("/verify-otp", {
        state: {
          email: data.email,
          purpose: data.purpose || "forgot-password",
          otp: data.otp || null,
        },
      });
    },
    onError: handleApiError,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotMutation.mutate({ email });
  };

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you an OTP"
      footer={
        <p className="text-center text-sm text-textSecondary">
          Remember your password?{" "}
          <Link to="/login" className={authLinkClass}>
            Sign in
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={forgotMutation.isPending}
          className={authButtonClass}
        >
          {forgotMutation.isPending ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;

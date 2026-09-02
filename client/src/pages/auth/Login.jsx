/**
 * pages/Login.jsx
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../redux/slices/authSlice";
import useReduxErrorToast from "../../hooks/useReduxErrorToast";
import { showSuccessToast } from "../../hooks/useHandleError";
import AuthCard, {
  authInputClass,
  authButtonClass,
  authLinkClass,
} from "../../components/auth/AuthCard";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";
  const { loading, error } = useSelector((state) => state.auth);

  useReduxErrorToast(error, clearError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      const purpose = result.payload.purpose || "login";
      showSuccessToast(
        purpose === "register"
          ? "Account not verified. Enter OTP to complete setup."
          : "OTP sent! Enter the code to continue."
      );
      navigate("/verify-otp", {
        state: {
          email: result.payload.email,
          purpose,
          from,
        },
      });
    }
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

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Sending OTP..." : "Continue"}
        </button>
      </form>
    </AuthCard>
  );
};

export default Login;

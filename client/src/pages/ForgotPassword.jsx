/**
 * pages/ForgotPassword.jsx
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { forgotPassword, clearError } from "../redux/authSlice";
import AuthCard, {
  authInputClass,
  authButtonClass,
  authLinkClass,
} from "../components/AuthCard";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      toast.success("OTP sent! Enter the code to continue.");
      navigate("/verify-otp", {
        state: {
          email: result.payload.email,
          purpose: "forgot-password",
        },
      });
    }
  };

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you an OTP"
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
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;

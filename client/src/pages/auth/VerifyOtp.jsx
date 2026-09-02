/**
 * pages/VerifyOtp.jsx
 * Shared OTP confirmation for login, register, and forgot password.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  verifyOtpCode,
  resendOtpCode,
  clearError,
} from "../../redux/slices/authSlice";
import useReduxErrorToast from "../../hooks/useReduxErrorToast";
import { showErrorToast, showSuccessToast } from "../../hooks/useHandleError";
import AuthCard, { authButtonClass, authLinkClass } from "../../components/auth/AuthCard";
import OtpInput from "../../components/auth/OtpInput";

const PURPOSE_META = {
  login: {
    title: "Verify login",
    subtitle: "Enter the 6-digit OTP sent to your email",
    success: "Logged in successfully!",
    redirect: "/dashboard",
  },
  register: {
    title: "Verify your account",
    subtitle: "Enter the OTP to complete registration",
    success: "Account verified successfully!",
    redirect: "/dashboard",
  },
  "forgot-password": {
    title: "Verify OTP",
    subtitle: "Enter the OTP to reset your password",
    success: "OTP verified! Set your new password.",
    redirect: "/reset-password",
  },
};

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, otpSession } = useSelector((state) => state.auth);

  const purpose =
    location.state?.purpose || otpSession?.purpose || "login";
  const email = location.state?.email || otpSession?.email || "";
  const devOtp = otpSession?.otp;
  const meta = PURPOSE_META[purpose] || PURPOSE_META.login;
  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  useReduxErrorToast(error, clearError);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      showErrorToast("Please enter the 6-digit OTP");
      return;
    }

    const result = await dispatch(
      verifyOtpCode({ email, otp, purpose })
    );

    if (verifyOtpCode.fulfilled.match(result)) {
      showSuccessToast(meta.success);

      if (purpose === "forgot-password") {
        navigate("/reset-password", {
          replace: true,
          state: { email, otpVerified: true },
        });
      } else {
        navigate(purpose === "login" ? from : meta.redirect, { replace: true });
      }
    }
  };

  const handleResend = async () => {
    const result = await dispatch(resendOtpCode({ email, purpose }));
    if (resendOtpCode.fulfilled.match(result)) {
      showSuccessToast("New OTP sent!");
      setOtp("");
    }
  };

  return (
    <AuthCard
      title={meta.title}
      subtitle={meta.subtitle}
      footer={
        <p className="text-center text-sm text-textSecondary">
          <Link to="/login" className={authLinkClass}>
            Back to sign in
          </Link>
        </p>
      }
    >
      <p className="mb-6 text-center text-sm text-textSecondary">
        Code sent to{" "}
        <span className="font-medium text-textPrimary">{email}</span>
      </p>

      {devOtp && (
        <div className="mb-6 rounded-xl border border-accentGreen/20 bg-successBg p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-primaryMid">
            Your OTP
          </p>
          <p className="mt-1 text-2xl font-bold tracking-[0.3em] text-primaryDark">
            {devOtp}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <OtpInput value={otp} onChange={setOtp} disabled={loading} />

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className={authButtonClass}
        >
          {loading ? "Verifying..." : "Confirm OTP"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={loading}
        className="mt-4 w-full text-center text-sm font-medium text-accentGreen hover:text-primaryMid disabled:opacity-60"
      >
        Resend OTP
      </button>
    </AuthCard>
  );
};

export default VerifyOtp;

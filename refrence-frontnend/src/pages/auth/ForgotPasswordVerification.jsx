import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import AuthLayout from "../../layouts/AuthLayout";
import VerificationCodeInput from "../../components/ui/VerificationCodeInput";
import { ChevronRightIcon } from '../../components/ui/Icons';
import { MessageBox } from '../../components/ui/MessageBox';
import authService from "../../services/authService";
import { authKeys } from "../../services/queryKeys";

export default function ForgotPasswordVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState(false);

  const verifyMutation = useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: async (payload) => authService.verifyForgotPassword(payload),
    onSuccess: (_data, variables) => {
      MessageBox("success", "Email verified successfully.");
      navigate(
        `/forgot-password/new-password?token=${encodeURIComponent(variables.token)}&otp=${encodeURIComponent(variables.otp)}`
      );
    }
  });

  const resendMutation = useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: async (payload) => authService.resendOtp(payload),
    onSuccess: () => {
      MessageBox("success", "Verification code resent.");
    }
  });

  const handleVerificationChange = (code) => {
    setVerificationCode(code);
    setCodeError(false);
  };

  const checkValidation = () => {
    if (!token) {
      MessageBox("error", "Invalid verification link. Please try again.");
      navigate("/forgot-password");
      return;
    }

    if (verificationCode.length !== 6) {
      setCodeError(true);
      return;
    }

    if (verifyMutation.isPending) return;

    verifyMutation.mutate({
      token,
      otp: verificationCode
    });
  };

  const handleResendCode = async () => {
    if (!token) {
      MessageBox("error", "Invalid verification link. Please try again.");
      navigate("/forgot-password");
      return;
    }

    if (resendMutation.isPending) return;

    await resendMutation.mutateAsync({
      token
    });
  };

  return (
    <AuthLayout
      brandHref="/sign-in"
      headerRight={
        <>
          <span className="text-[var(--ink)]/60 text-[13px] hidden sm:inline-block font-normal">
            Remember your password?
          </span>
          <Link
            to="/sign-in"
            className="text-[var(--ink)] text-[13px] sm:text-[14px] font-bold hover:text-[var(--brand-orange)] flex items-center gap-1 transition-colors"
          >
            Sign in here
            <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        </>
      }
    >
      <h1 className="text-[22px] sm:text-[30px] md:text-[32px] font-semibold text-[var(--ink)] mb-0.5 sm:mb-1 leading-tight tracking-tight">
        Verify security code
      </h1>
      <p className="text-[var(--ink-muted)] text-[13px] sm:text-[14px] mb-4 sm:mb-6 font-normal">
        Enter the 6-digit code we emailed you
      </p>

      <div className="space-y-6 sm:space-y-8 relative z-10">
        <VerificationCodeInput
          verificationCode={verificationCode}
          setVerificationCode={handleVerificationChange}
          onSubmit={checkValidation}
          onResendCode={handleResendCode}
          goBackTo="/forgot-password"
          error={
            codeError
              ? verificationCode
                ? "Please enter a valid 6-digit code"
                : "Please enter the verification code"
              : ""
          }
          loading={verifyMutation.isPending}
          disabled={verifyMutation.isPending}
        />
      </div>

    </AuthLayout>
  );
}
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import VerificationCodeInput from "../../components/ui/VerificationCodeInput";
import { MessageBox } from '../../components/ui/MessageBox';
import authService from "../../services/authService";
import { getCookie, setCookie, TOKEN_NAME } from "../../utils/cookie";

export default function SignInVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [inputs, setInputs] = useState({
    verificationCode: ""
  });
  const [validations, setValidations] = useState({
    verificationCode: false
  });
  const [loading, setLoading] = useState(false);

  const handleVerificationChange = (code) => {
    setInputs((prev) => ({
      ...prev,
      verificationCode: code
    }));
    setValidations((prev) => ({
      ...prev,
      verificationCode: false
    }));
  };

  const checkValidation = () => {
    if (inputs.verificationCode.length !== 6) {
      return setValidations((prev) => ({
        ...prev,
        verificationCode: true
      }));
    }
    onVerify();
  };

  const onVerify = async () => {
    if (!token) {
      MessageBox("error", "Invalid verification link. Please sign in again.");
      navigate("/sign-in");
      return;
    }
    try {
      setLoading(true);
      const res = await authService.verifyLogin({
        otp: inputs.verificationCode,
        token,
        guest_token: getCookie("guest_token") || ""
      });
      const accessToken =
        typeof res?.data?.access_token === "string" ? res.data.access_token : "";
      if (accessToken) {
        setCookie(TOKEN_NAME, accessToken);
        MessageBox("success", "Login verified successfully");
        navigate("/sign-in");
      } else {
        MessageBox("error", "Something went wrong, please try again.");
        navigate("/sign-in");
      }
    } catch {
      void 0;
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (!token) {
      MessageBox("error", "Invalid verification link. Please sign in again.");
      navigate("/sign-in");
      return;
    }
    try {
      await authService.resendOtp({ token });
      MessageBox("success", "Verification code resent.");
    } catch {
      void 0;
    }
  };

  return (
    <AuthLayout brandHref="/sign-in">
      <h1 className="text-[22px] sm:text-[30px] md:text-[32px] font-semibold text-[var(--ink)] mb-0.5 sm:mb-1 leading-tight tracking-tight">
        Verify login
      </h1>
      <p className="text-[var(--ink-muted)] text-[13px] sm:text-[14px] mb-4 sm:mb-6 font-normal">
        Enter the 6-digit code we emailed you
      </p>

      <div className="space-y-6 sm:space-y-8 relative z-10">
        <VerificationCodeInput
          verificationCode={inputs.verificationCode}
          setVerificationCode={handleVerificationChange}
          onSubmit={checkValidation}
          onResendCode={resendCode}
          goBackTo="/sign-in"
          error={
            validations.verificationCode
              ? inputs.verificationCode
                ? "Please enter a valid 6-digit code"
                : "Please enter the verification code"
              : ""
          }
          loading={loading}
          disabled={loading}
        />
      </div>
    </AuthLayout>
  );
}
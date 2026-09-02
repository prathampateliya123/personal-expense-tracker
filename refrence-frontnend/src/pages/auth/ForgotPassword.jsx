import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import AuthLayout from "../../layouts/AuthLayout";
import { ChevronRightIcon } from "../../components/ui/Icons";
import { MessageBox } from "../../components/ui/MessageBox";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import authService, { extractAuthToken } from "../../services/authService";
import { authKeys } from "../../services/queryKeys";
import { EMAIL_REGEX } from "../../utils/constants";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [emailError, setEmailError] = useState(false);

  const forgotMutation = useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: async (payload) => authService.forgotPassword(payload),
    onSuccess: (data) => {
      const token = extractAuthToken(data);
      if (!token) {
        MessageBox("error", "Something went wrong. Please try again.");
        return;
      }

      MessageBox("success", "Verification code has been sent to your email.");
      navigate(`/forgot-password/verification?token=${encodeURIComponent(token)}`);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      setEmailError(true);
      return;
    }

    if (forgotMutation.isPending) return;

    forgotMutation.mutate({
      email: email.trim()
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
        Forgot Password?
      </h1>
      <p className="text-[var(--ink-muted)] text-[13px] sm:text-[14px] mb-4 sm:mb-6 font-normal">
        Enter your email to receive a verification code.
      </p>

      <form method="post" className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        <Input
          id="forgot-email"
          type="email"
          name="email"
          label="Email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError(false);
          }}
          placeholder="Enter your email"
          autoComplete="username"
          error={emailError}
          errorMessage={email ? "Please enter a valid email" : "Please enter your email"}
        />

        <Button type="submit" fullWidth loading={forgotMutation.isPending} className="mt-1 sm:mt-2 uppercase">
          Confirm
        </Button>
      </form>
    </AuthLayout>
  );
}
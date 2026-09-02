import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import AuthLayout from "../../layouts/AuthLayout";
import { CheckMarkIcon, ChevronRightIcon } from "../../components/ui/Icons";
import { MessageBox } from "../../components/ui/MessageBox";
import Button from "../../components/ui/Button";
import PasswordInput from "../../components/ui/PasswordInput";
import authService from "../../services/authService";
import { authKeys } from "../../services/queryKeys";
import {
  PASSWORD_DIGIT_REGEX,
  PASSWORD_LOWER_REGEX,
  PASSWORD_REGEX,
  PASSWORD_SPECIAL_REGEX,
  PASSWORD_UPPER_REGEX
} from "../../utils/constants";

export default function CreateNewPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const otp = searchParams.get("otp") || "";

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    newPassword: false,
    confirmPassword: false
  });

  const resetMutation = useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: async (payload) => authService.resetPassword(payload),
    onSuccess: () => {
      MessageBox("success", "Password reset successfully.");
      navigate("/sign-in", { replace: true });
    }
  });

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: false
    }));
  };

  const handleSubmit = () => {
    if (!token || !otp) {
      MessageBox("error", "Invalid reset link. Please try again.");
      navigate("/forgot-password");
      return;
    }

    if (resetMutation.isPending) return;

    resetMutation.mutate({
      token,
      password: passwords.newPassword,
      otp
    });
  };

  const checkValidations = () => {
    if (!passwords.newPassword || !PASSWORD_REGEX.test(passwords.newPassword)) {
      return setErrors({
        newPassword: true,
        confirmPassword: false
      });
    }

    if (!passwords.confirmPassword || passwords.newPassword !== passwords.confirmPassword) {
      return setErrors({
        newPassword: false,
        confirmPassword: true
      });
    }

    setErrors({
      newPassword: false,
      confirmPassword: false
    });

    handleSubmit();
  };

  const pwd = passwords.newPassword;
  const passwordRequirements = [
    {
      text: "A minimum of 8 characters",
      met: pwd.length >= 8
    },
    {
      text: "Lower and uppercase letters",
      met: PASSWORD_LOWER_REGEX.test(pwd) && PASSWORD_UPPER_REGEX.test(pwd)
    },
    {
      text: "At least 1 number",
      met: PASSWORD_DIGIT_REGEX.test(pwd)
    },
    {
      text: "At least 1 symbol",
      met: PASSWORD_SPECIAL_REGEX.test(pwd)
    }
  ];

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
        Create new password
      </h1>
      <p className="text-[var(--ink-muted)] text-[13px] sm:text-[14px] mb-4 sm:mb-6 font-normal">
        Set a strong password to secure your account.
      </p>

      <form
        method="post"
        className="space-y-4 sm:space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          checkValidations();
        }}
      >
        <PasswordInput
          id="newPassword"
          name="newPassword"
          label="New Password"
          required
          value={passwords.newPassword}
          onChange={handlePasswordChange}
          placeholder="Enter your new password"
          autoComplete="new-password"
          error={errors.newPassword}
          errorMessage="Please enter a valid password"
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          required
          value={passwords.confirmPassword}
          onChange={handlePasswordChange}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          errorMessage={
            !passwords.confirmPassword ? "Please enter your password" : "Passwords do not match"
          }
        />

        <ul className="mt-1 sm:mt-2 space-y-1.5 sm:space-y-2">
          {passwordRequirements.map((req) => (
            <li key={req.text} className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium">
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[7px] border ${req.met ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]" : "border-[var(--ink)]/20"
                  }`}
              >
                {req.met ? (
                  <CheckMarkIcon className="h-2.5 w-2.5 text-white" strokeWidth={4} />
                ) : null}
              </div>
              <span
                className={
                  req.met
                    ? "text-[13px] sm:text-[14px] font-normal text-[var(--ink)]"
                    : "text-[13px] sm:text-[14px] font-normal text-[var(--ink)]/55"
                }
              >
                {req.text}
              </span>
            </li>
          ))}
        </ul>

        <Button type="submit" fullWidth loading={resetMutation.isPending} className="mt-1 sm:mt-2 uppercase">
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
}
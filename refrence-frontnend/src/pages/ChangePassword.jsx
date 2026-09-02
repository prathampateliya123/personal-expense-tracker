import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import AccountSettingsNav from "../layouts/AccountSettingsNav";
import { MessageBox } from "../components/ui/MessageBox";
import Button from "../components/ui/Button";
import PasswordInput from "../components/ui/PasswordInput";
import { useUserProfile } from "../context/UserProfileContext";
import userService from "../services/userService";
import { userKeys } from "../services/queryKeys";
import { getCookie, TOKEN_NAME } from "../utils/cookie";
import { PASSWORD_REGEX } from "../utils/constants";

export default function ChangePassword() {
  const navigate = useNavigate();
  const token = getCookie(TOKEN_NAME);
  const { userData, isPassword, isFetched, ensureLoaded } = useUserProfile();

  const [inputs, setInputs] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [fieldError, setFieldError] = useState(null);

  const showForgotPasswordOption = isFetched && isPassword === false;

  const changePasswordMutation = useMutation({
    mutationKey: userKeys.changePassword(),
    mutationFn: async (payload) =>
      userService.changePassword(payload, getCookie(TOKEN_NAME)),
    onSuccess: (data) => {
      MessageBox("success", data?.message || "Password changed successfully.");
      setInputs({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setFieldError(null);
    }
  });

  useEffect(() => {
    if (!token) {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!token) return;
    ensureLoaded();
  }, [token, ensureLoaded]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value
    }));
    if (fieldError === name) {
      setFieldError(null);
    }
  };

  const handleForgotPassword = () => {
    const email = userData?.email || "";
    if (email) {
      navigate(`/forgot-password?email=${encodeURIComponent(email)}`);
      return;
    }
    navigate("/forgot-password");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (changePasswordMutation.isPending) return;

    if (!inputs.currentPassword.trim()) {
      setFieldError("currentPassword");
      return;
    }

    if (!inputs.newPassword || !PASSWORD_REGEX.test(inputs.newPassword)) {
      setFieldError("newPassword");
      return;
    }

    if (!inputs.confirmPassword || inputs.newPassword !== inputs.confirmPassword) {
      setFieldError("confirmPassword");
      return;
    }

    setFieldError(null);
    changePasswordMutation.mutate({
      password: inputs.currentPassword,
      new_password: inputs.newPassword,
      confirm_password: inputs.confirmPassword
    });
  };

  if (!token) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-0 min-h-full">
        <aside className="md:w-[220px] lg:w-[240px] shrink-0 md:pr-6 md:border-r md:border-[var(--border)]">
          <div className="md:sticky md:top-0">
            <AccountSettingsNav />
          </div>
        </aside>

        <div className="flex-1 min-w-0 md:pl-6 lg:pl-8">
          <h1 className="page-title">
            Change Password
          </h1>
          <p className="page-subtitle">
            Please enter your current password to change your password.
          </p>

          <form method="post" className="mt-8" onSubmit={handleSubmit}>
            <div className="divide-y divide-[var(--ink)]/10">
              <PasswordInput
                id="current-password"
                name="currentPassword"
                label="Current Password"
                required
                layout="inline"
                size="md"
                value={inputs.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                autoComplete="current-password"
                error={fieldError === "currentPassword"}
                errorMessage="Please enter your current password"
              />
              <PasswordInput
                id="new-password"
                name="newPassword"
                label="New Password"
                required
                layout="inline"
                size="md"
                value={inputs.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                autoComplete="new-password"
                error={fieldError === "newPassword"}
                errorMessage="Password must be 8+ chars with upper, lower, number & symbol"
              />
              <PasswordInput
                id="confirm-password"
                name="confirmPassword"
                label="Confirm New Password"
                required
                layout="inline"
                size="md"
                value={inputs.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                autoComplete="new-password"
                error={fieldError === "confirmPassword"}
                errorMessage={
                  !inputs.confirmPassword
                    ? "Please confirm your new password"
                    : "Passwords do not match"
                }
              />
            </div>

            <div
              className={`mt-6 flex flex-col gap-3 sm:flex-row ${showForgotPasswordOption ? "sm:items-center sm:justify-between" : "sm:justify-end"
                }`}
            >
              {showForgotPasswordOption ? (
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <p className="text-[13px] text-[var(--ink)]/65">
                    If you don&apos;t set a password?
                  </p>
                  <Button type="button" variant="secondary" size="md" onClick={handleForgotPassword} className="w-full sm:w-auto">
                    Forgot Password
                  </Button>
                </div>
              ) : null}

              <Button
                type="submit"
                size="md"
                loading={changePasswordMutation.isPending}
                className="min-w-[140px] w-full sm:ml-auto sm:w-auto"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
  );
}
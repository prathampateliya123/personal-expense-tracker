import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AuthLayout from "../../layouts/AuthLayout";
import { MessageBox } from "../../components/ui/MessageBox";
import SocialAuthButtons from "../../components/ui/SocialAuthButtons";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import authService, {
  extractAuthToken,
  extractRedirectUrl,
  shouldRedirectToRegistration
} from "../../services/authService";
import { fetchUserIP, getBrowserInfo, getPlatformType } from "../../utils/helper";
import { authKeys, storeKeys, userKeys } from "../../services/queryKeys";
import { setCookie, TOKEN_NAME } from "../../utils/cookie";
import { EMAIL_REGEX } from "../../utils/constants";
import { handleApiError } from "../../hooks/useHandleError";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });
  const [emailError, setEmailError] = useState(false);

  const signInMutation = useMutation({
    mutationKey: authKeys.login(),
    mutationFn: async (credentials) => {
      const ipAddress = await fetchUserIP();
      const { browser, os, device } = getBrowserInfo();

      return authService.login({
        email: credentials.email,
        password: credentials.password,
        login_type: "classic",
        access_token: "",
        social_id: "",
        json_data: {
          additionalProp1: {
            ip: ipAddress || "",
            browser,
            os,
            device
          }
        },
        platform_type: getPlatformType()
      });
    },
    onSuccess: (data) => {
      if (shouldRedirectToRegistration(data)) {
        MessageBox("info", "Account not found. Please continue with Amazon to register.");
        return;
      }

      const token = extractAuthToken(data);

      if (token) {
        setCookie(TOKEN_NAME, token);
        queryClient.invalidateQueries({ queryKey: storeKeys.all });
        queryClient.invalidateQueries({ queryKey: userKeys.getUser() });
        MessageBox("success", "Signed in successfully");
        navigate(location.state?.from?.pathname || "/", { replace: true });
      } else {
        MessageBox("error", "Something went wrong. Please try again.");
      }
    },
    onError: (error) => {
      if (shouldRedirectToRegistration(error)) {
        MessageBox("info", "Account not found. Please continue with Amazon to register.");
        return;
      }
      // Interceptor usually toasts; keep a fallback if it didn't.
      handleApiError(error);
    }
  });

  const amazonLoginMutation = useMutation({
    mutationKey: authKeys.login(),
    mutationFn: async () =>
      authService.login({
        login_type: "amazon"
      }),
    onSuccess: (data) => {
      const redirectUrl = extractRedirectUrl(data);

      if (!redirectUrl) {
        MessageBox("error", "Amazon redirect URL was not found. Please try again.");
        return;
      }

      window.location.assign(redirectUrl);
    },
    onError: (error) => {
      handleApiError(error);
    }
  });

  const formDisabled = signInMutation.isPending || amazonLoginMutation.isPending;

  const handleAmazonLogin = () => {
    if (amazonLoginMutation.isPending) return;
    amazonLoginMutation.mutate();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === "email") setEmailError(false);
  };

  const checkValidations = () => {
    if (!inputs.email || !EMAIL_REGEX.test(inputs.email)) {
      setEmailError(true);
      return;
    }

    setEmailError(false);

    if (!String(inputs.password || "").trim()) {
      MessageBox("error", "Please enter your password");
      return;
    }

    if (signInMutation.isPending) return;

    signInMutation.mutate({
      email: inputs.email.trim(),
      password: inputs.password
    });
  };

  return (
    <AuthLayout brandHref="/sign-in">
      <h1 className="text-[22px] sm:text-[30px] md:text-[32px] font-semibold text-[var(--ink)] mb-0.5 sm:mb-1 leading-tight tracking-tight">
        Back to Business
      </h1>
      <p className="text-[var(--ink-muted)] text-[13px] sm:text-[14px] mb-4 sm:mb-6 font-normal">
        Enter your email and password to continue.
      </p>

      <form
        method="post"
        className="space-y-4 sm:space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          checkValidations();
        }}
      >
        <Input
          id="signin-email"
          type="email"
          name="email"
          label="Email"
          required
          value={inputs.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          autoComplete="username"
          error={emailError}
          errorMessage="Please enter a valid email"
        />

        <div>
          <PasswordInput
            id="signin-password"
            name="password"
            label="Password"
            required
            value={inputs.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <div className="flex justify-end pt-1">
            <Link to="/forgot-password" className="text-[var(--ink)]/70 text-[12px] sm:text-[15px] hover:text-[var(--brand-orange)] transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth loading={signInMutation.isPending} disabled={formDisabled} className="mt-1 sm:mt-2 uppercase">
          Sign in
        </Button>

        <div className="flex items-center gap-2.5 sm:gap-3 pt-1 sm:pt-3">
          <div className="h-px flex-1 bg-[var(--ink)]/15" />
          <span className="text-[12px] sm:text-[13px] font-medium tracking-wide text-[var(--ink)]/60">Or</span>
          <div className="h-px flex-1 bg-[var(--ink)]/15" />
        </div>

        <SocialAuthButtons
          onAmazonClick={handleAmazonLogin}
          amazonLoading={amazonLoginMutation.isPending}
          disabled={formDisabled}
        />
      </form>
    </AuthLayout>
  );
}

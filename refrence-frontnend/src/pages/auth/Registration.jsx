import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import { Label } from "../../components/ui/Field";
import { CheckMarkIcon } from "../../components/ui/Icons";
import { MessageBox } from "../../components/ui/MessageBox";
import { CountryCodeSelect } from "../../components/ui/CountrySelect";
import FieldErrorTooltip from "../../components/ui/FieldErrorTooltip";
import authService, {
  extractAuthToken,
  getNameFromEmail
} from "../../services/authService";
import countries from "../../utils/countries.json";
import { fetchUserIP, getBrowserInfo, getPlatformType } from "../../utils/helper";
import { authKeys } from "../../services/queryKeys";
import { setCookie, TOKEN_NAME } from "../../utils/cookie";
import { DEFAULT_COUNTRY, NON_DIGIT_REGEX, PASSWORD_DIGIT_REGEX, PASSWORD_LOWER_REGEX, PASSWORD_REGEX, PASSWORD_SPECIAL_REGEX, PASSWORD_UPPER_REGEX, PHONE_REGEX } from "../../utils/constants";
import {
  clearPendingAmazonRegistration,
  getPendingAmazonRegistration
} from "../../utils/storage";

const resolvePendingRegistration = () => {
  const pendingAmazon = getPendingAmazonRegistration();

  if (pendingAmazon?.amazon_access_token && (pendingAmazon.email || pendingAmazon.amazon_profile?.email)) {
    const email = pendingAmazon.email || pendingAmazon.amazon_profile?.email || "";
    const name =
      pendingAmazon.name ||
      pendingAmazon.amazon_profile?.name ||
      getNameFromEmail(email);

    return {
      email,
      name,
      brandName: String(pendingAmazon.amazon_profile?.name || pendingAmazon.name || "").trim(),
      accessToken: pendingAmazon.amazon_access_token || "",
      socialId: pendingAmazon.amazon_user_id || pendingAmazon.amazon_profile_id || "",
      sessionData: pendingAmazon
    };
  }

  return null;
};

export default function Registration() {
  const navigate = useNavigate();
  const pending = useMemo(() => resolvePendingRegistration(), []);
  const initialCountry =
    countries.find((country) => country.isoCode === DEFAULT_COUNTRY.isoCode) || countries[0];

  const [inputs, setInputs] = useState({
    countryIso: initialCountry?.isoCode || DEFAULT_COUNTRY.isoCode,
    phone: "",
    brandName: pending?.brandName || "",
    password: ""
  });
  const [validations, setValidations] = useState({
    phone: false,
    brandName: false,
    password: false
  });

  useEffect(() => {
    if (!pending?.email || !pending?.accessToken) {
      MessageBox("error", "Please continue with Amazon to complete registration.");
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, pending]);

  const selectedCountry =
    countries.find((country) => country.isoCode === inputs.countryIso) || initialCountry;

  const passwordRequirements = useMemo(() => {
    const pwd = inputs.password;
    return [
      { text: "A minimum of 8 characters", met: pwd.length >= 8 },
      {
        text: "Lower and uppercase letters",
        met: PASSWORD_LOWER_REGEX.test(pwd) && PASSWORD_UPPER_REGEX.test(pwd)
      },
      { text: "At least 1 number", met: PASSWORD_DIGIT_REGEX.test(pwd) },
      {
        text: "At least 1 symbol",
        met: PASSWORD_SPECIAL_REGEX.test(pwd)
      }
    ];
  }, [inputs.password]);

  const registerMutation = useMutation({
    mutationKey: authKeys.register(),
    mutationFn: async () => {
      const email = pending?.email || "";
      const ipAddress = await fetchUserIP();
      const { browser, os, device } = getBrowserInfo();

      const basePayload = {
        name: pending?.name || getNameFromEmail(email),
        email,
        password: inputs.password,
        mobile: inputs.phone,
        mobile_code: selectedCountry?.dialCode || DEFAULT_COUNTRY.dialCode,
        country: selectedCountry?.name || "",
        json_data: {
          additionalProp1: {
            ip: ipAddress || "",
            browser,
            os,
            device
          }
        },
        register_type: "amazon",
        access_token: pending?.accessToken || "",
        social_id: pending?.socialId || "",
        brand_name: inputs.brandName.trim(),
        platform_type: getPlatformType()
      };

      const sessionData = { ...(pending.sessionData || {}) };
      delete sessionData.token;
      delete sessionData.auth_token;
      delete sessionData.access_token;

      return authService.register({
        ...sessionData,
        ...basePayload
      });
    },
    onSuccess: (data) => {
      const token = extractAuthToken(data);
      if (!token) {
        MessageBox(
          "error",
          "Registration completed but a valid login token was not found. Please sign in again."
        );
        return;
      }

      setCookie(TOKEN_NAME, token);
      clearPendingAmazonRegistration();
      MessageBox("success", "Registration completed successfully");
      navigate("/", { replace: true });
    }
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({
      ...prev,
      [name]: name === "phone" ? value.replace(NON_DIGIT_REGEX, "") : value
    }));
    setValidations((prev) => ({
      ...prev,
      [name]: false
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (registerMutation.isPending) return;

    if (!PHONE_REGEX.test(inputs.phone)) {
      setValidations({ phone: true, brandName: false, password: false });
      return;
    }

    if (inputs.brandName.trim().length === 0) {
      setValidations({ phone: false, brandName: true, password: false });
      return;
    }

    if (!inputs.password || !PASSWORD_REGEX.test(inputs.password)) {
      setValidations({ phone: false, brandName: false, password: true });
      return;
    }

    setValidations({ phone: false, brandName: false, password: false });
    registerMutation.mutate();
  };

  return (
    <AuthLayout brandHref="/sign-in">
      <h1 className="text-[22px] sm:text-[30px] md:text-[32px] font-semibold text-[var(--ink)] mb-0.5 sm:mb-1 leading-tight tracking-tight">
        Complete registration
      </h1>
      <p className="text-[var(--ink-muted)] text-[13px] sm:text-[14px] mb-4 sm:mb-6 font-normal">
        Add a few details to finish setting up your account.
      </p>

      {!pending?.email ? null : (
        <form method="post" className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <Input
            id="signup-email"
            type="email"
            name="email"
            label="Email"
            required
            value={pending.email}
            readOnly
            disabled
            autoComplete="username"
            inputClassName="disabled:opacity-100"
            hint="Verified from your Amazon account"
          />

          <div className="h-px bg-[var(--border)]" />

          <div>
            <Label htmlFor="phone" required>
              Phone Number
            </Label>
            <div className="relative">
              <div
                className={`flex h-[46px] sm:h-[50px] overflow-visible rounded-[7px] border bg-[var(--surface)] transition-all focus-within:border-[var(--brand-orange)] ${validations.phone
                    ? "border-red-500"
                    : "border-[var(--border)] hover:border-[var(--border-strong)]"
                  }`}
              >
                <CountryCodeSelect
                  countries={countries}
                  value={inputs.countryIso}
                  onChange={handleChange}
                />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={inputs.phone}
                  onChange={handleChange}
                  placeholder="Enter your number"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  enterKeyHint="next"
                  aria-invalid={validations.phone || undefined}
                  aria-describedby={validations.phone ? "phone-error" : undefined}
                  className="w-full border-0 bg-[var(--surface)] px-[14px] py-[12px] text-[14px] text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-subtle)]"
                />
              </div>
              <FieldErrorTooltip
                id="phone-error"
                show={validations.phone}
                message="Please enter a valid phone number"
              />
            </div>
          </div>

          <Input
            id="brand-name"
            type="text"
            name="brandName"
            label="Brand Name"
            required
            value={inputs.brandName}
            onChange={handleChange}
            placeholder="Enter brand name here..."
            autoComplete="organization"
            enterKeyHint="next"
            error={validations.brandName}
            errorMessage="Brand Name is required"
          />

          <div>
            <PasswordInput
              id="signup-password"
              name="password"
              label="Set Password"
              required
              value={inputs.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="new-password"
              enterKeyHint="done"
              error={validations.password}
              errorMessage="Password must be 8+ characters with uppercase, lowercase, number and special character"
            />

            <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
              {passwordRequirements.map((req) => (
                <li key={req.text} className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[7px] border ${req.met
                        ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]"
                        : "border-[var(--border)]"
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
                        : "text-[13px] sm:text-[14px] font-normal text-[var(--ink-muted)]"
                    }
                  >
                    {req.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending}
            className="mt-1 sm:mt-2 uppercase"
          >
            Finish Sign up
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
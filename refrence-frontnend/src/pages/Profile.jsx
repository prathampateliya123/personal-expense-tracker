import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AccountSettingsNav from "../layouts/AccountSettingsNav";
import { MessageBox } from "../components/ui/MessageBox";
import Button from "../components/ui/Button";
import FieldErrorTooltip from "../components/ui/FieldErrorTooltip";
import CountrySelect, { CountryCodeSelect } from "../components/ui/CountrySelect";
import Input from "../components/ui/Input";
import { useUserProfile } from "../context/UserProfileContext";
import userService from "../services/userService";
import { userKeys } from "../services/queryKeys";
import countries from "../utils/countries.json";
import { getCookie, TOKEN_NAME } from "../utils/cookie";
import { DEFAULT_COUNTRY, NON_DIGIT_REGEX, PHONE_REGEX } from "../utils/constants";

const resolveCountryFromUser = (userData, fallback) => {
  const countryName = userData?.country || "";
  const dialCode = userData?.country_code || userData?.mobile_code || "";

  const matchedByName = countries.find((country) => country.name === countryName);
  const matchedByCode = countries.find((country) => country.dialCode === dialCode);

  return matchedByName || matchedByCode || fallback;
};

export default function Profile() {
  const navigate = useNavigate();
  const token = getCookie(TOKEN_NAME);
  const { userData, isLoading, isFetched, ensureLoaded, refetch } = useUserProfile();
  const initialCountry =
    countries.find((country) => country.isoCode === DEFAULT_COUNTRY.isoCode) || countries[0];

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    countryIso: initialCountry?.isoCode || DEFAULT_COUNTRY.isoCode,
    phone: "",
    country: initialCountry?.name || DEFAULT_COUNTRY.name
  });
  const [fieldError, setFieldError] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const updateProfileMutation = useMutation({
    mutationKey: userKeys.updateProfile(),
    mutationFn: async (payload) =>
      userService.updateProfile(payload, getCookie(TOKEN_NAME)),
    onSuccess: async (data) => {
      MessageBox("success", data?.message || "Profile updated successfully.");
      await refetch();
      setHydrated(false);
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

  useEffect(() => {
    if (!isFetched || hydrated) return;

    const country = resolveCountryFromUser(userData, initialCountry);

    setInputs({
      name: userData?.name || "",
      email: userData?.email || "",
      phone: String(userData?.mobile || "").replace(NON_DIGIT_REGEX, ""),
      countryIso: country?.isoCode || DEFAULT_COUNTRY.isoCode,
      country: userData?.country || country?.name || ""
    });
    setHydrated(true);
  }, [userData, isFetched, hydrated, initialCountry]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    let nextValue = value;
    if (name === "name") {
      nextValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phone") {
      nextValue = value.replace(NON_DIGIT_REGEX, "");
    }

    setInputs((prev) => ({
      ...prev,
      [name]: nextValue
    }));
    if (fieldError === name) {
      setFieldError(null);
    }
  };

  const handleCountryIsoChange = (event) => {
    const nextIso = event.target.value;
    setInputs((prev) => ({
      ...prev,
      countryIso: nextIso
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (updateProfileMutation.isPending) return;

    if (!inputs.name.trim()) {
      setFieldError("name");
      return;
    }

    if (inputs.phone && !PHONE_REGEX.test(inputs.phone)) {
      setFieldError("phone");
      return;
    }

    if (!inputs.country.trim()) {
      setFieldError("country");
      return;
    }

    const selectedCountry =
      countries.find((country) => country.isoCode === inputs.countryIso) || initialCountry;

    setFieldError(null);
    updateProfileMutation.mutate({
      name: inputs.name.trim(),
      email: inputs.email.trim(),
      country_code: selectedCountry?.dialCode || DEFAULT_COUNTRY.dialCode,
      mobile: inputs.phone,
      country: inputs.country.trim(),
      avatar: ""
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
            Profile Details
          </h1>
          <p className="page-subtitle">
            Manage your profile details.
          </p>

          <form
            method="post"
            className={`mt-8 ${isLoading && !hydrated ? "pointer-events-none opacity-70" : ""}`}
            onSubmit={handleSubmit}
            aria-busy={isLoading && !hydrated ? true : undefined}
          >
              <div className="divide-y divide-[var(--ink)]/10 rounded-[7px] border border-[var(--ink)]/10">
                <Input
                  id="profile-name"
                  type="text"
                  name="name"
                  label="Name"
                  layout="inline"
                  size="md"
                  value={inputs.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  disabled={isLoading && !hydrated}
                  error={fieldError === "name"}
                  errorMessage="Name is required"
                />

                <Input
                  id="profile-email"
                  type="email"
                  name="email"
                  label="Email Address"
                  layout="inline"
                  size="md"
                  value={inputs.email}
                  readOnly
                  disabled
                  autoComplete="username"
                />

                <div className="grid grid-cols-1 items-center gap-2 px-4 py-4 sm:grid-cols-[180px_1fr] sm:gap-6 sm:px-5">
                  <label htmlFor="profile-phone" className="text-[14px] font-medium uppercase text-[var(--ink)]">
                    Mobile
                  </label>
                  <div className="relative">
                    <div className="relative">
                      <div
                        className={`flex h-[44px] overflow-visible rounded-[7px] border bg-[var(--surface)] transition-all ${fieldError === "phone"
                            ? "border-red-500"
                            : "border-[var(--border)] focus-within:border-[var(--brand-orange)] hover:border-[var(--border-strong)]"
                          }`}
                      >
                        <CountryCodeSelect
                          countries={countries}
                          value={inputs.countryIso}
                          onChange={handleCountryIsoChange}
                        />
                        <input
                          id="profile-phone"
                          type="tel"
                          name="phone"
                          value={inputs.phone}
                          onChange={handleChange}
                          placeholder="Enter your number"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          aria-invalid={fieldError === "phone"}
                          className="w-full border-0 bg-[var(--surface)] px-[14px] text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-subtle)]"
                        />
                      </div>
                      <FieldErrorTooltip
                        id="profile-phone-error"
                        show={fieldError === "phone"}
                        message="Please enter a valid mobile number"
                      />
                    </div>
                  </div>
                </div>

                <CountrySelect
                  label="Country"
                  layout="inline"
                  size="md"
                  countries={countries}
                  value={inputs.country}
                  onChange={handleChange}
                  name="country"
                  error={fieldError === "country"}
                  errorMessage="Please choose a country"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  size="md"
                  loading={updateProfileMutation.isPending || (isLoading && !hydrated)}
                  disabled={isLoading && !hydrated}
                  className="w-full min-w-0 sm:w-auto sm:min-w-[140px]"
                >
                  Save Changes
                </Button>
              </div>
            </form>
        </div>
      </div>
  );
}
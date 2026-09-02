import apiService from "./apiService";
import { getNameFromEmail } from "../utils/helper";
import {
  AMAZON_ACCESS_TOKEN_REGEX,
  AMAZON_CLIENT_TOKEN_REGEX,
  AMAZON_REFRESH_TOKEN_REGEX,
  BEARER_PREFIX_REGEX,
  GOOGLE_OAUTH_TOKEN_REGEX,
  HTTP_URL_REGEX
} from "../utils/constants";

export { getNameFromEmail };

const stripBearerPrefix = (value = "") =>
  String(value).trim().replace(BEARER_PREFIX_REGEX, "").trim();

const isProviderOAuthToken = (value = "") => {
  const token = String(value).trim();
  if (!token) return true;
  if (
    AMAZON_ACCESS_TOKEN_REGEX.test(token) ||
    AMAZON_REFRESH_TOKEN_REGEX.test(token) ||
    AMAZON_CLIENT_TOKEN_REGEX.test(token)
  ) {
    return true;
  }
  if (GOOGLE_OAUTH_TOKEN_REGEX.test(token)) return true;
  if (token.includes("|") && token.length > 80) return true;
  return false;
};

const normalizeAppToken = (value) => {
  if (typeof value !== "string") return "";
  const token = stripBearerPrefix(value);
  if (!token || isProviderOAuthToken(token)) return "";
  return token;
};

export const extractAuthToken = (payload) => {
  if (!payload) return "";
  if (typeof payload === "string") return normalizeAppToken(payload);
  if (typeof payload?.data === "string") return normalizeAppToken(payload.data);

  const candidates = [
    payload?.token,
    payload?.auth_token,
    payload?.data?.token,
    payload?.data?.auth_token,
    payload?.data?.data?.token,
    payload?.data?.data?.auth_token,
    payload?.access_token,
    payload?.data?.access_token
  ];

  for (const candidate of candidates) {
    const token = normalizeAppToken(candidate);
    if (token) return token;
  }

  return "";
};

export const shouldRedirectToRegistration = (payload) => {
  const data = payload?.response?.data || payload;

  return Boolean(
    data?.is_redirect ||
    data?.data?.is_redirect ||
    data?.status === "register" ||
    data?.data?.status === "register"
  );
};

export const extractRegistrationRedirectData = (payload) => {
  const root = payload?.response?.data || payload;
  const data = root?.data && typeof root.data === "object" ? root.data : root;

  if (!data || typeof data !== "object") {
    return null;
  }

  return {
    ...data,
    email: data.email || data?.amazon_profile?.email || "",
    name: data.name || data?.amazon_profile?.name || "",
    is_redirect: Boolean(data.is_redirect ?? root?.is_redirect)
  };
};

export const extractRedirectUrl = (payload) => {
  const data = payload?.response?.data || payload;
  const candidates = [
    typeof data === "string" ? data : "",
    typeof data?.data === "string" ? data.data : "",
    data?.redirect_url,
    data?.redirectUrl,
    data?.url,
    data?.data?.redirect_url,
    data?.data?.redirectUrl,
    data?.data?.url
  ];

  const redirectUrl = candidates.find(
    (value) => typeof value === "string" && HTTP_URL_REGEX.test(value)
  );

  return redirectUrl?.trim() || "";
};

const authConfig = (token = "") =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${String(token).replace(BEARER_PREFIX_REGEX, "").trim()}`
        }
      }
    : {};

export const authService = {
  login: async (payload) => apiService.post("auth/login", payload),

  register: async (payload) => apiService.post("auth/register", payload),

  amazonCallback: async (payload) => apiService.post("auth/callback", payload),

  forgotPassword: async (payload) => apiService.post("auth/forgot-password", payload),

  verifyForgotPassword: async (payload) =>
    apiService.post("auth/verify-forgot-password", payload),

  resetPassword: async (payload) => apiService.post("auth/reset-password", payload),

  resendOtp: async (payload) => apiService.post("auth/resend-otp", payload),

  verifyLogin: async (payload) => apiService.post("auth/verify-login", payload),

  logout: async (token = "") => apiService.post("auth/logout", {}, authConfig(token))
};

export default authService;
import { useCallback } from "react";
import { MessageBox } from '../components/ui/MessageBox';
import authService from "../services/authService";
import { AUTH_API_PATTERN, AUTH_PAGE_PREFIXES } from "../utils/constants";
import { clearCookie, getCookie, TOKEN_NAME } from "../utils/cookie";

const HANDLED_FLAG = "__handledByUseHandleError";

let isRedirectingToLogin = false;

const isAuthPage = () => {
  const path = window.location.pathname || "";
  return AUTH_PAGE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};

const getRequestUrl = (error) => {
  const url = String(error?.config?.url || "");
  const baseURL = String(error?.config?.baseURL || "");
  return `${baseURL}${url}`;
};

const isAuthApiRequest = (error) => {
  const requestUrl = getRequestUrl(error);
  if (AUTH_API_PATTERN.test(requestUrl)) return true;
  return /(^|\/)auth\/(login|register|forgot-password|verify-forgot-password|reset-password|resend-otp|callback|logout|verify-login)(\/|\?|$)/i.test(
    requestUrl
  );
};

const markHandled = (error) => {
  if (error && typeof error === "object") {
    error[HANDLED_FLAG] = true;
  }
};

const isAlreadyHandled = (error) => Boolean(error?.[HANDLED_FLAG]);

const redirectToLogin = async () => {
  if (isRedirectingToLogin || isAuthPage()) return;
  isRedirectingToLogin = true;

  const token = getCookie(TOKEN_NAME);
  try {
    if (token) {
      await authService.logout(token);
    }
  } catch {
    void 0;
  } finally {
    clearCookie();
    window.location.replace("/sign-in");
  }
};

export const handleApiError = (error, customMessage = null) => {
  if (isAlreadyHandled(error) || isRedirectingToLogin) return;
  markHandled(error);

  const status = error?.response?.status ?? error?.status;
  const backendMessage = error?.response?.data?.message || error?.response?.data?.detail;
  const isAuthApi = isAuthApiRequest(error);

  if (status === 401 && !isAuthApi) {
    void redirectToLogin();
    return;
  }

  let message = customMessage || backendMessage || error?.message || "An unexpected error occurred";

  if (status === 401) {
    message = backendMessage || customMessage || "Unauthorized. Please sign in again.";
  } else if (status === 422) {
    message = backendMessage || customMessage || "Please check your inputs";
  } else if (status === 500) {
    message = "Internal server error. Please try again later.";
  } else if (status === 503) {
    message = "Service temporarily unavailable. Please try again later.";
  }

  MessageBox("error", message);
};

export const useHandleError = () => {
  const handleError = useCallback((error, customMessage = null) => {
    handleApiError(error, customMessage);
  }, []);

  return { handleError };
};

export default useHandleError;
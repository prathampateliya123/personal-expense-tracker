/**
 * utils/constants.js
 * App-wide constants — auth paths, validation patterns.
 */

export const PUBLIC_AUTH_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/reset-password",
];

export const AUTH_PAGE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
];

export const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w+)+$/;

export const OTP_CODE_REGEX = /^\d{6}$/;

export const DEFAULT_DEBOUNCE_MS = 400;

export const DEFAULT_TABLE_LIMIT = 10;

export const TABLE_LIMIT_OPTIONS = [10, 25, 50];

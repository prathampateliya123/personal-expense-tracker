/**
 * services/authService.js
 * Auth API calls — slices delegate here instead of calling axios directly.
 */

import apiService from "./apiService";

export const authService = {
  register: (payload) => apiService.post("/auth/register", payload),

  login: (payload) => apiService.post("/auth/login", payload),

  verifyOtp: (payload) => apiService.post("/auth/verify-otp", payload),

  resendOtp: (payload) => apiService.post("/auth/resend-otp", payload),

  logout: () => apiService.post("/auth/logout"),

  getProfile: () => apiService.get("/auth/profile"),

  forgotPassword: (payload) => apiService.post("/auth/forgot-password", payload),

  resetPassword: (payload) => apiService.post("/auth/reset-password", payload),
};

export default authService;

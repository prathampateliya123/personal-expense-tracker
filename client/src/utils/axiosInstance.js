/**
 * utils/axiosInstance.js
 * Axios client — sends httpOnly JWT cookie with every request (withCredentials).
 */

import axios from "axios";

const axiosInstance = axios.create({
  // Use /api in dev (Vite proxy) or full URL from .env in production
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

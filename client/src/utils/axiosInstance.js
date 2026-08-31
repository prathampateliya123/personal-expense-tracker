/**
 * utils/axiosInstance.js
 * Pre-configured Axios instance for API requests.
 * Sends credentials (cookies) with every request for httpOnly JWT auth.
 */

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

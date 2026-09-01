/**
 * redux/authSlice.js
 * Auth with OTP verification for login, register, forgot password.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initializing: true,
  error: null,
  message: null,
  otpSession: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/register", userData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", credentials);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const verifyOtpCode = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp, purpose }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/verify-otp", {
        email,
        otp,
        purpose,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

export const resendOtpCode = createAsyncThunk(
  "auth/resendOtp",
  async ({ email, purpose }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/resend-otp", {
        email,
        purpose,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to resend OTP"
      );
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch {
    /* always clear client session */
  }
  return null;
});

export const checkAuthSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/auth/profile");
      return data.user;
    } catch {
      return rejectWithValue(null);
    }
  }
);

export const fetchProfile = checkAuthSession;

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/reset-password", {
        email,
        password,
      });
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOtpSession: (state) => {
      state.otpSession = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.initializing = false;
      state.otpSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSession = {
          email: action.payload.email,
          purpose: action.payload.purpose || "register",
          otp: action.payload.otp || null,
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSession = {
          email: action.payload.email,
          purpose: action.payload.purpose || "login",
          otp: action.payload.otp || null,
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(verifyOtpCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpCode.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.initializing = false;
        }
        state.otpSession = null;
      })
      .addCase(verifyOtpCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(resendOtpCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtpCode.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSession = {
          email: action.payload.email,
          purpose: action.payload.purpose,
          otp: action.payload.otp || null,
        };
      })
      .addCase(resendOtpCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.initializing = false;
        state.otpSession = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.initializing = false;
      });

    builder
      .addCase(checkAuthSession.pending, (state) => {
        state.initializing = true;
      })
      .addCase(checkAuthSession.fulfilled, (state, action) => {
        state.initializing = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthSession.rejected, (state) => {
        state.initializing = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSession = {
          email: action.payload.email,
          purpose: action.payload.purpose || "forgot-password",
          otp: action.payload.otp || null,
        };
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initializing = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearOtpSession, resetAuth } = authSlice.actions;
export default authSlice.reducer;

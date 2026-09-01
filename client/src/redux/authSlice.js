/**
 * redux/authSlice.js
 * Authentication state: login, register, logout, profile, forgot/reset password.
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
  devResetUrl: null,
  tokenValid: false,
  tokenChecking: false,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/register", userData);
      return data.user;
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
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout");
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/auth/profile");
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

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
        error.response?.data?.message || "Failed to send reset link"
      );
    }
  }
);

export const validateResetToken = createAsyncThunk(
  "auth/validateResetToken",
  async (token, { rejectWithValue }) => {
    try {
      await axiosInstance.get(`/auth/reset-password/${token}`);
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid or expired reset token"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/auth/reset-password/${token}`,
        { password }
      );
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
    clearAuthMessage: (state) => {
      state.message = null;
      state.devResetUrl = null;
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
        state.user = action.payload;
        state.isAuthenticated = true;
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
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
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
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchProfile.pending, (state) => {
        state.initializing = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.initializing = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.initializing = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.devResetUrl = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.devResetUrl = action.payload.devResetUrl || null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(validateResetToken.pending, (state) => {
        state.tokenChecking = true;
        state.tokenValid = false;
        state.error = null;
      })
      .addCase(validateResetToken.fulfilled, (state) => {
        state.tokenChecking = false;
        state.tokenValid = true;
      })
      .addCase(validateResetToken.rejected, (state) => {
        state.tokenChecking = false;
        state.tokenValid = false;
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
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAuthMessage } = authSlice.actions;
export default authSlice.reducer;

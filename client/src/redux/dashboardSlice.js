/**
 * redux/dashboardSlice.js
 * Manages dashboard analytics state and fetches all dashboard data in one thunk.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  summary: null,
  categoryBreakdown: [],
  monthlyTrend: [],
  loading: false,
  error: null,
};

/** Fetch summary, category breakdown, and monthly trend in parallel */
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const [summaryRes, breakdownRes, trendRes] = await Promise.all([
        axiosInstance.get("/dashboard/summary"),
        axiosInstance.get("/dashboard/category-breakdown"),
        axiosInstance.get("/dashboard/monthly-trend"),
      ]);

      return {
        summary: summaryRes.data.summary,
        categoryBreakdown: breakdownRes.data.breakdown,
        monthlyTrend: trendRes.data.trend,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.categoryBreakdown = action.payload.categoryBreakdown;
        state.monthlyTrend = action.payload.monthlyTrend;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

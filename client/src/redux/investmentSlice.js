/**
 * redux/investmentSlice.js
 * Manages investment portfolio state and async CRUD operations.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  investments: [],
  summary: {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalGainLoss: 0,
    overallGainLossPercent: 0,
    isProfit: true,
  },
  typeBreakdown: [],
  loading: false,
  error: null,
};

/** Fetch all investments with portfolio summary */
export const fetchInvestments = createAsyncThunk(
  "investments/fetchInvestments",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/investments");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch investments"
      );
    }
  }
);

/** Add a new investment */
export const addInvestment = createAsyncThunk(
  "investments/addInvestment",
  async (investmentData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/investments", investmentData);
      return data.investment;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add investment"
      );
    }
  }
);

/** Update an investment */
export const updateInvestment = createAsyncThunk(
  "investments/updateInvestment",
  async ({ id, investmentData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `/investments/${id}`,
        investmentData
      );
      return data.investment;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update investment"
      );
    }
  }
);

/** Delete an investment */
export const deleteInvestment = createAsyncThunk(
  "investments/deleteInvestment",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/investments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete investment"
      );
    }
  }
);

const investmentSlice = createSlice({
  name: "investments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.loading = false;
        state.investments = action.payload.investments ?? [];
        state.summary = action.payload.summary ?? state.summary;
        state.typeBreakdown = action.payload.typeBreakdown ?? [];
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(addInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInvestment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateInvestment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.investments.findIndex(
          (i) => i._id === action.payload._id
        );
        if (index !== -1) state.investments[index] = action.payload;
      });

    builder
      .addCase(deleteInvestment.fulfilled, (state, action) => {
        state.loading = false;
        state.investments = state.investments.filter(
          (i) => i._id !== action.payload
        );
      });
  },
});

export const { clearError } = investmentSlice.actions;
export default investmentSlice.reducer;

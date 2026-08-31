/**
 * redux/budgetSlice.js
 * Manages budget list state and async CRUD operations.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const now = new Date();

const initialState = {
  budgets: [],
  loading: false,
  error: null,
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
};

/** Fetch budgets for the selected month/year */
export const fetchBudgets = createAsyncThunk(
  "budgets/fetchBudgets",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { selectedMonth, selectedYear } = getState().budgets;
      const { data } = await axiosInstance.get(
        `/budgets?month=${selectedMonth}&year=${selectedYear}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch budgets"
      );
    }
  }
);

/** Create or update a budget for a category + month */
export const setBudget = createAsyncThunk(
  "budgets/setBudget",
  async (budgetData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/budgets", budgetData);
      return data.budget;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to set budget"
      );
    }
  }
);

/** Delete a budget */
export const deleteBudget = createAsyncThunk(
  "budgets/deleteBudget",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/budgets/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete budget"
      );
    }
  }
);

const budgetSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload.month;
      state.selectedYear = action.payload.year;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload.budgets;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(setBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setBudget.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = state.budgets.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedMonth, clearError } = budgetSlice.actions;
export default budgetSlice.reducer;

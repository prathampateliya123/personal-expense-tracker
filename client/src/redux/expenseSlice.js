/**
 * redux/expenseSlice.js
 * Manages expense list state, filters, and async CRUD operations.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  expenses: [],
  loading: false,
  error: null,
  filters: {
    category: "",
    paymentMode: "",
    startDate: "",
    endDate: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
};

/** Build query string from filters and pagination */
const buildQueryParams = (filters, pagination) => {
  const params = new URLSearchParams();

  if (filters.category) params.append("category", filters.category);
  if (filters.paymentMode) params.append("paymentMode", filters.paymentMode);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (pagination?.page) params.append("page", pagination.page);
  if (pagination?.limit) params.append("limit", pagination.limit);
  params.append("sort", "desc");

  return params.toString();
};

/** Fetch expenses with current filters */
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().expenses;
      const query = buildQueryParams(filters, pagination);
      const { data } = await axiosInstance.get(`/expenses?${query}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch expenses"
      );
    }
  }
);

/** Add a new expense */
export const addExpense = createAsyncThunk(
  "expenses/addExpense",
  async (expenseData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/expenses", expenseData);
      return data.expense;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add expense"
      );
    }
  }
);

/** Update an existing expense */
export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async ({ id, expenseData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/expenses/${id}`, expenseData);
      return data.expense;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update expense"
      );
    }
  }
);

/** Delete an expense */
export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/expenses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete expense"
      );
    }
  }
);

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch expenses
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.expenses ?? [];
        state.pagination = action.payload.pagination ?? state.pagination;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add expense
    builder
      .addCase(addExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update expense
    builder
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(
          (e) => e._id === action.payload._id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete expense
    builder
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = (state.expenses ?? []).filter((e) => e._id !== action.payload);
        if (state.pagination) {
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, setPage, clearError } =
  expenseSlice.actions;
export default expenseSlice.reducer;

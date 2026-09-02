/**
 * redux/slices/expenseSlice.js
 * Expense list, filters, CRUD actions, and monthly stats.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

const initialFilters = {
  category: "",
  paymentMode: "",
  startDate: "",
  endDate: "",
  search: "",
  page: 1,
  limit: 10,
  sortBy: "date",
};

const buildQueryParams = (filters) => {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.paymentMode) params.set("paymentMode", filters.paymentMode);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);

  return params.toString();
};

/**
 * Fetch paginated expenses using current or passed filters.
 */
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (filters, { getState, rejectWithValue }) => {
    try {
      const activeFilters = filters || getState().expenses.filters;
      const query = buildQueryParams(activeFilters);
      const { data } = await axiosInstance.get(`/expenses?${query}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch expenses"
      );
    }
  }
);

/**
 * Create a new expense.
 */
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

/**
 * Update an existing expense by id.
 */
export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async ({ id, data: expenseData }, { rejectWithValue }) => {
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

/**
 * Delete an expense by id.
 */
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

/**
 * Fetch a single expense by id (for edit page).
 */
export const fetchExpenseById = createAsyncThunk(
  "expenses/fetchExpenseById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/expenses/${id}`);
      return data.expense;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch expense"
      );
    }
  }
);

/**
 * Fetch current-month expense statistics.
 */
export const fetchExpenseStats = createAsyncThunk(
  "expenses/fetchExpenseStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/expenses/stats");
      return data.stats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch expense stats"
      );
    }
  }
);

const expenseSlice = createSlice({
  name: "expenses",
  initialState: {
    expenses: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    totalAmount: 0,
    stats: null,
    currentExpense: null,
    detailLoading: false,
    filters: initialFilters,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { ...initialFilters };
    },
    clearExpenseError: (state) => {
      state.error = null;
    },
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.expenses;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(addExpense.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateExpense.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchExpenseStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchExpenseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchExpenseStats.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(fetchExpenseById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
        state.currentExpense = null;
      })
      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentExpense = action.payload;
      })
      .addCase(fetchExpenseById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters, clearExpenseError, clearCurrentExpense } =
  expenseSlice.actions;
export default expenseSlice.reducer;

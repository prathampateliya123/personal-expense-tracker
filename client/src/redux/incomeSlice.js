/**
 * redux/incomeSlice.js
 * Manages income list state, filters, and async CRUD operations.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  incomes: [],
  loading: false,
  error: null,
  filters: {
    source: "",
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

  if (filters.source) params.append("source", filters.source);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (pagination?.page) params.append("page", pagination.page);
  if (pagination?.limit) params.append("limit", pagination.limit);
  params.append("sort", "desc");

  return params.toString();
};

/** Fetch incomes with current filters */
export const fetchIncomes = createAsyncThunk(
  "incomes/fetchIncomes",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().incomes;
      const query = buildQueryParams(filters, pagination);
      const { data } = await axiosInstance.get(`/incomes?${query}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch incomes"
      );
    }
  }
);

/** Add a new income entry */
export const addIncome = createAsyncThunk(
  "incomes/addIncome",
  async (incomeData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/incomes", incomeData);
      return data.income;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add income"
      );
    }
  }
);

/** Update an existing income entry */
export const updateIncome = createAsyncThunk(
  "incomes/updateIncome",
  async ({ id, incomeData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/incomes/${id}`, incomeData);
      return data.income;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update income"
      );
    }
  }
);

/** Delete an income entry */
export const deleteIncome = createAsyncThunk(
  "incomes/deleteIncome",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/incomes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete income"
      );
    }
  }
);

const incomeSlice = createSlice({
  name: "incomes",
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
    // Fetch incomes
    builder
      .addCase(fetchIncomes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncomes.fulfilled, (state, action) => {
        state.loading = false;
        state.incomes = action.payload.incomes ?? [];
        state.pagination = action.payload.pagination ?? state.pagination;
      })
      .addCase(fetchIncomes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add income
    builder
      .addCase(addIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addIncome.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update income
    builder
      .addCase(updateIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIncome.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.incomes.findIndex(
          (i) => i._id === action.payload._id
        );
        if (index !== -1) {
          state.incomes[index] = action.payload;
        }
      })
      .addCase(updateIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete income
    builder
      .addCase(deleteIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.incomes = state.incomes.filter((i) => i._id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, setPage, clearError } =
  incomeSlice.actions;
export default incomeSlice.reducer;

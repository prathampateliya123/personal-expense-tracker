/**
 * redux/slices/expenseSlice.js
 * Expense list, filters, CRUD — API calls via expenseService.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import expenseService, {
  INITIAL_EXPENSE_FILTERS,
} from "../../services/expenseService";
import { getApiErrorMessage } from "../../utils/helpers";

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (filters, { getState, rejectWithValue }) => {
    try {
      const activeFilters = filters || getState().expenses.filters;
      return await expenseService.list(activeFilters);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch expenses"));
    }
  }
);

export const addExpense = createAsyncThunk(
  "expenses/addExpense",
  async (expenseData, { rejectWithValue }) => {
    try {
      const data = await expenseService.create(expenseData);
      return data.expense;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to add expense"));
    }
  }
);

export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async ({ id, data: expenseData }, { rejectWithValue }) => {
    try {
      const data = await expenseService.update(id, expenseData);
      return data.expense;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update expense"));
    }
  }
);

export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (id, { rejectWithValue }) => {
    try {
      await expenseService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete expense"));
    }
  }
);

export const fetchExpenseById = createAsyncThunk(
  "expenses/fetchExpenseById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await expenseService.getById(id);
      return data.expense;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch expense"));
    }
  }
);

export const fetchExpenseStats = createAsyncThunk(
  "expenses/fetchExpenseStats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await expenseService.getStats();
      return data.stats;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch expense stats"));
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
    filters: { ...INITIAL_EXPENSE_FILTERS },
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { ...INITIAL_EXPENSE_FILTERS };
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

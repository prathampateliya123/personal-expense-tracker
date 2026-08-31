/**
 * redux/subscriptionSlice.js
 * Manages subscription list state, cost summary, and async CRUD operations.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  subscriptions: [],
  totalMonthlyCost: 0,
  totalYearlyCost: 0,
  loading: false,
  error: null,
};

/** Fetch all subscriptions with cost summary */
export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/subscriptions");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

/** Create a new subscription */
export const createSubscription = createAsyncThunk(
  "subscriptions/createSubscription",
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/subscriptions", subscriptionData);
      return data.subscription;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create subscription"
      );
    }
  }
);

/** Update a subscription (including pause/resume) */
export const updateSubscription = createAsyncThunk(
  "subscriptions/updateSubscription",
  async ({ id, subscriptionData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `/subscriptions/${id}`,
        subscriptionData
      );
      return data.subscription;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subscription"
      );
    }
  }
);

/** Cancel a subscription */
export const cancelSubscription = createAsyncThunk(
  "subscriptions/cancelSubscription",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/subscriptions/${id}/cancel`);
      return data.subscription;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    }
  }
);

/** Delete a subscription */
export const deleteSubscription = createAsyncThunk(
  "subscriptions/deleteSubscription",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/subscriptions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete subscription"
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload.subscriptions ?? [];
        state.totalMonthlyCost = action.payload.totalMonthlyCost ?? 0;
        state.totalYearlyCost = action.payload.totalYearlyCost ?? 0;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    const upsertSubscription = (state, action) => {
      state.loading = false;
      const index = state.subscriptions.findIndex(
        (s) => s._id === action.payload._id
      );
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
    };

    builder
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, upsertSubscription)
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, upsertSubscription)
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = state.subscriptions.filter(
          (s) => s._id !== action.payload
        );
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

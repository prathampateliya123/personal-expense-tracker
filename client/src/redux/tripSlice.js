/**
 * redux/tripSlice.js
 * Manages trip state and async CRUD + detail operations.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  trips: [],
  currentTrip: null,
  tripExpenses: [],
  tripSummary: null,
  categoryBreakdown: [],
  loading: false,
  detailsLoading: false,
  error: null,
};

/** Fetch all trips */
export const fetchTrips = createAsyncThunk(
  "trips/fetchTrips",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/trips");
      return data.trips;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trips"
      );
    }
  }
);

/** Create a new trip */
export const createTrip = createAsyncThunk(
  "trips/createTrip",
  async (tripData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/trips", tripData);
      return data.trip;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create trip"
      );
    }
  }
);

/** Fetch trip details with expenses and breakdown */
export const fetchTripDetails = createAsyncThunk(
  "trips/fetchTripDetails",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/trips/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trip details"
      );
    }
  }
);

/** Update a trip */
export const updateTrip = createAsyncThunk(
  "trips/updateTrip",
  async ({ id, tripData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/trips/${id}`, tripData);
      return data.trip;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update trip"
      );
    }
  }
);

/** Close (complete) a trip */
export const closeTrip = createAsyncThunk(
  "trips/closeTrip",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/trips/${id}/close`);
      return data.trip;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to close trip"
      );
    }
  }
);

/** Delete a trip */
export const deleteTrip = createAsyncThunk(
  "trips/deleteTrip",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/trips/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete trip"
      );
    }
  }
);

const tripSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTripDetails: (state) => {
      state.currentTrip = null;
      state.tripExpenses = [];
      state.tripSummary = null;
      state.categoryBreakdown = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips.unshift(action.payload);
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchTripDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchTripDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentTrip = action.payload.trip;
        state.tripExpenses = action.payload.expenses;
        state.tripSummary = action.payload.summary;
        state.categoryBreakdown = action.payload.categoryBreakdown;
      })
      .addCase(fetchTripDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      });

    const upsertTrip = (state, action) => {
      state.loading = false;
      const index = state.trips.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.trips[index] = action.payload;
      }
      if (state.currentTrip?._id === action.payload._id) {
        state.currentTrip = action.payload;
      }
    };

    builder
      .addCase(updateTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrip.fulfilled, upsertTrip)
      .addCase(updateTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(closeTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeTrip.fulfilled, upsertTrip)
      .addCase(closeTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = state.trips.filter((t) => t._id !== action.payload);
        if (state.currentTrip?._id === action.payload) {
          state.currentTrip = null;
          state.tripExpenses = [];
          state.tripSummary = null;
          state.categoryBreakdown = [];
        }
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearTripDetails } = tripSlice.actions;
export default tripSlice.reducer;

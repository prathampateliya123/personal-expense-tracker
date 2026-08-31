/**
 * redux/goalSlice.js
 * Manages savings goal state and async CRUD + contribution operations.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  goals: [],
  loading: false,
  error: null,
};

/** Fetch all goals */
export const fetchGoals = createAsyncThunk(
  "goals/fetchGoals",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/goals");
      return data.goals;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch goals"
      );
    }
  }
);

/** Create a new goal */
export const createGoal = createAsyncThunk(
  "goals/createGoal",
  async (goalData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/goals", goalData);
      return data.goal;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create goal"
      );
    }
  }
);

/** Add a contribution to a goal */
export const addContribution = createAsyncThunk(
  "goals/addContribution",
  async ({ id, amount }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/goals/${id}/contribute`, {
        amount,
      });
      return data.goal;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add contribution"
      );
    }
  }
);

/** Update a goal */
export const updateGoal = createAsyncThunk(
  "goals/updateGoal",
  async ({ id, goalData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/goals/${id}`, goalData);
      return data.goal;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update goal"
      );
    }
  }
);

/** Mark a goal as completed */
export const markGoalComplete = createAsyncThunk(
  "goals/markGoalComplete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/goals/${id}/complete`);
      return data.goal;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete goal"
      );
    }
  }
);

/** Delete a goal */
export const deleteGoal = createAsyncThunk(
  "goals/deleteGoal",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/goals/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete goal"
      );
    }
  }
);

const goalSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    const upsertGoal = (state, action) => {
      state.loading = false;
      const index = state.goals.findIndex((g) => g._id === action.payload._id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    };

    builder
      .addCase(addContribution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addContribution.fulfilled, upsertGoal)
      .addCase(addContribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, upsertGoal)
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(markGoalComplete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markGoalComplete.fulfilled, upsertGoal)
      .addCase(markGoalComplete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.filter((g) => g._id !== action.payload);
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = goalSlice.actions;
export default goalSlice.reducer;

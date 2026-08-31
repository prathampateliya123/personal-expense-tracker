/**
 * redux/walletSlice.js
 * Manages wallet list state and async CRUD + transfer operations.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  wallets: [],
  loading: false,
  error: null,
};

/** Fetch all wallets with computed balances */
export const fetchWallets = createAsyncThunk(
  "wallets/fetchWallets",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/wallets");
      return data.wallets;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wallets"
      );
    }
  }
);

/** Create a new wallet */
export const createWallet = createAsyncThunk(
  "wallets/createWallet",
  async (walletData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/wallets", walletData);
      return data.wallet;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create wallet"
      );
    }
  }
);

/** Update a wallet */
export const updateWallet = createAsyncThunk(
  "wallets/updateWallet",
  async ({ id, walletData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/wallets/${id}`, walletData);
      return data.wallet;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update wallet"
      );
    }
  }
);

/** Delete a wallet */
export const deleteWallet = createAsyncThunk(
  "wallets/deleteWallet",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/wallets/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete wallet"
      );
    }
  }
);

/** Transfer funds between wallets */
export const transferBetweenWallets = createAsyncThunk(
  "wallets/transferBetweenWallets",
  async (transferData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/wallets/transfer", transferData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to transfer funds"
      );
    }
  }
);

const walletSlice = createSlice({
  name: "wallets",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets = action.payload ?? [];
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWallet.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateWallet.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.wallets.findIndex(
          (w) => w._id === action.payload._id
        );
        if (index !== -1) state.wallets[index] = action.payload;
      });

    builder
      .addCase(deleteWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets = state.wallets.filter((w) => w._id !== action.payload);
      });

    builder
      .addCase(transferBetweenWallets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transferBetweenWallets.fulfilled, (state, action) => {
        state.loading = false;
        const { fromWallet, toWallet } = action.payload;
        state.wallets = state.wallets.map((w) => {
          if (w._id === fromWallet._id) return fromWallet;
          if (w._id === toWallet._id) return toWallet;
          return w;
        });
      })
      .addCase(transferBetweenWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = walletSlice.actions;
export default walletSlice.reducer;

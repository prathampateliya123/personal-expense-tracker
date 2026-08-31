/**
 * models/Wallet.js
 * Mongoose schema for multi-wallet accounts (cash, UPI, bank, card).
 * `balance` stores the opening/initial balance; current balance is computed on read.
 */

import mongoose from "mongoose";

export const WALLET_TYPES = ["cash", "upi", "bank", "card"];

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    walletName: {
      type: String,
      required: [true, "Wallet name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Wallet type is required"],
      enum: WALLET_TYPES,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Initial balance cannot be negative"],
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;

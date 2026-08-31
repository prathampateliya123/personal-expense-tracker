/**
 * models/WalletTransfer.js
 * Records wallet-to-wallet transfers as linked transactions.
 */

import mongoose from "mongoose";

const walletTransferSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fromWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    toWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Transfer amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

const WalletTransfer = mongoose.model("WalletTransfer", walletTransferSchema);

export default WalletTransfer;

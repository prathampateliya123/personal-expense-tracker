/**
 * models/Income.js
 * Mongoose schema for Income documents.
 * Each income entry belongs to a user and tracks earnings by source.
 */

import mongoose from "mongoose";

export const INCOME_SOURCES = ["salary", "freelance", "business", "other"];

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      enum: INCOME_SOURCES,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    description: {
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

const Income = mongoose.model("Income", incomeSchema);

export default Income;

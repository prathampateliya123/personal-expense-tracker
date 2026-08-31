/**
 * models/Investment.js
 * Mongoose schema for tracking investments and savings instruments.
 */

import mongoose from "mongoose";

export const INVESTMENT_TYPES = [
  "SIP",
  "mutual_fund",
  "FD",
  "RD",
  "stocks",
  "other",
];

export const INVESTMENT_FREQUENCIES = ["one-time", "monthly"];

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, "Investment type is required"],
      enum: INVESTMENT_TYPES,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    investedAmount: {
      type: Number,
      required: [true, "Invested amount is required"],
      min: [0, "Invested amount must be positive"],
    },
    currentValue: {
      type: Number,
      required: [true, "Current value is required"],
      min: [0, "Current value must be positive"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    maturityDate: {
      type: Date,
      default: null,
    },
    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      enum: INVESTMENT_FREQUENCIES,
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

const Investment = mongoose.model("Investment", investmentSchema);

export default Investment;

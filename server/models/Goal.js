/**
 * models/Goal.js
 * Mongoose schema for savings goals.
 * Tracks progress toward a target amount by a target date.
 */

import mongoose from "mongoose";
import { EXPENSE_CATEGORIES } from "./Expense.js";

export const GOAL_STATUSES = ["active", "completed", "paused"];

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    goalName: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [1, "Target amount must be greater than zero"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
    },
    targetDate: {
      type: Date,
      required: [true, "Target date is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: EXPENSE_CATEGORIES,
    },
    status: {
      type: String,
      enum: GOAL_STATUSES,
      default: "active",
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;

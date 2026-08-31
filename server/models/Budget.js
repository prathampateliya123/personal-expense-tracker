/**
 * models/Budget.js
 * Mongoose schema for category-based spending budgets.
 * Used by the daily cron job to detect budgets nearing their limit.
 */

import mongoose from "mongoose";
import { EXPENSE_CATEGORIES } from "./Expense.js";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: EXPENSE_CATEGORIES,
    },
    limitAmount: {
      type: Number,
      required: [true, "Budget limit is required"],
      min: [1, "Budget limit must be greater than zero"],
    },
  },
  {
    timestamps: true,
  }
);

// One budget per category per user
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;

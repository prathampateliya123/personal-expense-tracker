/**
 * models/Budget.js
 * Mongoose schema for monthly category-based spending budgets.
 * currentSpent is computed on read by aggregating Expense documents.
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
    monthlyLimit: {
      type: Number,
      required: [true, "Monthly limit is required"],
      min: [1, "Monthly limit must be greater than zero"],
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: 2000,
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

// One budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;

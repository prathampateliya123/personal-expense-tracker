/**
 * models/Expense.js
 * Mongoose schema for Expense documents.
 * Each expense belongs to a user and tracks spending details.
 */

import mongoose from "mongoose";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Bills",
  "Health",
  "Education",
  "Other",
];

export const PAYMENT_MODES = ["cash", "upi", "card", "bank"];

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: EXPENSE_CATEGORIES,
    },
    paymentMode: {
      type: String,
      required: [true, "Payment mode is required"],
      enum: PAYMENT_MODES,
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
    receiptUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;

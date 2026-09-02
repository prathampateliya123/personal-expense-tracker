/**
 * models/Expense.js
 * Mongoose schema for user expense documents.
 */

import mongoose from "mongoose";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Rent",
  "Other",
];

export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Bank Transfer"];

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
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
      min: [0.01, "Amount must be greater than zero"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: EXPENSE_CATEGORIES,
    },
    paymentMode: {
      type: String,
      enum: PAYMENT_MODES,
      default: "Cash",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    receiptUrl: {
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

expenseSchema.index({ userId: 1, date: -1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;

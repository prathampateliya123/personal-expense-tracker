/**
 * models/Subscription.js
 * Mongoose schema for recurring subscription billing.
 * Supports auto-expense creation and billing reminders via cron.
 */

import mongoose from "mongoose";
import { EXPENSE_CATEGORIES } from "./Expense.js";

export const BILLING_CYCLES = ["monthly", "quarterly", "yearly"];
export const SUBSCRIPTION_STATUSES = ["active", "paused", "cancelled"];

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    billingCycle: {
      type: String,
      required: [true, "Billing cycle is required"],
      enum: BILLING_CYCLES,
    },
    nextBillingDate: {
      type: Date,
      required: [true, "Next billing date is required"],
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: EXPENSE_CATEGORIES,
    },
    reminderDaysBefore: {
      type: Number,
      default: 3,
      min: [1, "Reminder days must be at least 1"],
    },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      default: "active",
    },
    autoAddExpense: {
      type: Boolean,
      default: false,
    },
    /** Tracks which billing cycle a reminder was sent for (prevents duplicates) */
    reminderSentForDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;

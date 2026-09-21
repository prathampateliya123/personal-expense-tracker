import mongoose from "mongoose";

export const BILLING_CYCLES = ["monthly", "quarterly", "yearly"];
export const SUBSCRIPTION_STATUSES = ["active", "paused", "cancelled"];

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      maxlength: [80, "Service name cannot exceed 80 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },
    billingCycle: {
      type: String,
      enum: BILLING_CYCLES,
      default: "monthly",
    },
    nextBillingDate: {
      type: Date,
      required: [true, "Next billing date is required"],
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    paymentMode: {
      type: String,
      required: [true, "Payment method is required"],
      trim: true,
    },
    reminderDaysBefore: {
      type: Number,
      default: 3,
      min: [0, "Reminder days cannot be negative"],
      max: [30, "Reminder days cannot exceed 30"],
    },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      default: "active",
      index: true,
    },
    autoAddExpense: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Notes cannot exceed 300 characters"],
    },
    lastBilledAt: {
      type: Date,
      default: null,
    },
    lastExpenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      default: null,
    },
    lastReminderAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ userId: 1, status: 1, nextBillingDate: 1 });
subscriptionSchema.index({ status: 1, nextBillingDate: 1 });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;

import mongoose from "mongoose";
import { TRIP_EXPENSE_CATEGORIES } from "./Trip.js";

const tripExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },
    category: {
      type: String,
      enum: TRIP_EXPENSE_CATEGORIES,
      default: "Other",
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Who paid is required"],
    },
    splitAmong: {
      type: [mongoose.Schema.Types.ObjectId],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: "Split among at least one member",
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Notes cannot exceed 300 characters"],
    },
  },
  { timestamps: true }
);

tripExpenseSchema.index({ tripId: 1, date: -1 });
tripExpenseSchema.index({ userId: 1, tripId: 1 });

const TripExpense = mongoose.model("TripExpense", tripExpenseSchema);

export default TripExpense;

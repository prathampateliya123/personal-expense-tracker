/**
 * models/Trip.js
 * Mongoose schema for Trip documents.
 * Tracks travel budgets and links to trip-specific expenses.
 */

import mongoose from "mongoose";

export const TRIP_STATUSES = ["ongoing", "completed"];

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tripName: {
      type: String,
      required: [true, "Trip name is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget must be positive"],
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
    },
    status: {
      type: String,
      enum: TRIP_STATUSES,
      default: "ongoing",
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;

import mongoose from "mongoose";

export const TRIP_STATUSES = ["planning", "active", "settled", "archived"];

export const TRIP_EXPENSE_CATEGORIES = [
  "Food",
  "Hotel",
  "Transport",
  "Other",
];

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Member name is required"],
      trim: true,
      maxlength: [60, "Member name cannot exceed 60 characters"],
    },
    isSelf: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const settlementSchema = new mongoose.Schema(
  {
    fromMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Settlement amount must be greater than zero"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Notes cannot exceed 200 characters"],
    },
    settledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Trip title is required"],
      trim: true,
      maxlength: [80, "Title cannot exceed 80 characters"],
    },
    destination: {
      type: String,
      trim: true,
      default: "",
      maxlength: [80, "Destination cannot exceed 80 characters"],
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    status: {
      type: String,
      enum: TRIP_STATUSES,
      default: "active",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [400, "Notes cannot exceed 400 characters"],
    },
    members: {
      type: [memberSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: "Add at least one member",
      },
    },
    settlements: {
      type: [settlementSchema],
      default: [],
    },
  },
  { timestamps: true }
);

tripSchema.index({ userId: 1, createdAt: -1 });
tripSchema.index({ userId: 1, status: 1 });

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;

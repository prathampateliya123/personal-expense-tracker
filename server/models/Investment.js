import mongoose from "mongoose";

export const INVESTMENT_TYPES = [
  "mutual_fund",
  "stocks",
  "fd",
  "rd",
  "ppf",
  "nps",
  "gold",
  "crypto",
  "bonds",
  "other",
];

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Investment name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    type: {
      type: String,
      enum: INVESTMENT_TYPES,
      required: [true, "Investment type is required"],
      default: "other",
    },
    amountInvested: {
      type: Number,
      required: [true, "Invested amount is required"],
      min: [0.01, "Invested amount must be greater than zero"],
    },
    currentValue: {
      type: Number,
      required: [true, "Current value is required"],
      min: [0, "Current value cannot be negative"],
    },
    purchaseDate: {
      type: Date,
      required: [true, "Purchase date is required"],
      default: Date.now,
    },
    institution: {
      type: String,
      trim: true,
      default: "",
      maxlength: [80, "Institution cannot exceed 80 characters"],
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

investmentSchema.index({ userId: 1, purchaseDate: -1 });
investmentSchema.index({ userId: 1, type: 1 });

const Investment = mongoose.model("Investment", investmentSchema);

export default Investment;

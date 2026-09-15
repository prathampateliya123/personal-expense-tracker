import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Allocation amount is required"],
      min: [0, "Allocation cannot be negative"],
    },
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [2000, "Invalid year"],
      max: [2100, "Invalid year"],
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: [1, "Month must be 1–12"],
      max: [12, "Month must be 1–12"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total budget is required"],
      min: [0.01, "Budget must be greater than zero"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Notes cannot exceed 300 characters"],
    },
    allocations: {
      type: [allocationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index(
  { userId: 1, year: 1, month: 1 },
  { unique: true, name: "userId_year_month_unique" }
);

const Budget = mongoose.model("Budget", budgetSchema);

export const ensureBudgetIndexes = async () => {
  try {
    await Budget.syncIndexes();
  } catch (error) {
    console.warn("Budget index sync skipped:", error.message);
  }
};

export default Budget;

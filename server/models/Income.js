import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
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
      trim: true,
    },
    paymentMode: {
      type: String,
      required: [true, "Payment method is required"],
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

incomeSchema.index({ userId: 1, date: -1 });

const Income = mongoose.model("Income", incomeSchema);

export default Income;

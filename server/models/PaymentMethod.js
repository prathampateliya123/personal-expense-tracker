/**
 * models/PaymentMethod.js
 * Per-user payment methods (Cash, UPI, Card, etc.) — fully dynamic.
 */

import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Payment method name is required"],
      trim: true,
      maxlength: [40, "Payment method name cannot exceed 40 characters"],
    },
    nameKey: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

paymentMethodSchema.pre("validate", function setNameKey(next) {
  if (this.name) {
    this.nameKey = String(this.name).trim().toLowerCase();
  }
  next();
});

paymentMethodSchema.index(
  { userId: 1, nameKey: 1 },
  {
    unique: true,
    name: "userId_paymentNameKey_unique",
    partialFilterExpression: { nameKey: { $gt: "" } },
  }
);

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

export const ensurePaymentMethodIndexes = async () => {
  try {
    await PaymentMethod.syncIndexes();
  } catch (error) {
    console.warn("PaymentMethod index sync skipped:", error.message);
  }
};

export default PaymentMethod;

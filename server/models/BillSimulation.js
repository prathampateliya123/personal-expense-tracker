import mongoose from "mongoose";

export const BILL_TYPES = [
  "electricity",
  "rent",
  "credit_card_emi",
  "loan_emi",
  "insurance",
  "internet_mobile",
];

export const BILL_FREQUENCIES = ["monthly", "quarterly", "yearly"];

export const isEmiBillType = (type) =>
  type === "loan_emi" || type === "credit_card_emi";

const billSimulationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [80, "Title cannot exceed 80 characters"],
    },
    billType: {
      type: String,
      enum: BILL_TYPES,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Notes cannot exceed 300 characters"],
    },
    // EMI inputs
    loanAmount: { type: Number, default: null },
    interestRate: { type: Number, default: null },
    tenureMonths: { type: Number, default: null },
    paidEmis: { type: Number, default: 0 },
    // Flat bill inputs
    billAmount: { type: Number, default: null },
    frequency: {
      type: String,
      enum: BILL_FREQUENCIES,
      default: "monthly",
    },
    // Reminder
    reminderEnabled: { type: Boolean, default: false },
    nextDueDate: { type: Date, default: null },
    reminderDaysBefore: {
      type: Number,
      default: 3,
      min: [0, "Reminder days cannot be negative"],
      max: [30, "Reminder days cannot exceed 30"],
    },
    lastReminderAt: { type: Date, default: null },
    // Computed snapshot
    monthlyEmi: { type: Number, default: null },
    totalInterest: { type: Number, default: null },
    totalPayment: { type: Number, default: null },
    outstandingPrincipal: { type: Number, default: null },
    remainingEmis: { type: Number, default: null },
    remainingInterest: { type: Number, default: null },
    remainingPayment: { type: Number, default: null },
    paidAmount: { type: Number, default: null },
    monthlyEquivalent: { type: Number, default: null },
    yearlyCost: { type: Number, default: null },
  },
  { timestamps: true }
);

billSimulationSchema.index({ userId: 1, createdAt: -1 });
billSimulationSchema.index({ userId: 1, billType: 1 });

const BillSimulation = mongoose.model("BillSimulation", billSimulationSchema);

export default BillSimulation;

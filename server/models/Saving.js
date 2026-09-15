import mongoose from "mongoose";

export const SAVING_STATUSES = ["active", "completed", "paused"];

const savingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
      maxlength: [60, "Goal name cannot exceed 60 characters"],
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [0.01, "Target must be greater than zero"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Saved amount cannot be negative"],
    },
    deadline: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Notes cannot exceed 300 characters"],
    },
    status: {
      type: String,
      enum: SAVING_STATUSES,
      default: "active",
    },
  },
  { timestamps: true }
);

savingSchema.index({ userId: 1, createdAt: -1 });
savingSchema.index({ userId: 1, status: 1 });

const Saving = mongoose.model("Saving", savingSchema);

export default Saving;

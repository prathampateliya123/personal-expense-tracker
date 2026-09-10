/**
 * models/Category.js
 * Per-user expense categories (fully dynamic — no seeded defaults).
 * nameKey used for case-insensitive uniqueness per user.
 */

import mongoose from "mongoose";

export const CATEGORY_COLOR_KEYS = [
  "amber",
  "sky",
  "violet",
  "rose",
  "pink",
  "emerald",
  "indigo",
  "orange",
  "slate",
  "blue",
  "teal",
  "lime",
];

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [40, "Category name cannot exceed 40 characters"],
    },
    /** Lowercase key for case-insensitive unique check (Food === food) */
    nameKey: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    color: {
      type: String,
      enum: CATEGORY_COLOR_KEYS,
      default: "slate",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre("validate", function setNameKey(next) {
  if (this.name) {
    this.nameKey = String(this.name).trim().toLowerCase();
  }
  next();
});

// Case-insensitive uniqueness (only when nameKey is present)
categorySchema.index(
  { userId: 1, nameKey: 1 },
  {
    unique: true,
    partialFilterExpression: { nameKey: { $type: "string", $gt: "" } },
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;

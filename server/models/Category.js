/**
 * models/Category.js
 * Per-user expense categories (seeded with defaults on first use).
 */

import mongoose from "mongoose";

export const DEFAULT_CATEGORIES = [
  { name: "Food", color: "amber", sortOrder: 1 },
  { name: "Travel", color: "sky", sortOrder: 2 },
  { name: "Shopping", color: "violet", sortOrder: 3 },
  { name: "Bills", color: "rose", sortOrder: 4 },
  { name: "Entertainment", color: "pink", sortOrder: 5 },
  { name: "Health", color: "emerald", sortOrder: 6 },
  { name: "Education", color: "indigo", sortOrder: 7 },
  { name: "Rent", color: "orange", sortOrder: 8 },
  { name: "Other", color: "slate", sortOrder: 9 },
];

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
    color: {
      type: String,
      enum: CATEGORY_COLOR_KEYS,
      default: "slate",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;

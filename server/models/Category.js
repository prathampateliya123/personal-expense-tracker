/**
 * models/Category.js
 * Per-user expense categories (fully dynamic — no seeded defaults).
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

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;

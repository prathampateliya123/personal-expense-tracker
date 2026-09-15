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

export const CATEGORY_TYPES = ["expense", "income"];

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
    
    nameKey: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    type: {
      type: String,
      enum: CATEGORY_TYPES,
      default: "expense",
      index: true,
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

categorySchema.pre("validate", function setNameKey() {
  if (this.name) {
    this.nameKey = String(this.name).trim().toLowerCase();
  }
  if (!this.type) {
    this.type = "expense";
  }
});


categorySchema.index(
  { userId: 1, nameKey: 1, type: 1 },
  {
    unique: true,
    name: "userId_nameKey_type_unique",
    partialFilterExpression: { nameKey: { $gt: "" } },
  }
);

const Category = mongoose.model("Category", categorySchema);


export const ensureCategoryIndexes = async () => {
  try {
    const collection = Category.collection;
    const indexes = await collection.indexes();
    const keep = new Set(["_id_", "userId_nameKey_type_unique"]);
    const dropNames = indexes
      .map((idx) => idx.name)
      .filter(
        (name) =>
          name &&
          !keep.has(name) &&
          (name.includes("nameKey") || name === "userId_1_name_1")
      );

    for (const name of dropNames) {
      await collection.dropIndex(name).catch(() => {});
    }

    
    await Category.updateMany(
      { type: { $exists: false } },
      { $set: { type: "expense" } }
    );

    await Category.syncIndexes();
  } catch (error) {
    console.warn("Category index sync skipped:", error.message);
  }
};

export default Category;

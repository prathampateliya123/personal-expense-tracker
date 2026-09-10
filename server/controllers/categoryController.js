/**
 * controllers/categoryController.js
 * CRUD for logged-in user's expense categories.
 */

import Category, {
  CATEGORY_COLOR_KEYS,
  DEFAULT_CATEGORIES,
} from "../models/Category.js";
import Expense from "../models/Expense.js";

const normalizeName = (name = "") => String(name).trim().replace(/\s+/g, " ");

/**
 * Seed default categories once per user (idempotent).
 */
export const ensureDefaultCategories = async (userId) => {
  const count = await Category.countDocuments({ userId });
  if (count > 0) return;

  await Category.insertMany(
    DEFAULT_CATEGORIES.map((item) => ({
      ...item,
      userId,
      isDefault: true,
    }))
  );
};

const findOwnedCategory = async (categoryId, userId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    return { category: null, status: 404, message: "Category not found" };
  }

  if (category.userId.toString() !== userId.toString()) {
    return {
      category: null,
      status: 403,
      message: "Not authorized to access this category",
    };
  }

  return { category, status: null, message: null };
};

const withExpenseCounts = async (userId, categories) => {
  const counts = await Expense.aggregate([
    { $match: { userId } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(
    counts.map((row) => [row._id, row.count])
  );

  return categories.map((cat) => {
    const plain = cat.toObject ? cat.toObject() : cat;
    return {
      ...plain,
      expenseCount: countMap[plain.name] || 0,
    };
  });
};

/**
 * @route   GET /api/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    await ensureDefaultCategories(req.user._id);

    const categories = await Category.find({ userId: req.user._id }).sort({
      sortOrder: 1,
      name: 1,
    });

    const withCounts = await withExpenseCounts(req.user._id, categories);

    res.status(200).json({
      success: true,
      categories: withCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/categories
 */
export const createCategory = async (req, res, next) => {
  try {
    await ensureDefaultCategories(req.user._id);

    const name = normalizeName(req.body.name);
    const color = req.body.color || "slate";

    if (!name) {
      res.status(400);
      throw new Error("Category name is required");
    }

    if (name.length > 40) {
      res.status(400);
      throw new Error("Category name cannot exceed 40 characters");
    }

    if (!CATEGORY_COLOR_KEYS.includes(color)) {
      res.status(400);
      throw new Error("Invalid category color");
    }

    const existing = await Category.findOne({
      userId: req.user._id,
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });

    if (existing) {
      res.status(400);
      throw new Error("A category with this name already exists");
    }

    const maxSort = await Category.findOne({ userId: req.user._id })
      .sort({ sortOrder: -1 })
      .select("sortOrder");

    const category = await Category.create({
      userId: req.user._id,
      name,
      color,
      sortOrder: (maxSort?.sortOrder || 0) + 1,
      isDefault: false,
    });

    res.status(201).json({
      success: true,
      category: { ...category.toObject(), expenseCount: 0 },
    });
  } catch (error) {
    if (error?.code === 11000) {
      res.status(400);
      return next(new Error("A category with this name already exists"));
    }
    next(error);
  }
};

/**
 * @route   PUT /api/categories/:id
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { category, status, message } = await findOwnedCategory(
      req.params.id,
      req.user._id
    );

    if (!category) {
      res.status(status);
      throw new Error(message);
    }

    const nextName =
      req.body.name !== undefined ? normalizeName(req.body.name) : category.name;
    const nextColor =
      req.body.color !== undefined ? req.body.color : category.color;

    if (!nextName) {
      res.status(400);
      throw new Error("Category name is required");
    }

    if (nextName.length > 40) {
      res.status(400);
      throw new Error("Category name cannot exceed 40 characters");
    }

    if (!CATEGORY_COLOR_KEYS.includes(nextColor)) {
      res.status(400);
      throw new Error("Invalid category color");
    }

    const duplicate = await Category.findOne({
      userId: req.user._id,
      _id: { $ne: category._id },
      name: {
        $regex: `^${nextName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (duplicate) {
      res.status(400);
      throw new Error("A category with this name already exists");
    }

    const previousName = category.name;
    category.name = nextName;
    category.color = nextColor;
    await category.save();

    if (previousName !== nextName) {
      await Expense.updateMany(
        { userId: req.user._id, category: previousName },
        { $set: { category: nextName } }
      );
    }

    const expenseCount = await Expense.countDocuments({
      userId: req.user._id,
      category: category.name,
    });

    res.status(200).json({
      success: true,
      category: { ...category.toObject(), expenseCount },
    });
  } catch (error) {
    if (error?.code === 11000) {
      res.status(400);
      return next(new Error("A category with this name already exists"));
    }
    next(error);
  }
};

/**
 * @route   DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { category, status, message } = await findOwnedCategory(
      req.params.id,
      req.user._id
    );

    if (!category) {
      res.status(status);
      throw new Error(message);
    }

    const expenseCount = await Expense.countDocuments({
      userId: req.user._id,
      category: category.name,
    });

    if (expenseCount > 0) {
      res.status(400);
      throw new Error(
        `Cannot delete "${category.name}" — ${expenseCount} expense${
          expenseCount === 1 ? "" : "s"
        } still use it. Reassign those expenses first.`
      );
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

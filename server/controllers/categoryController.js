/**
 * controllers/categoryController.js
 * CRUD for logged-in user's expense categories — search + pagination.
 */

import Category, { CATEGORY_COLOR_KEYS } from "../models/Category.js";
import Expense from "../models/Expense.js";

const normalizeName = (name = "") => String(name).trim().replace(/\s+/g, " ");

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toNameKey = (name = "") => normalizeName(name).toLowerCase();

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

const findDuplicateCategory = async (userId, name, excludeId = null) => {
  const nameKey = toNameKey(name);
  if (!nameKey) return null;

  const filter = {
    userId,
    $or: [
      { nameKey },
      { name: { $regex: `^${escapeRegex(normalizeName(name))}$`, $options: "i" } },
    ],
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return Category.findOne(filter);
};

const withExpenseCounts = async (userId, categories) => {
  const names = categories.map((cat) =>
    cat.toObject ? cat.toObject().name : cat.name
  );

  if (names.length === 0) return [];

  const counts = await Expense.aggregate([
    { $match: { userId, category: { $in: names } } },
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

const buildCategoryFilter = (userId, query = {}) => {
  const filter = { userId };

  if (query.search?.trim()) {
    filter.name = {
      $regex: escapeRegex(query.search.trim()),
      $options: "i",
    };
  }

  if (query.color && CATEGORY_COLOR_KEYS.includes(query.color)) {
    filter.color = query.color;
  }

  return filter;
};

/**
 * @route   GET /api/categories
 * @desc    Paginated category list with search / color filter
 */
export const getCategories = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const filter = buildCategoryFilter(req.user._id, req.query);

    const [categories, totalCount] = await Promise.all([
      Category.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Category.countDocuments(filter),
    ]);

    const withCounts = await withExpenseCounts(req.user._id, categories);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    res.status(200).json({
      success: true,
      categories: withCounts,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/categories/options
 * @desc    Lightweight list for expense form/filter dropdowns
 */
export const getCategoryOptions = async (req, res, next) => {
  try {
    const categories = await Category.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("name color")
      .lean();

    res.status(200).json({
      success: true,
      categories,
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

    const existing = await findDuplicateCategory(req.user._id, name);
    if (existing) {
      res.status(400);
      throw new Error("A category with this name already exists");
    }

    const category = await Category.create({
      userId: req.user._id,
      name,
      nameKey: toNameKey(name),
      color,
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

    const duplicate = await findDuplicateCategory(
      req.user._id,
      nextName,
      category._id
    );

    if (duplicate) {
      res.status(400);
      throw new Error("A category with this name already exists");
    }

    const previousName = category.name;
    category.name = nextName;
    category.nameKey = toNameKey(nextName);
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

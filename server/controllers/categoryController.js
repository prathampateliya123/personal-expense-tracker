import Category, {
  CATEGORY_COLOR_KEYS,
  CATEGORY_TYPES,
} from "../models/Category.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import Budget from "../models/Budget.js";

const normalizeName = (name = "") => String(name).trim().replace(/\s+/g, " ");

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toNameKey = (name = "") => normalizeName(name).toLowerCase();

const normalizeType = (type) =>
  CATEGORY_TYPES.includes(type) ? type : "expense";

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

const findDuplicateCategory = async (
  userId,
  name,
  type,
  excludeId = null
) => {
  const nameKey = toNameKey(name);
  if (!nameKey) return null;

  const filter = {
    userId,
    type: normalizeType(type),
    $or: [
      { nameKey },
      {
        name: {
          $regex: `^${escapeRegex(normalizeName(name))}$`,
          $options: "i",
        },
      },
    ],
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return Category.findOne(filter);
};

const countUsage = async (userId, category) => {
  const Model = category.type === "income" ? Income : Expense;
  return Model.countDocuments({
    userId,
    category: category.name,
  });
};

const withUsageCounts = async (userId, categories) => {
  if (categories.length === 0) return [];

  const expenseNames = [];
  const incomeNames = [];

  for (const cat of categories) {
    const plain = cat.toObject ? cat.toObject() : cat;
    if (plain.type === "income") incomeNames.push(plain.name);
    else expenseNames.push(plain.name);
  }

  const [expenseCounts, incomeCounts] = await Promise.all([
    expenseNames.length
      ? Expense.aggregate([
          { $match: { userId, category: { $in: expenseNames } } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ])
      : [],
    incomeNames.length
      ? Income.aggregate([
          { $match: { userId, category: { $in: incomeNames } } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ])
      : [],
  ]);

  const expenseMap = Object.fromEntries(
    expenseCounts.map((row) => [row._id, row.count])
  );
  const incomeMap = Object.fromEntries(
    incomeCounts.map((row) => [row._id, row.count])
  );

  return categories.map((cat) => {
    const plain = cat.toObject ? cat.toObject() : cat;
    const usageCount =
      plain.type === "income"
        ? incomeMap[plain.name] || 0
        : expenseMap[plain.name] || 0;
    return {
      ...plain,
      usageCount,
      expenseCount: usageCount,
    };
  });
};

const buildCategoryFilter = (userId, query = {}) => {
  const filter = { userId };

  if (query.type && CATEGORY_TYPES.includes(query.type)) {
    filter.type = query.type;
  }

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

    const withCounts = await withUsageCounts(req.user._id, categories);
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



export const getCategoryOptions = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.type && CATEGORY_TYPES.includes(req.query.type)) {
      filter.type = req.query.type;
    }

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .select("name color type")
      .lean();

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};



export const createCategory = async (req, res, next) => {
  try {
    const name = normalizeName(req.body.name);
    const color = req.body.color || "slate";
    const type = normalizeType(req.body.type);

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

    const existing = await findDuplicateCategory(req.user._id, name, type);
    if (existing) {
      res.status(400);
      throw new Error("A category with this name already exists");
    }

    const category = await Category.create({
      userId: req.user._id,
      name,
      nameKey: toNameKey(name),
      color,
      type,
    });

    res.status(201).json({
      success: true,
      category: {
        ...category.toObject(),
        usageCount: 0,
        expenseCount: 0,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      res.status(400);
      return next(new Error("A category with this name already exists"));
    }
    next(error);
  }
};



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
    const nextType = category.type || "expense";

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
      nextType,
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
      const Model = nextType === "income" ? Income : Expense;
      await Model.updateMany(
        { userId: req.user._id, category: previousName },
        { $set: { category: nextName } }
      );

      if (nextType === "expense") {
        await Budget.updateMany(
          { userId: req.user._id, "allocations.category": previousName },
          { $set: { "allocations.$[elem].category": nextName } },
          { arrayFilters: [{ "elem.category": previousName }] }
        );
      }
    }

    const usageCount = await countUsage(req.user._id, category);

    res.status(200).json({
      success: true,
      category: {
        ...category.toObject(),
        usageCount,
        expenseCount: usageCount,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      res.status(400);
      return next(new Error("A category with this name already exists"));
    }
    next(error);
  }
};



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

    const usageCount = await countUsage(req.user._id, category);
    const label = category.type === "income" ? "income" : "expense";

    if (usageCount > 0) {
      res.status(400);
      throw new Error(
        `Cannot delete "${category.name}" — ${usageCount} ${label}${
          usageCount === 1 ? "" : "s"
        } still use it. Reassign those ${label}s first.`
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

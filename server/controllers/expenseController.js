/**
 * controllers/expenseController.js
 * CRUD and stats for logged-in user's expenses.
 */

import Expense, {
  EXPENSE_CATEGORIES,
  PAYMENT_MODES,
} from "../models/Expense.js";

/**
 * Build a MongoDB filter from query params for the current user.
 */
const buildExpenseFilter = (userId, query) => {
  const filter = { userId };

  if (query.category && EXPENSE_CATEGORIES.includes(query.category)) {
    filter.category = query.category;
  }

  if (query.paymentMode && PAYMENT_MODES.includes(query.paymentMode)) {
    filter.paymentMode = query.paymentMode;
  }

  if (query.search?.trim()) {
    filter.title = { $regex: query.search.trim(), $options: "i" };
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  return filter;
};

/**
 * Parse sort option — default: date descending.
 */
const parseSort = (sortBy) => {
  const sortMap = {
    date: { date: -1 },
    "date-asc": { date: 1 },
    amount: { amount: -1 },
    "amount-asc": { amount: 1 },
    title: { title: 1 },
  };

  return sortMap[sortBy] || sortMap.date;
};

/**
 * Ensure expense belongs to the authenticated user.
 */
const findOwnedExpense = async (expenseId, userId) => {
  const expense = await Expense.findById(expenseId);

  if (!expense) {
    return { expense: null, status: 404, message: "Expense not found" };
  }

  if (expense.userId.toString() !== userId.toString()) {
    return { expense: null, status: 403, message: "Not authorized to access this expense" };
  }

  return { expense, status: null, message: null };
};

/**
 * Validate required expense fields for create/update.
 */
const validateExpenseBody = (body, { isUpdate = false } = {}) => {
  const { title, amount, category, paymentMode } = body;

  if (!isUpdate) {
    if (!title?.trim()) return "Title is required";
    if (amount === undefined || amount === null || amount === "") {
      return "Amount is required";
    }
    if (!category) return "Category is required";
  }

  if (title !== undefined && !String(title).trim()) {
    return "Title cannot be empty";
  }

  if (amount !== undefined && amount !== null && amount !== "") {
    const num = Number(amount);
    if (Number.isNaN(num) || num <= 0) {
      return "Amount must be a positive number";
    }
  }

  if (category !== undefined && !EXPENSE_CATEGORIES.includes(category)) {
    return "Invalid category";
  }

  if (paymentMode !== undefined && !PAYMENT_MODES.includes(paymentMode)) {
    return "Invalid payment mode";
  }

  return null;
};

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense for the logged-in user
 */
export const addExpense = async (req, res, next) => {
  try {
    const validationError = validateExpenseBody(req.body);
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { title, amount, category, paymentMode, date, description, receiptUrl } =
      req.body;

    const expense = await Expense.create({
      userId: req.user._id,
      title: title.trim(),
      amount: Number(amount),
      category,
      paymentMode: paymentMode || "Cash",
      date: date ? new Date(date) : new Date(),
      description: description?.trim() || "",
      receiptUrl: receiptUrl?.trim() || "",
    });

    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/expenses
 * @desc    List expenses with filters, search, pagination, and sort
 */
export const getExpenses = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const sort = parseSort(req.query.sortBy);
    const filter = buildExpenseFilter(req.user._id, req.query);

    const [expenses, totalCount, amountAgg] = await Promise.all([
      Expense.find(filter).sort(sort).skip(skip).limit(limit),
      Expense.countDocuments(filter),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;
    const totalAmount = amountAgg[0]?.totalAmount || 0;

    res.status(200).json({
      success: true,
      expenses,
      totalCount,
      totalPages,
      currentPage: page,
      totalAmount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/expenses/stats
 * @desc    Monthly stats — total, count, category-wise breakdown
 */
export const getExpenseStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const match = {
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    };

    const [summary, byCategory] = await Promise.all([
      Expense.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Expense.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    const stats = {
      totalAmount: summary[0]?.totalAmount || 0,
      count: summary[0]?.count || 0,
      byCategory: byCategory.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/expenses/:id
 * @desc    Fetch a single expense owned by the user
 */
export const getExpenseById = async (req, res, next) => {
  try {
    const { expense, status, message } = await findOwnedExpense(
      req.params.id,
      req.user._id
    );

    if (!expense) {
      res.status(status);
      throw new Error(message);
    }

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an expense owned by the user
 */
export const updateExpense = async (req, res, next) => {
  try {
    const validationError = validateExpenseBody(req.body, { isUpdate: true });
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { expense, status, message } = await findOwnedExpense(
      req.params.id,
      req.user._id
    );

    if (!expense) {
      res.status(status);
      throw new Error(message);
    }

    const { title, amount, category, paymentMode, date, description, receiptUrl } =
      req.body;

    if (title !== undefined) expense.title = title.trim();
    if (amount !== undefined) expense.amount = Number(amount);
    if (category !== undefined) expense.category = category;
    if (paymentMode !== undefined) expense.paymentMode = paymentMode;
    if (date !== undefined) expense.date = new Date(date);
    if (description !== undefined) expense.description = description.trim();
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl.trim();

    await expense.save();

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense owned by the user
 */
export const deleteExpense = async (req, res, next) => {
  try {
    const { expense, status, message } = await findOwnedExpense(
      req.params.id,
      req.user._id
    );

    if (!expense) {
      res.status(status);
      throw new Error(message);
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

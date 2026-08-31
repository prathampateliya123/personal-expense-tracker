/**
 * controllers/expenseController.js
 * CRUD operations for user expenses.
 * Uses mongoose aggregation for filtered, paginated expense queries.
 */

import mongoose from "mongoose";
import Expense, { EXPENSE_CATEGORIES, PAYMENT_MODES } from "../models/Expense.js";

/**
 * Build aggregation $match stage from query params and authenticated user.
 */
const buildMatchStage = (userId, query) => {
  const { category, paymentMode, startDate, endDate } = query;

  const match = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (category) {
    match.category = category;
  }

  if (paymentMode) {
    match.paymentMode = paymentMode;
  }

  if (startDate || endDate) {
    match.date = {};
    if (startDate) {
      match.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.date.$lte = end;
    }
  }

  return match;
};

/**
 * @route   POST /api/expenses
 * @desc    Add a new expense for the authenticated user
 * @access  Private
 */
export const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, paymentMode, date, description, receiptUrl } =
      req.body;

    if (!title || amount == null || !category || !paymentMode || !date) {
      res.status(400);
      throw new Error("Please provide title, amount, category, payment mode, and date");
    }

    if (!EXPENSE_CATEGORIES.includes(category)) {
      res.status(400);
      throw new Error("Invalid category");
    }

    if (!PAYMENT_MODES.includes(paymentMode)) {
      res.status(400);
      throw new Error("Invalid payment mode");
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount,
      category,
      paymentMode,
      date,
      description,
      receiptUrl,
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/expenses
 * @desc    Get expenses with optional filters, pagination, and date sorting
 * @access  Private
 */
export const getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "desc" } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sort === "asc" ? 1 : -1;

    const matchStage = buildMatchStage(req.user._id, req.query);

    const [result] = await Expense.aggregate([
      { $match: matchStage },
      {
        $facet: {
          expenses: [
            { $sort: { date: sortOrder, createdAt: sortOrder } },
            { $skip: skip },
            { $limit: limitNum },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const expenses = result.expenses;
    const total = result.totalCount[0]?.count || 0;

    res.status(200).json({
      success: true,
      expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/expenses/:id
 * @desc    Get a single expense by ID
 * @access  Private
 */
export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      res.status(404);
      throw new Error("Expense not found");
    }

    res.status(200).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an existing expense
 * @access  Private
 */
export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      res.status(404);
      throw new Error("Expense not found");
    }

    const { title, amount, category, paymentMode, date, description, receiptUrl } =
      req.body;

    if (category && !EXPENSE_CATEGORIES.includes(category)) {
      res.status(400);
      throw new Error("Invalid category");
    }

    if (paymentMode && !PAYMENT_MODES.includes(paymentMode)) {
      res.status(400);
      throw new Error("Invalid payment mode");
    }

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (paymentMode !== undefined) expense.paymentMode = paymentMode;
    if (date !== undefined) expense.date = date;
    if (description !== undefined) expense.description = description;
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;

    await expense.save();

    res.status(200).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense
 * @access  Private
 */
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      res.status(404);
      throw new Error("Expense not found");
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      expenseId: expense._id,
    });
  } catch (error) {
    next(error);
  }
};

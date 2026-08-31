/**
 * controllers/incomeController.js
 * CRUD operations for user income entries.
 * Uses mongoose aggregation for filtered, paginated income queries.
 */

import mongoose from "mongoose";
import Income, { INCOME_SOURCES } from "../models/Income.js";

/**
 * Build aggregation $match stage from query params and authenticated user.
 */
const buildMatchStage = (userId, query) => {
  const { source, startDate, endDate } = query;

  const match = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (source) {
    match.source = source;
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
 * @route   POST /api/incomes
 * @desc    Add a new income entry for the authenticated user
 * @access  Private
 */
export const addIncome = async (req, res, next) => {
  try {
    const { source, amount, date, description } = req.body;

    if (!source || amount == null || !date) {
      res.status(400);
      throw new Error("Please provide source, amount, and date");
    }

    if (!INCOME_SOURCES.includes(source)) {
      res.status(400);
      throw new Error("Invalid income source");
    }

    const income = await Income.create({
      userId: req.user._id,
      source,
      amount,
      date,
      description,
    });

    res.status(201).json({ success: true, income });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/incomes
 * @desc    Get incomes with optional filters, pagination, and date sorting
 * @access  Private
 */
export const getIncomes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "desc" } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sort === "asc" ? 1 : -1;

    const matchStage = buildMatchStage(req.user._id, req.query);

    const [result] = await Income.aggregate([
      { $match: matchStage },
      {
        $facet: {
          incomes: [
            { $sort: { date: sortOrder, createdAt: sortOrder } },
            { $skip: skip },
            { $limit: limitNum },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const incomes = result.incomes;
    const total = result.totalCount[0]?.count || 0;

    res.status(200).json({
      success: true,
      incomes,
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
 * @route   PUT /api/incomes/:id
 * @desc    Update an existing income entry
 * @access  Private
 */
export const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!income) {
      res.status(404);
      throw new Error("Income not found");
    }

    const { source, amount, date, description } = req.body;

    if (source && !INCOME_SOURCES.includes(source)) {
      res.status(400);
      throw new Error("Invalid income source");
    }

    if (source !== undefined) income.source = source;
    if (amount !== undefined) income.amount = amount;
    if (date !== undefined) income.date = date;
    if (description !== undefined) income.description = description;

    await income.save();

    res.status(200).json({ success: true, income });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/incomes/:id
 * @desc    Delete an income entry
 * @access  Private
 */
export const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!income) {
      res.status(404);
      throw new Error("Income not found");
    }

    res.status(200).json({
      success: true,
      message: "Income deleted successfully",
      incomeId: income._id,
    });
  } catch (error) {
    next(error);
  }
};

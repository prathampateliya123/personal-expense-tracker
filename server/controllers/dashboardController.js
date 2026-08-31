/**
 * controllers/dashboardController.js
 * Analytics endpoints for dashboard summary, category breakdown, and monthly trends.
 * Uses mongoose aggregation pipelines for efficient data aggregation.
 */

import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";

/**
 * Get start and end dates for the current calendar month.
 */
const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Sum amounts for a model filtered by user and optional date range.
 */
const sumAmounts = async (Model, userId, dateRange = null) => {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (dateRange) {
    match.date = { $gte: dateRange.start, $lte: dateRange.end };
  }

  const [result] = await Model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result?.total || 0;
};

/**
 * Build labels for the last 6 calendar months (including current).
 */
const getLast6MonthKeys = () => {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    });
  }

  return months;
};

/**
 * @route   GET /api/dashboard/summary
 * @desc    Total income, expense, and balance (current month + all-time)
 * @access  Private
 */
export const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const monthRange = getCurrentMonthRange();

    const [
      monthIncome,
      monthExpense,
      allTimeIncome,
      allTimeExpense,
    ] = await Promise.all([
      sumAmounts(Income, userId, monthRange),
      sumAmounts(Expense, userId, monthRange),
      sumAmounts(Income, userId),
      sumAmounts(Expense, userId),
    ]);

    res.status(200).json({
      success: true,
      summary: {
        currentMonth: {
          income: monthIncome,
          expense: monthExpense,
          balance: monthIncome - monthExpense,
        },
        allTime: {
          income: allTimeIncome,
          expense: allTimeExpense,
          balance: allTimeIncome - allTimeExpense,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/category-breakdown
 * @desc    Expenses grouped by category (for pie chart)
 * @access  Private
 */
export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const breakdown = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      breakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/monthly-trend
 * @desc    Last 6 months income vs expense grouped by month
 * @access  Private
 */
export const getMonthlyTrend = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const monthKeys = getLast6MonthKeys();
    const startDate = new Date(monthKeys[0].year, monthKeys[0].month - 1, 1);

    const groupByMonth = [
      {
        $match: {
          userId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
    ];

    const [incomeData, expenseData] = await Promise.all([
      Income.aggregate(groupByMonth),
      Expense.aggregate(groupByMonth),
    ]);

    const toKey = (year, month) => `${year}-${month}`;

    const incomeMap = Object.fromEntries(
      incomeData.map((item) => [
        toKey(item._id.year, item._id.month),
        item.total,
      ])
    );

    const expenseMap = Object.fromEntries(
      expenseData.map((item) => [
        toKey(item._id.year, item._id.month),
        item.total,
      ])
    );

    const trend = monthKeys.map(({ year, month, label }) => ({
      month: label,
      income: incomeMap[toKey(year, month)] || 0,
      expense: expenseMap[toKey(year, month)] || 0,
    }));

    res.status(200).json({
      success: true,
      trend,
    });
  } catch (error) {
    next(error);
  }
};

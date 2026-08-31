/**
 * utils/reportHelper.js
 * Shared helpers for fetching and aggregating report data.
 */

import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";

/**
 * Parse start/end dates into a full-day range.
 */
export const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Get month start/end for a given month/year.
 */
export const getMonthRange = (month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Fetch expenses and incomes within a date range for a user.
 */
export const fetchReportData = async (userId, startDate, endDate) => {
  const { start, end } = getDateRange(startDate, endDate);

  const [expenses, incomes] = await Promise.all([
    Expense.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 }),
    Income.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 }),
  ]);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  return {
    expenses,
    incomes,
    totalExpense,
    totalIncome,
    balance: totalIncome - totalExpense,
    startDate: start,
    endDate: end,
  };
};

/**
 * Build monthly summary with category breakdown and top expenses.
 */
export const getMonthlySummary = async (userId, month, year) => {
  const { start, end } = getMonthRange(month, year);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [expenseAgg, incomeAgg, topExpenses] = await Promise.all([
    Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: start, $lte: end },
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
    ]),
    Income.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.find({
      userId,
      date: { $gte: start, $lte: end },
    })
      .sort({ amount: -1 })
      .limit(5)
      .select("title amount category date paymentMode"),
  ]);

  const totalExpense = expenseAgg.reduce((sum, c) => sum + c.total, 0);
  const totalIncome = incomeAgg[0]?.total || 0;

  const categoryBreakdown = expenseAgg.map((item) => ({
    category: item._id,
    total: item.total,
    count: item.count,
    percentage:
      totalExpense > 0
        ? Math.round((item.total / totalExpense) * 10000) / 100
        : 0,
  }));

  return {
    month,
    year,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categoryBreakdown,
    topExpenses,
  };
};

/**
 * Format a date for display in reports.
 */
export const formatReportDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

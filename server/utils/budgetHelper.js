/**
 * utils/budgetHelper.js
 * Shared helpers for budget date ranges and expense aggregation.
 */

import mongoose from "mongoose";
import Expense from "../models/Expense.js";

/**
 * Get start and end dates for a given month/year.
 */
export const getMonthRange = (month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Aggregate total spent per category for a user in a given month.
 * Returns a map: { [category]: totalSpent }
 */
export const getSpendingByCategory = async (userId, month, year) => {
  const { start, end } = getMonthRange(month, year);

  const results = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
  ]);

  return Object.fromEntries(
    results.map((item) => [item._id, item.total])
  );
};

/**
 * Enrich budget documents with computed spent amount and usage percentage.
 */
export const enrichBudgetsWithSpending = (budgets, spendingMap) => {
  return budgets.map((budget) => {
    const currentSpent = spendingMap[budget.category] || 0;
    const percentageUsed =
      budget.monthlyLimit > 0
        ? Math.round((currentSpent / budget.monthlyLimit) * 100)
        : 0;

    return {
      ...budget.toObject(),
      currentSpent,
      percentageUsed,
      remaining: Math.max(0, budget.monthlyLimit - currentSpent),
    };
  });
};

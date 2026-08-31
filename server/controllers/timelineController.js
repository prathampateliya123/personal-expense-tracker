/**
 * controllers/timelineController.js
 * Timeline, memory, and heatmap endpoints for expense visualization.
 */

import mongoose from "mongoose";
import Expense from "../models/Expense.js";

/**
 * Format a Date to YYYY-MM-DD string key.
 */
const toDateKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Get month start/end range.
 */
const getMonthRange = (month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Group expenses by date for timeline display.
 */
const groupExpensesByDate = (expenses) => {
  const groups = {};

  expenses.forEach((exp) => {
    const key = toDateKey(exp.date);
    if (!groups[key]) {
      groups[key] = {
        date: key,
        totalAmount: 0,
        expenses: [],
      };
    }
    groups[key].expenses.push(exp);
    groups[key].totalAmount += exp.amount;
  });

  return Object.values(groups)
    .map((g) => ({
      ...g,
      totalAmount: Math.round(g.totalAmount * 100) / 100,
      expenses: g.expenses.sort((a, b) => b.amount - a.amount),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * @route   GET /api/timeline/timeline
 * @desc    Expenses grouped by date for a given month/year
 * @access  Private
 */
export const getTimeline = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const { start, end } = getMonthRange(month, year);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1, amount: -1 });

    const timeline = groupExpensesByDate(expenses);

    res.status(200).json({
      success: true,
      month,
      year,
      timeline,
      totalDays: timeline.length,
      totalExpenses: expenses.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/timeline/memories
 * @desc    Expenses from the same calendar date in previous years
 * @access  Private
 */
export const getMemories = async (req, res, next) => {
  try {
    const referenceDate = req.query.date ? new Date(req.query.date) : new Date();
    const month = referenceDate.getMonth();
    const day = referenceDate.getDate();
    const currentYear = referenceDate.getFullYear();

    const memories = [];

    // Look back up to 10 years
    for (let yearsAgo = 1; yearsAgo <= 10; yearsAgo++) {
      const targetYear = currentYear - yearsAgo;
      const dayStart = new Date(targetYear, month, day, 0, 0, 0, 0);
      const dayEnd = new Date(targetYear, month, day, 23, 59, 59, 999);

      // Skip invalid dates (e.g. Feb 29 on non-leap years rolls over)
      if (dayStart.getMonth() !== month || dayStart.getDate() !== day) continue;

      const expenses = await Expense.find({
        userId: req.user._id,
        date: { $gte: dayStart, $lte: dayEnd },
      }).sort({ amount: -1 });

      if (expenses.length > 0) {
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        memories.push({
          yearsAgo,
          year: targetYear,
          date: toDateKey(dayStart),
          totalSpent: Math.round(totalSpent * 100) / 100,
          expenses,
          topExpense: expenses[0],
        });
      }
    }

    res.status(200).json({
      success: true,
      referenceDate: toDateKey(referenceDate),
      memories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/timeline/heatmap
 * @desc    Daily total spend for a year (calendar heatmap data)
 * @access  Private
 */
export const getHeatmap = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

    const results = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: yearStart, $lte: yearEnd },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const amountMap = Object.fromEntries(
      results.map((r) => [r._id, Math.round(r.amount * 100) / 100])
    );

    // Build full year array with zero-fill for missing days
    const heatmap = [];
    const cursor = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    while (cursor <= end) {
      const key = toDateKey(cursor);
      heatmap.push({
        date: key,
        amount: amountMap[key] || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const maxAmount = Math.max(...heatmap.map((d) => d.amount), 0);

    res.status(200).json({
      success: true,
      year,
      heatmap,
      maxAmount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * controllers/simulatorController.js
 * Calculation-only what-if scenarios using existing expense/income data.
 * No database writes — pure projection and aggregation logic.
 */

import mongoose from "mongoose";
import Expense, { EXPENSE_CATEGORIES } from "../models/Expense.js";

const LOOKBACK_DAYS = 90;

/**
 * Calculate average daily spend for a category over the last 90 days.
 */
const getAverageDailySpend = async (userId, category) => {
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);

  const [result] = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        category,
        date: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: "$amount" },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  const totalSpent = result?.totalSpent || 0;
  const avgDailySpend = totalSpent / LOOKBACK_DAYS;

  return {
    totalSpent,
    avgDailySpend: Math.round(avgDailySpend * 100) / 100,
    transactionCount: result?.transactionCount || 0,
    lookbackDays: LOOKBACK_DAYS,
  };
};

/**
 * @route   POST /api/simulator/simulate-cut
 * @desc    Project savings from cutting daily spend in a category
 * @access  Private
 */
export const simulateCut = async (req, res, next) => {
  try {
    const { category, dailyCutAmount, months } = req.body;

    if (!category || dailyCutAmount == null || !months) {
      res.status(400);
      throw new Error("Please provide category, dailyCutAmount, and months");
    }

    if (!EXPENSE_CATEGORIES.includes(category)) {
      res.status(400);
      throw new Error("Invalid category");
    }

    const cut = parseFloat(dailyCutAmount);
    const periodMonths = parseInt(months, 10);

    if (cut < 0 || periodMonths <= 0) {
      res.status(400);
      throw new Error("Invalid cut amount or time period");
    }

    const projectedSavings = cut * 30 * periodMonths;
    const spending = await getAverageDailySpend(req.user._id, category);

    const projectedDailySpend = Math.max(0, spending.avgDailySpend - cut);
    const percentReduction =
      spending.avgDailySpend > 0
        ? Math.round((cut / spending.avgDailySpend) * 100)
        : 0;

    res.status(200).json({
      success: true,
      simulation: {
        category,
        dailyCutAmount: cut,
        months: periodMonths,
        projectedSavings,
        currentAvgDailySpend: spending.avgDailySpend,
        projectedDailySpend,
        percentReduction,
        totalSpentInPeriod: spending.totalSpent,
        lookbackDays: spending.lookbackDays,
        transactionCount: spending.transactionCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Build month-by-month balance projection for chart data.
 */
const buildSavingsProjection = (monthlySavings, targetAmount, interestRate) => {
  const monthlyRate = interestRate > 0 ? interestRate / 100 / 12 : 0;
  const projection = [];
  let balance = 0;
  let months = 0;
  const maxMonths = 360;

  while (balance < targetAmount && months < maxMonths) {
    months++;
    balance = balance * (1 + monthlyRate) + monthlySavings;
    projection.push({
      month: months,
      balance: Math.round(balance * 100) / 100,
      target: targetAmount,
    });
  }

  return { monthsRequired: months, projection, finalBalance: balance };
};

/**
 * @route   POST /api/simulator/simulate-savings-rate
 * @desc    Calculate months to reach a savings target with optional compound interest
 * @access  Private
 */
export const simulateSavingsRate = async (req, res, next) => {
  try {
    const {
      monthlyIncome,
      monthlySavingsGoal,
      targetAmount,
      interestRate = 0,
    } = req.body;

    if (monthlyIncome == null || monthlySavingsGoal == null || !targetAmount) {
      res.status(400);
      throw new Error(
        "Please provide monthlyIncome, monthlySavingsGoal, and targetAmount"
      );
    }

    const income = parseFloat(monthlyIncome);
    const monthlySavings = parseFloat(monthlySavingsGoal);
    const target = parseFloat(targetAmount);
    const rate = parseFloat(interestRate) || 0;

    if (income <= 0 || monthlySavings <= 0 || target <= 0) {
      res.status(400);
      throw new Error("Values must be greater than zero");
    }

    if (monthlySavings > income) {
      res.status(400);
      throw new Error("Monthly savings cannot exceed monthly income");
    }

    const { monthsRequired, projection, finalBalance } = buildSavingsProjection(
      monthlySavings,
      target,
      rate
    );

    const savingsRate = Math.round((monthlySavings / income) * 100);

    // Simple projection without interest for comparison
    const simpleMonths = Math.ceil(target / monthlySavings);

    res.status(200).json({
      success: true,
      simulation: {
        monthlyIncome: income,
        monthlySavingsGoal: monthlySavings,
        targetAmount: target,
        interestRate: rate,
        monthsRequired,
        simpleMonths,
        savingsRate,
        finalBalance: Math.round(finalBalance * 100) / 100,
        projection,
      },
    });
  } catch (error) {
    next(error);
  }
};

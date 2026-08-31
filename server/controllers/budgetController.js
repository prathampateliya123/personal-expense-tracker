/**
 * controllers/budgetController.js
 * CRUD operations for monthly category budgets.
 * Computes currentSpent by aggregating expenses for the budget month.
 */

import Budget from "../models/Budget.js";
import { EXPENSE_CATEGORIES } from "../models/Expense.js";
import {
  getSpendingByCategory,
  enrichBudgetsWithSpending,
} from "../utils/budgetHelper.js";

/**
 * @route   POST /api/budgets
 * @desc    Create or update a budget for a category + month
 * @access  Private
 */
export const setBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;

    if (!category || monthlyLimit == null || !month || !year) {
      res.status(400);
      throw new Error("Please provide category, monthlyLimit, month, and year");
    }

    if (!EXPENSE_CATEGORIES.includes(category)) {
      res.status(400);
      throw new Error("Invalid category");
    }

    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user._id,
        category,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      },
      {
        userId: req.user._id,
        category,
        monthlyLimit: parseFloat(monthlyLimit),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      },
      { new: true, upsert: true, runValidators: true }
    );

    const spendingMap = await getSpendingByCategory(
      req.user._id,
      budget.month,
      budget.year
    );
    const [enriched] = enrichBudgetsWithSpending([budget], spendingMap);

    res.status(200).json({ success: true, budget: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/budgets
 * @desc    Get budgets for a month with computed spent amounts
 * @access  Private
 */
export const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year,
    }).sort({ category: 1 });

    const spendingMap = await getSpendingByCategory(req.user._id, month, year);
    const enrichedBudgets = enrichBudgetsWithSpending(budgets, spendingMap);

    res.status(200).json({
      success: true,
      budgets: enrichedBudgets,
      month,
      year,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete a budget
 * @access  Private
 */
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      res.status(404);
      throw new Error("Budget not found");
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
      budgetId: budget._id,
    });
  } catch (error) {
    next(error);
  }
};

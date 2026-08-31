/**
 * controllers/goalController.js
 * CRUD and contribution operations for savings goals.
 * Auto-completes goals when currentAmount >= targetAmount.
 */

import Goal, { GOAL_STATUSES } from "../models/Goal.js";
import { EXPENSE_CATEGORIES } from "../models/Expense.js";
import { enrichGoal, checkAndCompleteGoal } from "../utils/goalHelper.js";
import { createNotification } from "../utils/notificationHelper.js";

/**
 * Send a goal completion notification.
 */
const notifyGoalComplete = async (goal) => {
  await createNotification(
    goal.userId,
    `Goal achieved: ${goal.goalName}`,
    `Congratulations! You've reached your savings goal of ₹${goal.targetAmount} for "${goal.goalName}".`,
    "goal_complete"
  );
};

/**
 * @route   POST /api/goals
 * @desc    Create a new savings goal
 * @access  Private
 */
export const createGoal = async (req, res, next) => {
  try {
    const { goalName, targetAmount, targetDate, category } = req.body;

    if (!goalName || targetAmount == null || !targetDate || !category) {
      res.status(400);
      throw new Error("Please provide goalName, targetAmount, targetDate, and category");
    }

    if (!EXPENSE_CATEGORIES.includes(category)) {
      res.status(400);
      throw new Error("Invalid category");
    }

    const goal = await Goal.create({
      userId: req.user._id,
      goalName,
      targetAmount,
      targetDate,
      category,
    });

    res.status(201).json({ success: true, goal: enrichGoal(goal) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/goals
 * @desc    Get all goals for the authenticated user
 * @access  Private
 */
export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({
      status: 1,
      targetDate: 1,
    });

    res.status(200).json({
      success: true,
      goals: goals.map(enrichGoal),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/goals/:id/contribute
 * @desc    Add a contribution to a goal's current amount
 * @access  Private
 */
export const addContribution = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (amount == null || amount <= 0) {
      res.status(400);
      throw new Error("Please provide a valid contribution amount");
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      res.status(404);
      throw new Error("Goal not found");
    }

    if (goal.status === "completed") {
      res.status(400);
      throw new Error("Goal is already completed");
    }

    goal.currentAmount += parseFloat(amount);

    const justCompleted = checkAndCompleteGoal(goal);
    await goal.save();

    if (justCompleted) {
      await notifyGoalComplete(goal);
    }

    res.status(200).json({ success: true, goal: enrichGoal(goal) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/goals/:id
 * @desc    Update a savings goal
 * @access  Private
 */
export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      res.status(404);
      throw new Error("Goal not found");
    }

    const { goalName, targetAmount, targetDate, category, status } = req.body;

    if (category && !EXPENSE_CATEGORIES.includes(category)) {
      res.status(400);
      throw new Error("Invalid category");
    }

    if (status && !GOAL_STATUSES.includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }

    if (goalName !== undefined) goal.goalName = goalName;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (category !== undefined) goal.category = category;
    if (status !== undefined) goal.status = status;

    if (goal.status === "active") {
      const justCompleted = checkAndCompleteGoal(goal);
      if (justCompleted) {
        await notifyGoalComplete(goal);
      }
    }

    await goal.save();

    res.status(200).json({ success: true, goal: enrichGoal(goal) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/goals/:id/complete
 * @desc    Manually mark a goal as completed
 * @access  Private
 */
export const markGoalComplete = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      res.status(404);
      throw new Error("Goal not found");
    }

    if (goal.status === "completed") {
      res.status(400);
      throw new Error("Goal is already completed");
    }

    goal.status = "completed";
    await goal.save();

    await notifyGoalComplete(goal);

    res.status(200).json({ success: true, goal: enrichGoal(goal) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a savings goal
 * @access  Private
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      res.status(404);
      throw new Error("Goal not found");
    }

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
      goalId: goal._id,
    });
  } catch (error) {
    next(error);
  }
};

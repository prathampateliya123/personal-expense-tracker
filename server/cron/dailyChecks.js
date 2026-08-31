/**
 * cron/dailyChecks.js
 * Scheduled jobs for daily reminder and alert checks.
 * Runs budget threshold checks and creates notifications when limits are nearing.
 */

import cron from "node-cron";
import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import {
  createNotification,
  hasRecentNotification,
} from "../utils/notificationHelper.js";

const THRESHOLD_PERCENT = 80;

/**
 * Get start and end of the current calendar month.
 */
const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Sum expenses for a user in a category within the current month.
 */
const getCategorySpending = async (userId, category, dateRange) => {
  const [result] = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        category,
        date: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result?.total || 0;
};

/**
 * Check all budgets and notify users when spending exceeds 80% of limit.
 */
export const checkBudgetsNearingLimit = async () => {
  try {
    const budgets = await Budget.find();
    const monthRange = getCurrentMonthRange();

    for (const budget of budgets) {
      const spent = await getCategorySpending(
        budget.userId,
        budget.category,
        monthRange
      );

      const usagePercent = (spent / budget.limitAmount) * 100;

      if (usagePercent >= THRESHOLD_PERCENT) {
        const title = `Budget alert: ${budget.category}`;
        const alreadySent = await hasRecentNotification(
          budget.userId,
          "budget_alert",
          title
        );

        if (!alreadySent) {
          const message =
            usagePercent >= 100
              ? `You have exceeded your ${budget.category} budget of ₹${budget.limitAmount}. Current spending: ₹${spent.toFixed(2)}.`
              : `You have used ${usagePercent.toFixed(0)}% of your ${budget.category} budget (₹${spent.toFixed(2)} / ₹${budget.limitAmount}).`;

          await createNotification(
            budget.userId,
            title,
            message,
            "budget_alert"
          );
        }
      }
    }

    console.log("[Cron] Budget threshold check completed");
  } catch (error) {
    console.error("[Cron] Budget check failed:", error.message);
  }
};

/**
 * Start the daily cron schedule.
 * Runs every day at 9:00 AM server time.
 */
export const startDailyChecks = () => {
  cron.schedule("0 9 * * *", checkBudgetsNearingLimit);
  console.log("[Cron] Daily checks scheduled (9:00 AM daily)");
};

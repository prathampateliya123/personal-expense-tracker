/**
 * cron/dailyChecks.js
 * Scheduled jobs for daily reminder and alert checks.
 * Runs budget threshold checks and creates notifications when limits are nearing.
 */

import cron from "node-cron";
import Budget from "../models/Budget.js";
import { getSpendingByCategory } from "../utils/budgetHelper.js";
import {
  createNotification,
  hasRecentNotification,
} from "../utils/notificationHelper.js";

const THRESHOLD_PERCENT = 80;

/**
 * Check all budgets for the current month and notify users nearing their limit.
 */
export const checkBudgetsNearingLimit = async () => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({ month, year });

    // Group budgets by user to batch expense aggregation
    const userIds = [...new Set(budgets.map((b) => b.userId.toString()))];

    for (const userId of userIds) {
      const spendingMap = await getSpendingByCategory(userId, month, year);
      const userBudgets = budgets.filter(
        (b) => b.userId.toString() === userId
      );

      for (const budget of userBudgets) {
        const spent = spendingMap[budget.category] || 0;
        const usagePercent = (spent / budget.monthlyLimit) * 100;

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
                ? `You have exceeded your ${budget.category} budget of ₹${budget.monthlyLimit}. Current spending: ₹${spent.toFixed(2)}.`
                : `You have used ${usagePercent.toFixed(0)}% of your ${budget.category} budget (₹${spent.toFixed(2)} / ₹${budget.monthlyLimit}).`;

            await createNotification(
              budget.userId,
              title,
              message,
              "budget_alert"
            );
          }
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

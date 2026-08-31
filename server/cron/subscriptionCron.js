/**
 * cron/subscriptionCron.js
 * Daily job for subscription billing, auto-expenses, and billing reminders.
 */

import cron from "node-cron";
import Subscription from "../models/Subscription.js";
import Expense from "../models/Expense.js";
import { createNotification } from "../utils/notificationHelper.js";
import {
  isSameDay,
  daysBetween,
  getNextBillingDate,
  startOfDay,
} from "../utils/subscriptionHelper.js";

/**
 * Process subscriptions due for billing today.
 */
const processDueSubscriptions = async () => {
  const today = startOfDay(new Date());
  const activeSubscriptions = await Subscription.find({ status: "active" });

  for (const sub of activeSubscriptions) {
    if (!isSameDay(sub.nextBillingDate, today)) continue;

    // Auto-create expense if enabled
    if (sub.autoAddExpense) {
      await Expense.create({
        userId: sub.userId,
        title: `${sub.serviceName} (Subscription)`,
        amount: sub.amount,
        category: sub.category,
        paymentMode: "upi",
        date: today,
        description: `Auto-added from subscription: ${sub.serviceName}`,
      });
    }

    // Advance to next billing cycle
    sub.nextBillingDate = getNextBillingDate(sub.nextBillingDate, sub.billingCycle);
    sub.reminderSentForDate = null;
    await sub.save();

    // Billing notification
    await createNotification(
      sub.userId,
      `Subscription billed: ${sub.serviceName}`,
      sub.autoAddExpense
        ? `₹${sub.amount} was charged for ${sub.serviceName} and added to your expenses. Next billing: ${sub.nextBillingDate.toLocaleDateString()}.`
        : `₹${sub.amount} was billed for ${sub.serviceName}. Next billing: ${sub.nextBillingDate.toLocaleDateString()}.`,
      "bill_reminder"
    );
  }
};

/**
 * Send reminder notifications for upcoming billing dates.
 */
const processBillingReminders = async () => {
  const today = startOfDay(new Date());
  const activeSubscriptions = await Subscription.find({ status: "active" });

  for (const sub of activeSubscriptions) {
    const daysUntil = daysBetween(today, sub.nextBillingDate);

    if (daysUntil <= 0 || daysUntil > sub.reminderDaysBefore) continue;

    const billingDateKey = startOfDay(sub.nextBillingDate).getTime();
    const reminderSentKey = sub.reminderSentForDate
      ? startOfDay(sub.reminderSentForDate).getTime()
      : null;

    if (reminderSentKey === billingDateKey) continue;

    await createNotification(
      sub.userId,
      `Upcoming bill: ${sub.serviceName}`,
      `${sub.serviceName} (₹${sub.amount}) is due in ${daysUntil} day${daysUntil === 1 ? "" : "s"} on ${new Date(sub.nextBillingDate).toLocaleDateString()}.`,
      "bill_reminder"
    );

    sub.reminderSentForDate = sub.nextBillingDate;
    await sub.save();
  }
};

/**
 * Run all subscription cron tasks.
 */
export const runSubscriptionChecks = async () => {
  try {
    await processDueSubscriptions();
    await processBillingReminders();
    console.log("[Cron] Subscription checks completed");
  } catch (error) {
    console.error("[Cron] Subscription check failed:", error.message);
  }
};

/**
 * Start the daily subscription cron schedule.
 * Runs every day at 8:00 AM server time.
 */
export const startSubscriptionCron = () => {
  cron.schedule("0 8 * * *", runSubscriptionChecks);
  console.log("[Cron] Subscription checks scheduled (8:00 AM daily)");
};

import Subscription from "../models/Subscription.js";
import { runSubscriptionBilling } from "../controllers/subscriptionController.js";
import {
  startOfDay,
  endOfDay,
  daysUntil,
} from "../utils/subscriptionHelpers.js";
import { isDbConnected } from "../config/db.js";

let timer = null;
let running = false;

const processDueSubscriptions = async () => {
  if (!isDbConnected() || running) return;
  running = true;

  try {
    const today = startOfDay();
    const due = await Subscription.find({
      status: "active",
      nextBillingDate: { $lte: endOfDay(today) },
    });

    let billed = 0;
    for (const sub of due) {
      try {
        const result = await runSubscriptionBilling(sub, { today });
        billed += result.billedCount;
      } catch (err) {
        console.error(
          `Subscription billing failed for ${sub._id}: ${err.message}`
        );
      }
    }

    const reminderCandidates = await Subscription.find({
      status: "active",
      nextBillingDate: { $gt: endOfDay(today) },
    });

    let reminders = 0;
    for (const sub of reminderCandidates) {
      const daysLeft = daysUntil(sub.nextBillingDate, today);
      if (daysLeft <= 0 || daysLeft > (sub.reminderDaysBefore ?? 3)) continue;

      const alreadyMarked =
        sub.lastReminderAt &&
        startOfDay(sub.lastReminderAt).getTime() === today.getTime();
      if (alreadyMarked) continue;

      sub.lastReminderAt = today;
      await sub.save();
      reminders += 1;
    }

    if (billed > 0 || reminders > 0) {
      console.log(
        `Subscriptions cron: billed ${billed}, reminders marked ${reminders}`
      );
    }
  } catch (error) {
    console.error(`Subscriptions cron error: ${error.message}`);
  } finally {
    running = false;
  }
};

export const startSubscriptionCron = () => {
  if (timer) return;

  const HOUR_MS = 60 * 60 * 1000;

  const tick = async () => {
    await processDueSubscriptions();
  };

  setTimeout(tick, 15_000);
  timer = setInterval(tick, HOUR_MS);
  console.log("Subscription automation cron started (hourly)");
};

export default startSubscriptionCron;

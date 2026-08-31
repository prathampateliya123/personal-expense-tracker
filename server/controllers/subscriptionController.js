/**
 * controllers/subscriptionController.js
 * CRUD operations for recurring subscriptions.
 * Includes monthly/yearly cost summary for active subscriptions.
 */

import Subscription, {
  BILLING_CYCLES,
  SUBSCRIPTION_STATUSES,
} from "../models/Subscription.js";
import { EXPENSE_CATEGORIES } from "../models/Expense.js";
import { calculateCostSummary } from "../utils/subscriptionHelper.js";

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Private
 */
export const createSubscription = async (req, res, next) => {
  try {
    const {
      serviceName,
      amount,
      billingCycle,
      nextBillingDate,
      category,
      reminderDaysBefore,
      autoAddExpense,
    } = req.body;

    if (!serviceName || amount == null || !billingCycle || !nextBillingDate || !category) {
      res.status(400);
      throw new Error(
        "Please provide serviceName, amount, billingCycle, nextBillingDate, and category"
      );
    }

    if (!BILLING_CYCLES.includes(billingCycle)) {
      res.status(400);
      throw new Error("Invalid billing cycle");
    }

    if (!EXPENSE_CATEGORIES.includes(category)) {
      res.status(400);
      throw new Error("Invalid category");
    }

    const subscription = await Subscription.create({
      userId: req.user._id,
      serviceName,
      amount,
      billingCycle,
      nextBillingDate,
      category,
      reminderDaysBefore: reminderDaysBefore ?? 3,
      autoAddExpense: autoAddExpense ?? false,
    });

    res.status(201).json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/subscriptions
 * @desc    Get all subscriptions with cost summary
 * @access  Private
 */
export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({
      userId: req.user._id,
    }).sort({ nextBillingDate: 1 });

    const costSummary = calculateCostSummary(subscriptions);

    res.status(200).json({
      success: true,
      subscriptions,
      ...costSummary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/subscriptions/:id
 * @desc    Update a subscription (including pause/resume)
 * @access  Private
 */
export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!subscription) {
      res.status(404);
      throw new Error("Subscription not found");
    }

    const {
      serviceName,
      amount,
      billingCycle,
      nextBillingDate,
      category,
      reminderDaysBefore,
      status,
      autoAddExpense,
    } = req.body;

    if (billingCycle && !BILLING_CYCLES.includes(billingCycle)) {
      res.status(400);
      throw new Error("Invalid billing cycle");
    }

    if (category && !EXPENSE_CATEGORIES.includes(category)) {
      res.status(400);
      throw new Error("Invalid category");
    }

    if (status && !SUBSCRIPTION_STATUSES.includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }

    if (serviceName !== undefined) subscription.serviceName = serviceName;
    if (amount !== undefined) subscription.amount = amount;
    if (billingCycle !== undefined) subscription.billingCycle = billingCycle;
    if (nextBillingDate !== undefined) {
      subscription.nextBillingDate = nextBillingDate;
      subscription.reminderSentForDate = null;
    }
    if (category !== undefined) subscription.category = category;
    if (reminderDaysBefore !== undefined) {
      subscription.reminderDaysBefore = reminderDaysBefore;
    }
    if (status !== undefined) subscription.status = status;
    if (autoAddExpense !== undefined) subscription.autoAddExpense = autoAddExpense;

    await subscription.save();

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/subscriptions/:id/cancel
 * @desc    Cancel a subscription
 * @access  Private
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!subscription) {
      res.status(404);
      throw new Error("Subscription not found");
    }

    subscription.status = "cancelled";
    await subscription.save();

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/subscriptions/:id
 * @desc    Delete a subscription
 * @access  Private
 */
export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!subscription) {
      res.status(404);
      throw new Error("Subscription not found");
    }

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
      subscriptionId: subscription._id,
    });
  } catch (error) {
    next(error);
  }
};

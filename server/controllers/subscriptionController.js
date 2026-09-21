import Subscription, {
  BILLING_CYCLES,
  SUBSCRIPTION_STATUSES,
} from "../models/Subscription.js";
import Category from "../models/Category.js";
import PaymentMethod from "../models/PaymentMethod.js";
import Expense from "../models/Expense.js";
import { escapeRegex } from "../utils/namedEntity.js";
import { findOwnedDocument } from "../utils/findOwned.js";
import {
  addBillingCycle,
  startOfDay,
  toMonthlyAmount,
  toYearlyAmount,
  withSubscriptionMeta,
  isValidBillingCycle,
} from "../utils/subscriptionHelpers.js";

const findOwnedSubscription = (id, userId) =>
  findOwnedDocument(Subscription, id, userId, {
    key: "subscription",
    notFoundMessage: "Subscription not found",
    forbiddenMessage: "Not authorized to access this subscription",
  });

const validateRefs = async (userId, category, paymentMode) => {
  if (category) {
    const cat = await Category.findOne({
      userId,
      type: "expense",
      name: category,
    });
    if (!cat) return "Category not found. Add it under Categories first.";
  }

  if (paymentMode) {
    const method = await PaymentMethod.findOne({
      userId,
      name: paymentMode,
    });
    if (!method) {
      return "Payment method not found. Add it under Settings first.";
    }
  }

  return null;
};

const validateBody = async (body, userId, { isUpdate = false } = {}) => {
  const {
    serviceName,
    amount,
    billingCycle,
    nextBillingDate,
    category,
    paymentMode,
    reminderDaysBefore,
    status,
    autoAddExpense,
    notes,
  } = body;

  if (!isUpdate) {
    if (!serviceName?.trim()) return "Service name is required";
    if (amount === undefined || amount === null || amount === "") {
      return "Amount is required";
    }
    if (!nextBillingDate) return "Next billing date is required";
    if (!category?.trim()) return "Category is required";
    if (!paymentMode?.trim()) return "Payment method is required";
  }

  if (serviceName !== undefined && !String(serviceName).trim()) {
    return "Service name cannot be empty";
  }

  if (amount !== undefined && amount !== null && amount !== "") {
    const num = Number(amount);
    if (Number.isNaN(num) || num <= 0) return "Amount must be a positive number";
  }

  if (billingCycle !== undefined && !isValidBillingCycle(billingCycle)) {
    return "Billing cycle must be monthly, quarterly, or yearly";
  }

  if (nextBillingDate !== undefined && nextBillingDate !== null && nextBillingDate !== "") {
    const d = new Date(nextBillingDate);
    if (Number.isNaN(d.getTime())) return "Invalid next billing date";
  }

  if (reminderDaysBefore !== undefined && reminderDaysBefore !== null && reminderDaysBefore !== "") {
    const days = Number(reminderDaysBefore);
    if (Number.isNaN(days) || days < 0 || days > 30) {
      return "Reminder days must be between 0 and 30";
    }
  }

  if (status !== undefined && !SUBSCRIPTION_STATUSES.includes(status)) {
    return "Invalid status";
  }

  if (autoAddExpense !== undefined && typeof autoAddExpense !== "boolean") {
    return "autoAddExpense must be true or false";
  }

  if (notes !== undefined && String(notes).length > 300) {
    return "Notes cannot exceed 300 characters";
  }

  const refError = await validateRefs(
    userId,
    category !== undefined ? String(category).trim() : null,
    paymentMode !== undefined ? String(paymentMode).trim() : null
  );
  if (refError) return refError;

  return null;
};

const buildListFilter = (userId, query = {}) => {
  const filter = { userId };

  if (query.status && SUBSCRIPTION_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  if (query.billingCycle && BILLING_CYCLES.includes(query.billingCycle)) {
    filter.billingCycle = query.billingCycle;
  }

  if (query.search?.trim()) {
    filter.serviceName = {
      $regex: escapeRegex(query.search.trim()),
      $options: "i",
    };
  }

  return filter;
};

export const getSubscriptionStats = async (req, res, next) => {
  try {
    const items = await Subscription.find({
      userId: req.user._id,
      status: { $in: ["active", "paused"] },
    }).lean();

    const active = items.filter((s) => s.status === "active");
    const paused = items.filter((s) => s.status === "paused");

    const monthlyCost = active.reduce(
      (sum, s) => sum + toMonthlyAmount(s.amount, s.billingCycle),
      0
    );
    const yearlyCost = active.reduce(
      (sum, s) => sum + toYearlyAmount(s.amount, s.billingCycle),
      0
    );

    const today = startOfDay();
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);

    const dueSoon = active.filter((s) => {
      const next = startOfDay(s.nextBillingDate);
      return next.getTime() <= in7.getTime();
    }).length;

    const autoEnabled = active.filter((s) => s.autoAddExpense).length;

    res.status(200).json({
      success: true,
      stats: {
        total: items.length,
        active: active.length,
        paused: paused.length,
        monthlyCost: Math.round(monthlyCost),
        yearlyCost: Math.round(yearlyCost),
        dueSoon,
        autoEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const filter = buildListFilter(req.user._id, req.query);

    const [items, totalCount] = await Promise.all([
      Subscription.find(filter)
        .sort({ nextBillingDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Subscription.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    res.status(200).json({
      success: true,
      subscriptions: items.map((doc) => withSubscriptionMeta(doc)),
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const { subscription, status, message } = await findOwnedSubscription(
      req.params.id,
      req.user._id
    );

    if (!subscription) {
      res.status(status);
      throw new Error(message);
    }

    res.status(200).json({
      success: true,
      subscription: withSubscriptionMeta(subscription),
    });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const errorMsg = await validateBody(req.body, req.user._id);
    if (errorMsg) {
      res.status(400);
      throw new Error(errorMsg);
    }

    const subscription = await Subscription.create({
      userId: req.user._id,
      serviceName: String(req.body.serviceName).trim(),
      amount: Number(req.body.amount),
      billingCycle: req.body.billingCycle || "monthly",
      nextBillingDate: startOfDay(req.body.nextBillingDate),
      category: String(req.body.category).trim(),
      paymentMode: String(req.body.paymentMode).trim(),
      reminderDaysBefore:
        req.body.reminderDaysBefore === undefined ||
        req.body.reminderDaysBefore === null ||
        req.body.reminderDaysBefore === ""
          ? 3
          : Number(req.body.reminderDaysBefore),
      status: req.body.status || "active",
      autoAddExpense:
        req.body.autoAddExpense === undefined
          ? true
          : Boolean(req.body.autoAddExpense),
      notes: req.body.notes ? String(req.body.notes).trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscription: withSubscriptionMeta(subscription),
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { subscription, status, message } = await findOwnedSubscription(
      req.params.id,
      req.user._id
    );

    if (!subscription) {
      res.status(status);
      throw new Error(message);
    }

    const errorMsg = await validateBody(req.body, req.user._id, {
      isUpdate: true,
    });
    if (errorMsg) {
      res.status(400);
      throw new Error(errorMsg);
    }

    if (req.body.serviceName !== undefined) {
      subscription.serviceName = String(req.body.serviceName).trim();
    }
    if (req.body.amount !== undefined) {
      subscription.amount = Number(req.body.amount);
    }
    if (req.body.billingCycle !== undefined) {
      subscription.billingCycle = req.body.billingCycle;
    }
    if (req.body.nextBillingDate !== undefined) {
      subscription.nextBillingDate = startOfDay(req.body.nextBillingDate);
    }
    if (req.body.category !== undefined) {
      subscription.category = String(req.body.category).trim();
    }
    if (req.body.paymentMode !== undefined) {
      subscription.paymentMode = String(req.body.paymentMode).trim();
    }
    if (req.body.reminderDaysBefore !== undefined) {
      subscription.reminderDaysBefore = Number(req.body.reminderDaysBefore);
    }
    if (req.body.status !== undefined) {
      subscription.status = req.body.status;
    }
    if (req.body.autoAddExpense !== undefined) {
      subscription.autoAddExpense = Boolean(req.body.autoAddExpense);
    }
    if (req.body.notes !== undefined) {
      subscription.notes = String(req.body.notes).trim();
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription: withSubscriptionMeta(subscription),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const { subscription, status, message } = await findOwnedSubscription(
      req.params.id,
      req.user._id
    );

    if (!subscription) {
      res.status(status);
      throw new Error(message);
    }

    await subscription.deleteOne();

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const pauseSubscription = async (req, res, next) => {
  try {
    const { subscription, status, message } = await findOwnedSubscription(
      req.params.id,
      req.user._id
    );

    if (!subscription) {
      res.status(status);
      throw new Error(message);
    }

    if (subscription.status === "cancelled") {
      res.status(400);
      throw new Error("Cancelled subscriptions cannot be paused");
    }

    subscription.status = "paused";
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription paused",
      subscription: withSubscriptionMeta(subscription),
    });
  } catch (error) {
    next(error);
  }
};

export const resumeSubscription = async (req, res, next) => {
  try {
    const { subscription, status, message } = await findOwnedSubscription(
      req.params.id,
      req.user._id
    );

    if (!subscription) {
      res.status(status);
      throw new Error(message);
    }

    if (subscription.status === "cancelled") {
      res.status(400);
      throw new Error("Cancelled subscriptions cannot be resumed");
    }

    subscription.status = "active";
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription resumed",
      subscription: withSubscriptionMeta(subscription),
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const { subscription, status, message } = await findOwnedSubscription(
      req.params.id,
      req.user._id
    );

    if (!subscription) {
      res.status(status);
      throw new Error(message);
    }

    subscription.status = "cancelled";
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled",
      subscription: withSubscriptionMeta(subscription),
    });
  } catch (error) {
    next(error);
  }
};

export const runSubscriptionBilling = async (subscription, { today = startOfDay() } = {}) => {
  let billedCount = 0;
  let expenseId = subscription.lastExpenseId;
  const safetyLimit = 24;

  while (
    subscription.status === "active" &&
    startOfDay(subscription.nextBillingDate).getTime() <= today.getTime() &&
    billedCount < safetyLimit
  ) {
    const billingDate = startOfDay(subscription.nextBillingDate);

    if (subscription.autoAddExpense) {
      const expense = await Expense.create({
        userId: subscription.userId,
        title: subscription.serviceName,
        amount: subscription.amount,
        category: subscription.category,
        paymentMode: subscription.paymentMode,
        date: billingDate,
        description: `Auto-added from subscription (${subscription.billingCycle})`,
      });
      expenseId = expense._id;
    }

    subscription.lastBilledAt = billingDate;
    subscription.lastExpenseId = expenseId;
    subscription.nextBillingDate = addBillingCycle(
      billingDate,
      subscription.billingCycle
    );
    billedCount += 1;
  }

  if (billedCount > 0) {
    await subscription.save();
  }

  return { billedCount, subscription };
};

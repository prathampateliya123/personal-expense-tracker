import { BILLING_CYCLES } from "../models/Subscription.js";

export const startOfDay = (value = new Date()) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (value = new Date()) => {
  const d = new Date(value);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const addBillingCycle = (date, cycle) => {
  const next = new Date(date);
  if (cycle === "quarterly") {
    next.setMonth(next.getMonth() + 3);
  } else if (cycle === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
};

export const toMonthlyAmount = (amount, cycle) => {
  const value = Number(amount) || 0;
  if (cycle === "yearly") return value / 12;
  if (cycle === "quarterly") return value / 3;
  return value;
};

export const toYearlyAmount = (amount, cycle) => {
  const value = Number(amount) || 0;
  if (cycle === "yearly") return value;
  if (cycle === "quarterly") return value * 4;
  return value * 12;
};

export const daysUntil = (date, from = new Date()) => {
  const target = startOfDay(date).getTime();
  const base = startOfDay(from).getTime();
  return Math.round((target - base) / (1000 * 60 * 60 * 24));
};

export const withSubscriptionMeta = (doc, from = new Date()) => {
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  const daysLeft = daysUntil(plain.nextBillingDate, from);
  const reminderWindow = Number(plain.reminderDaysBefore ?? 3);

  return {
    ...plain,
    daysUntilBilling: daysLeft,
    isDue: plain.status === "active" && daysLeft <= 0,
    isUpcomingReminder:
      plain.status === "active" &&
      daysLeft > 0 &&
      daysLeft <= reminderWindow,
    monthlyEquivalent: Math.round(toMonthlyAmount(plain.amount, plain.billingCycle)),
    yearlyEquivalent: Math.round(toYearlyAmount(plain.amount, plain.billingCycle)),
  };
};

export const isValidBillingCycle = (cycle) => BILLING_CYCLES.includes(cycle);

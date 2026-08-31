/**
 * utils/subscriptionHelper.js
 * Helpers for subscription billing dates and cost calculations.
 */

/**
 * Normalize a date to midnight (local) for day-level comparisons.
 */
export const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Check if two dates fall on the same calendar day.
 */
export const isSameDay = (dateA, dateB) => {
  const a = startOfDay(dateA);
  const b = startOfDay(dateB);
  return a.getTime() === b.getTime();
};

/**
 * Calculate days between two dates (dateB - dateA).
 */
export const daysBetween = (dateA, dateB) => {
  const a = startOfDay(dateA);
  const b = startOfDay(dateB);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

/**
 * Advance nextBillingDate based on billing cycle.
 */
export const getNextBillingDate = (currentDate, billingCycle) => {
  const next = new Date(currentDate);

  switch (billingCycle) {
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }

  return next;
};

/**
 * Convert subscription amount to monthly equivalent.
 */
export const toMonthlyCost = (amount, billingCycle) => {
  switch (billingCycle) {
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
};

/**
 * Convert subscription amount to yearly equivalent.
 */
export const toYearlyCost = (amount, billingCycle) => {
  switch (billingCycle) {
    case "monthly":
      return amount * 12;
    case "quarterly":
      return amount * 4;
    case "yearly":
      return amount;
    default:
      return amount * 12;
  }
};

/**
 * Calculate total monthly and yearly cost for active subscriptions.
 */
export const calculateCostSummary = (subscriptions) => {
  const active = subscriptions.filter((s) => s.status === "active");

  const totalMonthlyCost = active.reduce(
    (sum, sub) => sum + toMonthlyCost(sub.amount, sub.billingCycle),
    0
  );

  const totalYearlyCost = active.reduce(
    (sum, sub) => sum + toYearlyCost(sub.amount, sub.billingCycle),
    0
  );

  return {
    totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
    totalYearlyCost: Math.round(totalYearlyCost * 100) / 100,
  };
};

/**
 * utils/goalHelper.js
 * Helpers for enriching goal documents with computed fields.
 */

/**
 * Add percentage progress and days remaining to a goal document.
 */
export const enrichGoal = (goal) => {
  const doc = goal.toObject ? goal.toObject() : goal;
  const percentage =
    doc.targetAmount > 0
      ? Math.min(100, Math.round((doc.currentAmount / doc.targetAmount) * 100))
      : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(doc.targetDate);
  target.setHours(0, 0, 0, 0);
  const daysRemaining = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

  return {
    ...doc,
    percentage,
    daysRemaining,
  };
};

/**
 * Auto-complete goal if current amount meets or exceeds target.
 * Returns true if goal was just completed.
 */
export const checkAndCompleteGoal = (goal) => {
  if (goal.status === "active" && goal.currentAmount >= goal.targetAmount) {
    goal.status = "completed";
    return true;
  }
  return false;
};

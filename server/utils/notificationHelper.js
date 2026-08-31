/**
 * utils/notificationHelper.js
 * Reusable helper to create notifications from controllers and cron jobs.
 */

import Notification from "../models/Notification.js";

/**
 * Create a new notification for a user.
 * @param {string} userId - Target user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {string} type - One of budget_alert, bill_reminder, goal_complete, general
 * @returns {Promise<object>} Created notification document
 */
export const createNotification = async (userId, title, message, type) => {
  return Notification.create({
    userId,
    title,
    message,
    type,
  });
};

/**
 * Check if a similar notification was already sent recently (within 24 hours).
 * Prevents duplicate alerts from daily cron runs.
 */
export const hasRecentNotification = async (userId, type, title) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const existing = await Notification.findOne({
    userId,
    type,
    title,
    createdAt: { $gte: since },
  });

  return Boolean(existing);
};

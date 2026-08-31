/**
 * models/Notification.js
 * Mongoose schema for in-app notifications and reminders.
 */

import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "budget_alert",
  "bill_reminder",
  "goal_complete",
  "general",
];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: NOTIFICATION_TYPES,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

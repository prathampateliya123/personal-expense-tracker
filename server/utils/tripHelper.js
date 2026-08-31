/**
 * utils/tripHelper.js
 * Shared helpers for trip validation and spend enrichment.
 */

import Trip from "../models/Trip.js";

/**
 * Validate that a trip belongs to the user. Returns null if tripId is empty.
 */
export const validateUserTrip = async (tripId, userId) => {
  if (!tripId) return null;

  const trip = await Trip.findOne({ _id: tripId, userId });
  if (!trip) {
    const error = new Error("Trip not found");
    error.statusCode = 404;
    throw error;
  }

  return trip;
};

/**
 * Attach spend summary fields to a trip document.
 */
export const enrichTrip = (trip, totalSpent = 0) => {
  const spent = Math.round(totalSpent * 100) / 100;
  const budget = trip.budget || 0;
  const remaining = Math.round((budget - spent) * 100) / 100;
  const percentageUsed =
    budget > 0 ? Math.round((spent / budget) * 10000) / 100 : 0;

  return {
    ...trip.toObject(),
    totalSpent: spent,
    remainingBudget: remaining,
    percentageUsed,
  };
};

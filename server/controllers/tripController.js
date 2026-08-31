/**
 * controllers/tripController.js
 * CRUD and detail operations for trip expense management.
 */

import mongoose from "mongoose";
import Trip, { TRIP_STATUSES } from "../models/Trip.js";
import Expense from "../models/Expense.js";
import { enrichTrip } from "../utils/tripHelper.js";

/**
 * Aggregate total spend per trip for a user.
 */
const getSpentByTripMap = async (userId, tripIds = null) => {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
    tripId: { $ne: null },
  };

  if (tripIds?.length) {
    match.tripId = {
      $in: tripIds.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }

  const results = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$tripId",
        totalSpent: { $sum: "$amount" },
      },
    },
  ]);

  return Object.fromEntries(
    results.map((r) => [r._id.toString(), r.totalSpent])
  );
};

/**
 * @route   POST /api/trips
 * @desc    Create a new trip
 * @access  Private
 */
export const createTrip = async (req, res, next) => {
  try {
    const { tripName, destination, startDate, endDate, budget, currency } =
      req.body;

    if (!tripName || !destination || !startDate || !endDate || budget == null) {
      res.status(400);
      throw new Error(
        "Please provide tripName, destination, startDate, endDate, and budget"
      );
    }

    if (new Date(endDate) < new Date(startDate)) {
      res.status(400);
      throw new Error("End date must be on or after start date");
    }

    const trip = await Trip.create({
      userId: req.user._id,
      tripName,
      destination,
      startDate,
      endDate,
      budget,
      currency: currency || "INR",
    });

    res.status(201).json({ success: true, trip: enrichTrip(trip, 0) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/trips
 * @desc    Get all trips with spend summary
 * @access  Private
 */
export const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({
      status: 1,
      startDate: -1,
    });

    const spentMap = await getSpentByTripMap(req.user._id);

    res.status(200).json({
      success: true,
      trips: trips.map((trip) =>
        enrichTrip(trip, spentMap[trip._id.toString()] || 0)
      ),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/trips/:id
 * @desc    Get trip details with expenses and category breakdown
 * @access  Private
 */
export const getTripDetails = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }

    const expenses = await Expense.find({
      userId: req.user._id,
      tripId: trip._id,
    }).sort({ date: -1, amount: -1 });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const enriched = enrichTrip(trip, totalSpent);

    const categoryResults = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          tripId: trip._id,
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categoryBreakdown = categoryResults.map((item) => ({
      category: item._id,
      total: Math.round(item.total * 100) / 100,
      percentage:
        totalSpent > 0
          ? Math.round((item.total / totalSpent) * 10000) / 100
          : 0,
    }));

    res.status(200).json({
      success: true,
      trip: enriched,
      expenses,
      summary: {
        totalSpent: enriched.totalSpent,
        budget: enriched.budget,
        remaining: enriched.remainingBudget,
        percentageUsed: enriched.percentageUsed,
        currency: enriched.currency,
      },
      categoryBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/trips/:id
 * @desc    Update a trip
 * @access  Private
 */
export const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }

    const {
      tripName,
      destination,
      startDate,
      endDate,
      budget,
      currency,
      status,
    } = req.body;

    if (status && !TRIP_STATUSES.includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }

    if (tripName !== undefined) trip.tripName = tripName;
    if (destination !== undefined) trip.destination = destination;
    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    if (budget !== undefined) trip.budget = budget;
    if (currency !== undefined) trip.currency = currency;
    if (status !== undefined) trip.status = status;

    if (trip.endDate < trip.startDate) {
      res.status(400);
      throw new Error("End date must be on or after start date");
    }

    await trip.save();

    const spentMap = await getSpentByTripMap(req.user._id, [trip._id]);
    res.status(200).json({
      success: true,
      trip: enrichTrip(trip, spentMap[trip._id.toString()] || 0),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/trips/:id/close
 * @desc    Mark a trip as completed
 * @access  Private
 */
export const closeTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }

    if (trip.status === "completed") {
      res.status(400);
      throw new Error("Trip is already completed");
    }

    trip.status = "completed";
    await trip.save();

    const spentMap = await getSpentByTripMap(req.user._id, [trip._id]);
    res.status(200).json({
      success: true,
      trip: enrichTrip(trip, spentMap[trip._id.toString()] || 0),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/trips/:id
 * @desc    Delete a trip and unlink its expenses
 * @access  Private
 */
export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }

    await Expense.updateMany(
      { userId: req.user._id, tripId: trip._id },
      { $set: { tripId: null } }
    );

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
      tripId: trip._id,
    });
  } catch (error) {
    next(error);
  }
};

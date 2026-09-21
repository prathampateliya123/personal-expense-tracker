import mongoose from "mongoose";
import Trip, {
  TRIP_STATUSES,
  TRIP_EXPENSE_CATEGORIES,
} from "../models/Trip.js";
import TripExpense from "../models/TripExpense.js";
import { findOwnedDocument } from "../utils/findOwned.js";
import { escapeRegex } from "../utils/namedEntity.js";
import { buildTripSummary, round2 } from "../utils/tripSettlement.js";

const findOwnedTrip = (id, userId) =>
  findOwnedDocument(Trip, id, userId, {
    key: "trip",
    notFoundMessage: "Trip not found",
    forbiddenMessage: "Not authorized to access this trip",
  });

const findOwnedTripExpense = (id, userId) =>
  findOwnedDocument(TripExpense, id, userId, {
    key: "expense",
    notFoundMessage: "Trip expense not found",
    forbiddenMessage: "Not authorized to access this expense",
  });

const normalizeMembers = (members = []) => {
  if (!Array.isArray(members) || members.length < 1) {
    return { error: "Add at least one trip member" };
  }

  const cleaned = [];
  const seen = new Set();

  for (const raw of members) {
    const name = String(raw?.name || "").trim();
    if (!name) return { error: "Member name cannot be empty" };
    if (name.length > 60) return { error: "Member name is too long" };
    const key = name.toLowerCase();
    if (seen.has(key)) return { error: `Duplicate member: ${name}` };
    seen.add(key);
    cleaned.push({
      name,
      isSelf: Boolean(raw?.isSelf),
      ...(raw?._id ? { _id: raw._id } : {}),
    });
  }

  if (!cleaned.some((m) => m.isSelf)) {
    cleaned[0].isSelf = true;
  }

  return { members: cleaned };
};

const memberIdsOnTrip = (trip) =>
  new Set((trip.members || []).map((m) => String(m._id)));

const validateExpenseBody = (body, trip, { isUpdate = false } = {}) => {
  const ids = memberIdsOnTrip(trip);

  if (!isUpdate || body.title !== undefined) {
    if (!String(body.title || "").trim()) return "Expense title is required";
  }

  if (!isUpdate || body.amount !== undefined) {
    const amount = Number(body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return "Amount must be greater than zero";
    }
  }

  if (!isUpdate || body.category !== undefined) {
    if (
      body.category &&
      !TRIP_EXPENSE_CATEGORIES.includes(body.category)
    ) {
      return "Invalid expense category";
    }
  }

  if (!isUpdate || body.paidBy !== undefined) {
    if (!body.paidBy || !ids.has(String(body.paidBy))) {
      return "Who paid must be a trip member";
    }
  }

  if (!isUpdate || body.splitAmong !== undefined) {
    const splitAmong = Array.isArray(body.splitAmong) ? body.splitAmong : [];
    if (!splitAmong.length) return "Select at least one member to split with";
    for (const id of splitAmong) {
      if (!ids.has(String(id))) return "Split members must belong to this trip";
    }
  }

  return null;
};

const loadTripBundle = async (trip) => {
  const expenses = await TripExpense.find({ tripId: trip._id }).sort({
    date: -1,
    createdAt: -1,
  });
  const summary = buildTripSummary(trip, expenses);
  return { trip, expenses, summary };
};

export const getTripStats = async (req, res, next) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).lean();
    const tripIds = trips.map((t) => t._id);
    const expenseAgg = await TripExpense.aggregate([
      { $match: { tripId: { $in: tripIds } } },
      {
        $group: {
          _id: "$tripId",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    const byTrip = Object.fromEntries(
      expenseAgg.map((row) => [String(row._id), row])
    );

    let totalSpend = 0;
    let unsettled = 0;
    for (const trip of trips) {
      const spend = byTrip[String(trip._id)]?.total || 0;
      totalSpend += spend;
      if (trip.status !== "settled" && trip.status !== "archived") {
        unsettled += 1;
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalTrips: trips.length,
        activeTrips: trips.filter((t) => t.status === "active").length,
        unsettledTrips: unsettled,
        totalSpend: round2(totalSpend),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const filter = { userId: req.user._id };

    if (req.query.status && TRIP_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.search?.trim()) {
      filter.title = {
        $regex: escapeRegex(req.query.search.trim()),
        $options: "i",
      };
    }

    const [items, totalCount] = await Promise.all([
      Trip.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Trip.countDocuments(filter),
    ]);

    const tripIds = items.map((t) => t._id);
    const expenseAgg = await TripExpense.aggregate([
      { $match: { tripId: { $in: tripIds } } },
      {
        $group: {
          _id: "$tripId",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    const byTrip = Object.fromEntries(
      expenseAgg.map((row) => [String(row._id), row])
    );

    const trips = items.map((trip) => {
      const plain = trip.toObject();
      const agg = byTrip[String(trip._id)];
      return {
        ...plain,
        totalSpend: round2(agg?.total || 0),
        expenseCount: agg?.count || 0,
        memberCount: plain.members?.length || 0,
      };
    });

    res.status(200).json({
      success: true,
      trips,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const { trip, status, message } = await findOwnedTrip(
      req.params.id,
      req.user._id
    );
    if (!trip) {
      res.status(status);
      throw new Error(message);
    }

    const bundle = await loadTripBundle(trip);
    res.status(200).json({
      success: true,
      ...bundle,
    });
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    if (!req.body.title?.trim()) {
      res.status(400);
      throw new Error("Trip title is required");
    }

    const memberResult = normalizeMembers(req.body.members);
    if (memberResult.error) {
      res.status(400);
      throw new Error(memberResult.error);
    }

    const status = TRIP_STATUSES.includes(req.body.status)
      ? req.body.status
      : "active";

    const trip = await Trip.create({
      userId: req.user._id,
      title: String(req.body.title).trim(),
      destination: req.body.destination
        ? String(req.body.destination).trim()
        : "",
      startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      status,
      notes: req.body.notes ? String(req.body.notes).trim() : "",
      members: memberResult.members,
      settlements: [],
    });

    res.status(201).json({
      success: true,
      message: "Trip created",
      trip,
      expenses: [],
      summary: buildTripSummary(trip, []),
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const { trip, status, message } = await findOwnedTrip(
      req.params.id,
      req.user._id
    );
    if (!trip) {
      res.status(status);
      throw new Error(message);
    }

    if (req.body.title !== undefined) {
      if (!String(req.body.title).trim()) {
        res.status(400);
        throw new Error("Trip title cannot be empty");
      }
      trip.title = String(req.body.title).trim();
    }
    if (req.body.destination !== undefined) {
      trip.destination = String(req.body.destination || "").trim();
    }
    if (req.body.startDate !== undefined) {
      trip.startDate = req.body.startDate ? new Date(req.body.startDate) : null;
    }
    if (req.body.endDate !== undefined) {
      trip.endDate = req.body.endDate ? new Date(req.body.endDate) : null;
    }
    if (req.body.status !== undefined) {
      if (!TRIP_STATUSES.includes(req.body.status)) {
        res.status(400);
        throw new Error("Invalid trip status");
      }
      trip.status = req.body.status;
    }
    if (req.body.notes !== undefined) {
      trip.notes = String(req.body.notes || "").trim();
    }

    if (req.body.members !== undefined) {
      const memberResult = normalizeMembers(req.body.members);
      if (memberResult.error) {
        res.status(400);
        throw new Error(memberResult.error);
      }

      const nextIds = new Set(
        memberResult.members
          .filter((m) => m._id)
          .map((m) => String(m._id))
      );
      const removedIds = (trip.members || [])
        .map((m) => String(m._id))
        .filter((id) => !nextIds.has(id));

      if (removedIds.length) {
        const linked = await TripExpense.countDocuments({
          tripId: trip._id,
          $or: [
            { paidBy: { $in: removedIds } },
            { splitAmong: { $in: removedIds } },
          ],
        });
        if (linked > 0) {
          res.status(400);
          throw new Error(
            "Cannot remove members who are part of existing expenses"
          );
        }
      }

      trip.members = memberResult.members;
    }

    await trip.save();
    const bundle = await loadTripBundle(trip);

    res.status(200).json({
      success: true,
      message: "Trip updated",
      ...bundle,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const { trip, status, message } = await findOwnedTrip(
      req.params.id,
      req.user._id
    );
    if (!trip) {
      res.status(status);
      throw new Error(message);
    }

    await TripExpense.deleteMany({ tripId: trip._id });
    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: "Trip deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const addTripExpense = async (req, res, next) => {
  try {
    const { trip, status, message } = await findOwnedTrip(
      req.params.id,
      req.user._id
    );
    if (!trip) {
      res.status(status);
      throw new Error(message);
    }

    const validationError = validateExpenseBody(req.body, trip);
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const expense = await TripExpense.create({
      userId: req.user._id,
      tripId: trip._id,
      title: String(req.body.title).trim(),
      amount: Number(req.body.amount),
      category: req.body.category || "Other",
      paidBy: req.body.paidBy,
      splitAmong: req.body.splitAmong,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      notes: req.body.notes ? String(req.body.notes).trim() : "",
    });

    const bundle = await loadTripBundle(trip);
    res.status(201).json({
      success: true,
      message: "Expense added",
      expense,
      ...bundle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTripExpense = async (req, res, next) => {
  try {
    const { expense, status, message } = await findOwnedTripExpense(
      req.params.expenseId,
      req.user._id
    );
    if (!expense) {
      res.status(status);
      throw new Error(message);
    }

    const { trip, status: tripStatus, message: tripMessage } =
      await findOwnedTrip(expense.tripId, req.user._id);
    if (!trip) {
      res.status(tripStatus);
      throw new Error(tripMessage);
    }

    const validationError = validateExpenseBody(req.body, trip, {
      isUpdate: true,
    });
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    if (req.body.title !== undefined) expense.title = String(req.body.title).trim();
    if (req.body.amount !== undefined) expense.amount = Number(req.body.amount);
    if (req.body.category !== undefined) expense.category = req.body.category;
    if (req.body.paidBy !== undefined) expense.paidBy = req.body.paidBy;
    if (req.body.splitAmong !== undefined) {
      expense.splitAmong = req.body.splitAmong;
    }
    if (req.body.date !== undefined) {
      expense.date = req.body.date ? new Date(req.body.date) : expense.date;
    }
    if (req.body.notes !== undefined) {
      expense.notes = String(req.body.notes || "").trim();
    }

    await expense.save();
    const bundle = await loadTripBundle(trip);

    res.status(200).json({
      success: true,
      message: "Expense updated",
      expense,
      ...bundle,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTripExpense = async (req, res, next) => {
  try {
    const { expense, status, message } = await findOwnedTripExpense(
      req.params.expenseId,
      req.user._id
    );
    if (!expense) {
      res.status(status);
      throw new Error(message);
    }

    const { trip, status: tripStatus, message: tripMessage } =
      await findOwnedTrip(expense.tripId, req.user._id);
    if (!trip) {
      res.status(tripStatus);
      throw new Error(tripMessage);
    }

    await expense.deleteOne();
    const bundle = await loadTripBundle(trip);

    res.status(200).json({
      success: true,
      message: "Expense deleted",
      ...bundle,
    });
  } catch (error) {
    next(error);
  }
};

export const recordTripSettlement = async (req, res, next) => {
  try {
    const { trip, status, message } = await findOwnedTrip(
      req.params.id,
      req.user._id
    );
    if (!trip) {
      res.status(status);
      throw new Error(message);
    }

    const ids = memberIdsOnTrip(trip);
    const fromMemberId = String(req.body.fromMemberId || "");
    const toMemberId = String(req.body.toMemberId || "");
    const amount = Number(req.body.amount);

    if (!ids.has(fromMemberId) || !ids.has(toMemberId)) {
      res.status(400);
      throw new Error("Settlement members must belong to this trip");
    }
    if (fromMemberId === toMemberId) {
      res.status(400);
      throw new Error("Payer and receiver must be different");
    }
    if (Number.isNaN(amount) || amount <= 0) {
      res.status(400);
      throw new Error("Settlement amount must be greater than zero");
    }

    trip.settlements.push({
      fromMemberId: new mongoose.Types.ObjectId(fromMemberId),
      toMemberId: new mongoose.Types.ObjectId(toMemberId),
      amount: round2(amount),
      notes: req.body.notes ? String(req.body.notes).trim() : "",
      settledAt: new Date(),
    });

    const expenses = await TripExpense.find({ tripId: trip._id });
    const summary = buildTripSummary(trip, expenses);
    if (summary.isFullySettled && trip.status === "active") {
      trip.status = "settled";
    }

    await trip.save();
    const bundle = await loadTripBundle(trip);

    res.status(200).json({
      success: true,
      message: "Settlement recorded",
      ...bundle,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTripSettlement = async (req, res, next) => {
  try {
    const { trip, status, message } = await findOwnedTrip(
      req.params.id,
      req.user._id
    );
    if (!trip) {
      res.status(status);
      throw new Error(message);
    }

    const settlementId = String(req.params.settlementId);
    const before = trip.settlements.length;
    trip.settlements = trip.settlements.filter(
      (s) => String(s._id) !== settlementId
    );

    if (trip.settlements.length === before) {
      res.status(404);
      throw new Error("Settlement not found");
    }

    if (trip.status === "settled") {
      trip.status = "active";
    }

    await trip.save();
    const bundle = await loadTripBundle(trip);

    res.status(200).json({
      success: true,
      message: "Settlement removed",
      ...bundle,
    });
  } catch (error) {
    next(error);
  }
};

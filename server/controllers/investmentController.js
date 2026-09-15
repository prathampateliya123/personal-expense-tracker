/**
 * controllers/investmentController.js
 * CRUD + portfolio stats for investments.
 */

import Investment, { INVESTMENT_TYPES } from "../models/Investment.js";

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findOwnedInvestment = async (id, userId) => {
  const investment = await Investment.findById(id);
  if (!investment) {
    return {
      investment: null,
      status: 404,
      message: "Investment not found",
    };
  }
  if (investment.userId.toString() !== userId.toString()) {
    return {
      investment: null,
      status: 403,
      message: "Not authorized to access this investment",
    };
  }
  return { investment, status: null, message: null };
};

const withReturns = (doc) => {
  const plain = doc.toObject ? doc.toObject() : doc;
  const invested = plain.amountInvested || 0;
  const current = plain.currentValue || 0;
  const gainLoss = current - invested;
  const returnPercent =
    invested > 0 ? Math.round((gainLoss / invested) * 1000) / 10 : 0;
  return {
    ...plain,
    gainLoss,
    returnPercent,
  };
};

const validateInvestmentBody = (body, { isUpdate = false } = {}) => {
  const {
    name,
    type,
    amountInvested,
    currentValue,
    purchaseDate,
    institution,
    notes,
  } = body;

  if (!isUpdate) {
    if (!name?.trim()) return "Investment name is required";
    if (!type) return "Investment type is required";
    if (
      amountInvested === undefined ||
      amountInvested === null ||
      amountInvested === ""
    ) {
      return "Invested amount is required";
    }
    if (
      currentValue === undefined ||
      currentValue === null ||
      currentValue === ""
    ) {
      return "Current value is required";
    }
  }

  if (name !== undefined && !String(name).trim()) {
    return "Investment name cannot be empty";
  }

  if (type !== undefined && !INVESTMENT_TYPES.includes(type)) {
    return "Invalid investment type";
  }

  if (
    amountInvested !== undefined &&
    amountInvested !== null &&
    amountInvested !== ""
  ) {
    const num = Number(amountInvested);
    if (Number.isNaN(num) || num <= 0) {
      return "Invested amount must be a positive number";
    }
  }

  if (
    currentValue !== undefined &&
    currentValue !== null &&
    currentValue !== ""
  ) {
    const num = Number(currentValue);
    if (Number.isNaN(num) || num < 0) {
      return "Current value cannot be negative";
    }
  }

  if (purchaseDate !== undefined && purchaseDate !== null && purchaseDate !== "") {
    const d = new Date(purchaseDate);
    if (Number.isNaN(d.getTime())) return "Invalid purchase date";
  }

  if (institution !== undefined && String(institution).length > 80) {
    return "Institution cannot exceed 80 characters";
  }

  if (notes !== undefined && String(notes).length > 300) {
    return "Notes cannot exceed 300 characters";
  }

  return null;
};

/**
 * @route GET /api/investments/stats
 */
export const getInvestmentStats = async (req, res, next) => {
  try {
    const [summary, byType] = await Promise.all([
      Investment.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalInvested: { $sum: "$amountInvested" },
            totalCurrent: { $sum: "$currentValue" },
          },
        },
      ]),
      Investment.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            totalInvested: { $sum: "$amountInvested" },
            totalCurrent: { $sum: "$currentValue" },
          },
        },
        { $sort: { totalCurrent: -1 } },
      ]),
    ]);

    const totalInvested = summary[0]?.totalInvested || 0;
    const totalCurrent = summary[0]?.totalCurrent || 0;
    const gainLoss = totalCurrent - totalInvested;

    res.status(200).json({
      success: true,
      stats: {
        count: summary[0]?.count || 0,
        totalInvested,
        totalCurrent,
        gainLoss,
        returnPercent:
          totalInvested > 0
            ? Math.round((gainLoss / totalInvested) * 1000) / 10
            : 0,
        byType: byType.map((row) => ({
          type: row._id,
          count: row.count,
          totalInvested: row.totalInvested,
          totalCurrent: row.totalCurrent,
          gainLoss: row.totalCurrent - row.totalInvested,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/investments/types
 */
export const getInvestmentTypes = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      types: INVESTMENT_TYPES,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/investments
 */
export const getInvestments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.type && INVESTMENT_TYPES.includes(req.query.type)) {
      filter.type = req.query.type;
    }
    if (req.query.search?.trim()) {
      filter.$or = [
        { name: { $regex: escapeRegex(req.query.search.trim()), $options: "i" } },
        {
          institution: {
            $regex: escapeRegex(req.query.search.trim()),
            $options: "i",
          },
        },
      ];
    }

    const [rows, totalCount] = await Promise.all([
      Investment.find(filter)
        .sort({ purchaseDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Investment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      investments: rows.map(withReturns),
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/investments/:id
 */
export const getInvestmentById = async (req, res, next) => {
  try {
    const { investment, status, message } = await findOwnedInvestment(
      req.params.id,
      req.user._id
    );
    if (!investment) {
      res.status(status);
      throw new Error(message);
    }
    res.status(200).json({
      success: true,
      investment: withReturns(investment),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/investments
 */
export const createInvestment = async (req, res, next) => {
  try {
    const validationError = validateInvestmentBody(req.body);
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const investment = await Investment.create({
      userId: req.user._id,
      name: String(req.body.name).trim(),
      type: req.body.type,
      amountInvested: Number(req.body.amountInvested),
      currentValue: Number(req.body.currentValue),
      purchaseDate: req.body.purchaseDate
        ? new Date(req.body.purchaseDate)
        : new Date(),
      institution: req.body.institution?.trim() || "",
      notes: req.body.notes?.trim() || "",
    });

    res.status(201).json({
      success: true,
      investment: withReturns(investment),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/investments/:id
 */
export const updateInvestment = async (req, res, next) => {
  try {
    const validationError = validateInvestmentBody(req.body, { isUpdate: true });
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { investment, status, message } = await findOwnedInvestment(
      req.params.id,
      req.user._id
    );
    if (!investment) {
      res.status(status);
      throw new Error(message);
    }

    if (req.body.name !== undefined) {
      investment.name = String(req.body.name).trim();
    }
    if (req.body.type !== undefined) investment.type = req.body.type;
    if (req.body.amountInvested !== undefined) {
      investment.amountInvested = Number(req.body.amountInvested);
    }
    if (req.body.currentValue !== undefined) {
      investment.currentValue = Number(req.body.currentValue);
    }
    if (req.body.purchaseDate !== undefined) {
      investment.purchaseDate = new Date(req.body.purchaseDate);
    }
    if (req.body.institution !== undefined) {
      investment.institution = String(req.body.institution).trim();
    }
    if (req.body.notes !== undefined) {
      investment.notes = String(req.body.notes).trim();
    }

    await investment.save();
    res.status(200).json({
      success: true,
      investment: withReturns(investment),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/investments/:id
 */
export const deleteInvestment = async (req, res, next) => {
  try {
    const { investment, status, message } = await findOwnedInvestment(
      req.params.id,
      req.user._id
    );
    if (!investment) {
      res.status(status);
      throw new Error(message);
    }
    await investment.deleteOne();
    res.status(200).json({
      success: true,
      message: "Investment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

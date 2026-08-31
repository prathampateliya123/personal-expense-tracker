/**
 * controllers/investmentController.js
 * CRUD operations for investment tracking with portfolio summary.
 */

import Investment, {
  INVESTMENT_TYPES,
  INVESTMENT_FREQUENCIES,
} from "../models/Investment.js";
import {
  enrichInvestment,
  computePortfolioSummary,
  groupByType,
} from "../utils/investmentHelper.js";

/**
 * @route   POST /api/investments
 * @desc    Add a new investment
 * @access  Private
 */
export const addInvestment = async (req, res, next) => {
  try {
    const {
      type,
      name,
      investedAmount,
      currentValue,
      startDate,
      maturityDate,
      frequency,
    } = req.body;

    if (
      !type ||
      !name ||
      investedAmount == null ||
      currentValue == null ||
      !startDate ||
      !frequency
    ) {
      res.status(400);
      throw new Error(
        "Please provide type, name, investedAmount, currentValue, startDate, and frequency"
      );
    }

    if (!INVESTMENT_TYPES.includes(type)) {
      res.status(400);
      throw new Error("Invalid investment type");
    }

    if (!INVESTMENT_FREQUENCIES.includes(frequency)) {
      res.status(400);
      throw new Error("Invalid frequency");
    }

    const investment = await Investment.create({
      userId: req.user._id,
      type,
      name,
      investedAmount,
      currentValue,
      startDate,
      maturityDate: maturityDate || null,
      frequency,
    });

    res.status(201).json({
      success: true,
      investment: enrichInvestment(investment),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/investments
 * @desc    Get all investments with portfolio summary and type breakdown
 * @access  Private
 */
export const getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    const enriched = investments.map(enrichInvestment);
    const summary = computePortfolioSummary(enriched);
    const typeBreakdown = groupByType(enriched);

    res.status(200).json({
      success: true,
      investments: enriched,
      summary,
      typeBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/investments/:id
 * @desc    Update an investment
 * @access  Private
 */
export const updateInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!investment) {
      res.status(404);
      throw new Error("Investment not found");
    }

    const {
      type,
      name,
      investedAmount,
      currentValue,
      startDate,
      maturityDate,
      frequency,
    } = req.body;

    if (type && !INVESTMENT_TYPES.includes(type)) {
      res.status(400);
      throw new Error("Invalid investment type");
    }

    if (frequency && !INVESTMENT_FREQUENCIES.includes(frequency)) {
      res.status(400);
      throw new Error("Invalid frequency");
    }

    if (type !== undefined) investment.type = type;
    if (name !== undefined) investment.name = name;
    if (investedAmount !== undefined) investment.investedAmount = investedAmount;
    if (currentValue !== undefined) investment.currentValue = currentValue;
    if (startDate !== undefined) investment.startDate = startDate;
    if (maturityDate !== undefined) investment.maturityDate = maturityDate || null;
    if (frequency !== undefined) investment.frequency = frequency;

    await investment.save();

    res.status(200).json({
      success: true,
      investment: enrichInvestment(investment),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/investments/:id
 * @desc    Delete an investment
 * @access  Private
 */
export const deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!investment) {
      res.status(404);
      throw new Error("Investment not found");
    }

    res.status(200).json({
      success: true,
      message: "Investment deleted successfully",
      investmentId: investment._id,
    });
  } catch (error) {
    next(error);
  }
};

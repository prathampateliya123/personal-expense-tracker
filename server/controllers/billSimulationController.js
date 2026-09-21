import BillSimulation, {
  BILL_TYPES,
  BILL_FREQUENCIES,
  isEmiBillType,
} from "../models/BillSimulation.js";
import { findOwnedDocument } from "../utils/findOwned.js";
import { escapeRegex } from "../utils/namedEntity.js";
import {
  calculateEmi,
  calculateBillProjection,
} from "../utils/emiCalculator.js";

const findOwnedSimulation = (id, userId) =>
  findOwnedDocument(BillSimulation, id, userId, {
    key: "simulation",
    notFoundMessage: "Simulation not found",
    forbiddenMessage: "Not authorized to access this simulation",
  });

const buildComputedFields = (body) => {
  const billType = body.billType;

  if (!BILL_TYPES.includes(billType)) {
    return { error: "Invalid bill type" };
  }

  if (isEmiBillType(billType)) {
    const result = calculateEmi({
      loanAmount: body.loanAmount,
      interestRate: body.interestRate,
      tenureMonths: body.tenureMonths,
      paidEmis: body.paidEmis,
    });
    if (result.error) return { error: result.error };

    return {
      loanAmount: Number(body.loanAmount),
      interestRate: Number(body.interestRate),
      tenureMonths: parseInt(body.tenureMonths, 10),
      paidEmis: result.paidEmis,
      billAmount: null,
      frequency: "monthly",
      monthlyEmi: result.monthlyEmi,
      totalInterest: result.totalInterest,
      totalPayment: result.totalPayment,
      outstandingPrincipal: result.outstandingPrincipal,
      remainingEmis: result.remainingEmis,
      remainingInterest: result.remainingInterest,
      remainingPayment: result.remainingPayment,
      paidAmount: result.paidAmount,
      monthlyEquivalent: result.monthlyEmi,
      yearlyCost: Math.round(result.monthlyEmi * 12 * 100) / 100,
      schedule: result.schedule,
    };
  }

  const frequency = body.frequency || "monthly";
  if (!BILL_FREQUENCIES.includes(frequency)) {
    return { error: "Invalid frequency" };
  }

  const result = calculateBillProjection({
    billAmount: body.billAmount,
    frequency,
  });
  if (result.error) return { error: result.error };

  return {
    loanAmount: null,
    interestRate: null,
    tenureMonths: null,
    paidEmis: 0,
    billAmount: Number(body.billAmount),
    frequency,
    monthlyEmi: null,
    totalInterest: null,
    totalPayment: null,
    outstandingPrincipal: null,
    remainingEmis: null,
    remainingInterest: null,
    remainingPayment: null,
    paidAmount: null,
    monthlyEquivalent: result.monthlyEquivalent,
    yearlyCost: result.yearlyCost,
    schedule: [],
  };
};

export const calculateBill = async (req, res, next) => {
  try {
    const computed = buildComputedFields(req.body);
    if (computed.error) {
      res.status(400);
      throw new Error(computed.error);
    }

    const { schedule, ...snapshot } = computed;

    res.status(200).json({
      success: true,
      result: {
        billType: req.body.billType,
        ...snapshot,
        schedule: schedule?.slice(0, 12) || [],
        scheduleFullLength: schedule?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBillSimulations = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const filter = { userId: req.user._id };

    if (req.query.billType && BILL_TYPES.includes(req.query.billType)) {
      filter.billType = req.query.billType;
    }
    if (req.query.search?.trim()) {
      filter.title = {
        $regex: escapeRegex(req.query.search.trim()),
        $options: "i",
      };
    }

    const [items, totalCount] = await Promise.all([
      BillSimulation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BillSimulation.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      simulations: items,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

export const getBillSimulationStats = async (req, res, next) => {
  try {
    const items = await BillSimulation.find({ userId: req.user._id }).lean();

    const emiCount = items.filter((i) => isEmiBillType(i.billType)).length;
    const billCount = items.length - emiCount;
    const monthlyLoad = items.reduce(
      (sum, i) => sum + (Number(i.monthlyEquivalent) || 0),
      0
    );
    const yearlyLoad = items.reduce(
      (sum, i) => sum + (Number(i.yearlyCost) || 0),
      0
    );

    res.status(200).json({
      success: true,
      stats: {
        total: items.length,
        emiCount,
        billCount,
        monthlyLoad: Math.round(monthlyLoad),
        yearlyLoad: Math.round(yearlyLoad),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBillSimulation = async (req, res, next) => {
  try {
    if (!req.body.title?.trim()) {
      res.status(400);
      throw new Error("Title is required");
    }

    const computed = buildComputedFields(req.body);
    if (computed.error) {
      res.status(400);
      throw new Error(computed.error);
    }

    const { schedule, ...snapshot } = computed;

    const simulation = await BillSimulation.create({
      userId: req.user._id,
      title: String(req.body.title).trim(),
      billType: req.body.billType,
      notes: req.body.notes ? String(req.body.notes).trim() : "",
      ...snapshot,
    });

    res.status(201).json({
      success: true,
      message: "Simulation saved",
      simulation,
      schedulePreview: schedule?.slice(0, 12) || [],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBillSimulation = async (req, res, next) => {
  try {
    const { simulation, status, message } = await findOwnedSimulation(
      req.params.id,
      req.user._id
    );

    if (!simulation) {
      res.status(status);
      throw new Error(message);
    }

    await simulation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Simulation deleted",
    });
  } catch (error) {
    next(error);
  }
};

import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import Expense from "../models/Expense.js";

const parsePeriod = (query = {}) => {
  const now = new Date();
  const year = parseInt(query.year, 10) || now.getFullYear();
  const month = parseInt(query.month, 10) || now.getMonth() + 1;

  if (year < 2000 || year > 2100) {
    return { error: "Invalid year" };
  }
  if (month < 1 || month > 12) {
    return { error: "Invalid month" };
  }

  return { year, month };
};

const monthRange = (year, month) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const getSpendBreakdown = async (userId, year, month) => {
  const { start, end } = monthRange(year, month);
  const match = {
    userId,
    date: { $gte: start, $lte: end },
  };

  const [summary, byCategory] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { spent: -1 } },
    ]),
  ]);

  return {
    totalSpent: summary[0]?.totalSpent || 0,
    expenseCount: summary[0]?.count || 0,
    byCategory: byCategory.map((row) => ({
      category: row._id,
      spent: row.spent,
      count: row.count,
    })),
  };
};

const buildProgress = (budget, spend) => {
  const totalAmount = budget?.totalAmount || 0;
  const totalSpent = spend.totalSpent || 0;
  const remaining = Math.max(0, totalAmount - totalSpent);
  const percentUsed =
    totalAmount > 0
      ? Math.min(100, Math.round((totalSpent / totalAmount) * 100))
      : 0;

  const spentMap = Object.fromEntries(
    (spend.byCategory || []).map((row) => [row.category, row])
  );

  const allocations = (budget?.allocations || []).map((item) => {
    const spentInfo = spentMap[item.category] || { spent: 0, count: 0 };
    const allocated = item.amount || 0;
    const spent = spentInfo.spent || 0;
    return {
      category: item.category,
      amount: allocated,
      spent,
      remaining: Math.max(0, allocated - spent),
      percentUsed:
        allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0,
      count: spentInfo.count || 0,
      overBudget: spent > allocated && allocated > 0,
    };
  });

  const allocatedTotal = allocations.reduce((sum, row) => sum + row.amount, 0);
  const unallocatedBudget = Math.max(0, totalAmount - allocatedTotal);

  return {
    totalAmount,
    totalSpent,
    remaining,
    percentUsed,
    overBudget: totalSpent > totalAmount && totalAmount > 0,
    allocatedTotal,
    unallocatedBudget,
    expenseCount: spend.expenseCount || 0,
    allocations,
    byCategory: spend.byCategory || [],
  };
};

const findOwnedBudget = async (id, userId) => {
  const budget = await Budget.findById(id);
  if (!budget) {
    return { budget: null, status: 404, message: "Budget not found" };
  }
  if (budget.userId.toString() !== userId.toString()) {
    return {
      budget: null,
      status: 403,
      message: "Not authorized to access this budget",
    };
  }
  return { budget, status: null, message: null };
};

const validateAllocations = async (userId, allocations = []) => {
  if (!Array.isArray(allocations)) {
    return "Allocations must be an array";
  }

  const cleaned = [];
  const seen = new Set();

  for (const row of allocations) {
    const category = String(row?.category || "").trim();
    const amount = Number(row?.amount);

    if (!category) continue;
    if (Number.isNaN(amount) || amount < 0) {
      return `Invalid allocation amount for "${category}"`;
    }
    if (amount === 0) continue;
    if (seen.has(category.toLowerCase())) {
      return `Duplicate allocation for "${category}"`;
    }
    seen.add(category.toLowerCase());
    cleaned.push({ category, amount });
  }

  if (cleaned.length === 0) return { allocations: [] };

  const names = cleaned.map((row) => row.category);
  const existing = await Category.find({
    userId,
    type: "expense",
    name: { $in: names },
  }).select("name");

  const existingNames = new Set(existing.map((cat) => cat.name));
  for (const row of cleaned) {
    if (!existingNames.has(row.category)) {
      return `Invalid expense category: "${row.category}"`;
    }
  }

  return { allocations: cleaned };
};



export const getBudgets = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    const year = parseInt(req.query.year, 10);
    if (!Number.isNaN(year)) filter.year = year;

    const budgets = await Budget.find(filter)
      .sort({ year: -1, month: -1 })
      .limit(24)
      .lean();

    res.status(200).json({
      success: true,
      budgets,
    });
  } catch (error) {
    next(error);
  }
};



export const getBudgetCurrent = async (req, res, next) => {
  try {
    const period = parsePeriod(req.query);
    if (period.error) {
      res.status(400);
      throw new Error(period.error);
    }

    const { year, month } = period;
    const [budget, spend] = await Promise.all([
      Budget.findOne({ userId: req.user._id, year, month }).lean(),
      getSpendBreakdown(req.user._id, year, month),
    ]);

    const progress = buildProgress(budget, spend);

    res.status(200).json({
      success: true,
      year,
      month,
      budget: budget || null,
      progress,
    });
  } catch (error) {
    next(error);
  }
};



export const upsertBudget = async (req, res, next) => {
  try {
    const period = parsePeriod(req.body);
    if (period.error) {
      res.status(400);
      throw new Error(period.error);
    }

    const { year, month } = period;
    const totalAmount = Number(req.body.totalAmount);
    const notes =
      req.body.notes !== undefined ? String(req.body.notes).trim() : "";

    if (Number.isNaN(totalAmount) || totalAmount <= 0) {
      res.status(400);
      throw new Error("Total budget must be a positive number");
    }

    const allocationResult = await validateAllocations(
      req.user._id,
      req.body.allocations || []
    );
    if (typeof allocationResult === "string") {
      res.status(400);
      throw new Error(allocationResult);
    }

    const allocatedTotal = allocationResult.allocations.reduce(
      (sum, row) => sum + row.amount,
      0
    );
    if (allocatedTotal > totalAmount) {
      res.status(400);
      throw new Error(
        "Category allocations cannot exceed the total monthly budget"
      );
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, year, month },
      {
        $set: {
          totalAmount,
          notes,
          allocations: allocationResult.allocations,
        },
        $setOnInsert: {
          userId: req.user._id,
          year,
          month,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    const spend = await getSpendBreakdown(req.user._id, year, month);
    const progress = buildProgress(budget.toObject(), spend);

    res.status(200).json({
      success: true,
      budget,
      progress,
      year,
      month,
    });
  } catch (error) {
    if (error?.code === 11000) {
      res.status(400);
      return next(new Error("A budget for this month already exists"));
    }
    next(error);
  }
};



export const deleteBudget = async (req, res, next) => {
  try {
    const { budget, status, message } = await findOwnedBudget(
      req.params.id,
      req.user._id
    );

    if (!budget) {
      res.status(status);
      throw new Error(message);
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};



export const copyBudget = async (req, res, next) => {
  try {
    const target = parsePeriod(req.body);
    if (target.error) {
      res.status(400);
      throw new Error(target.error);
    }

    let sourceYear = target.year;
    let sourceMonth = target.month - 1;
    if (sourceMonth < 1) {
      sourceMonth = 12;
      sourceYear -= 1;
    }

    if (req.body.fromYear && req.body.fromMonth) {
      sourceYear = parseInt(req.body.fromYear, 10);
      sourceMonth = parseInt(req.body.fromMonth, 10);
    }

    const source = await Budget.findOne({
      userId: req.user._id,
      year: sourceYear,
      month: sourceMonth,
    }).lean();

    if (!source) {
      res.status(404);
      throw new Error("No previous budget found to copy");
    }

    const existing = await Budget.findOne({
      userId: req.user._id,
      year: target.year,
      month: target.month,
    });

    if (existing) {
      res.status(400);
      throw new Error("A budget for this month already exists");
    }

    const budget = await Budget.create({
      userId: req.user._id,
      year: target.year,
      month: target.month,
      totalAmount: source.totalAmount,
      notes: source.notes || "",
      allocations: source.allocations || [],
    });

    const spend = await getSpendBreakdown(
      req.user._id,
      target.year,
      target.month
    );
    const progress = buildProgress(budget.toObject(), spend);

    res.status(201).json({
      success: true,
      budget,
      progress,
      year: target.year,
      month: target.month,
    });
  } catch (error) {
    next(error);
  }
};

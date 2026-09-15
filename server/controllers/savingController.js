/**
 * controllers/savingController.js
 * CRUD + contribute/withdraw for saving goals.
 */

import Saving, { SAVING_STATUSES } from "../models/Saving.js";

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findOwnedSaving = async (id, userId) => {
  const saving = await Saving.findById(id);
  if (!saving) {
    return { saving: null, status: 404, message: "Saving goal not found" };
  }
  if (saving.userId.toString() !== userId.toString()) {
    return {
      saving: null,
      status: 403,
      message: "Not authorized to access this saving goal",
    };
  }
  return { saving, status: null, message: null };
};

const withProgress = (doc) => {
  const plain = doc.toObject ? doc.toObject() : doc;
  const target = plain.targetAmount || 0;
  const current = plain.currentAmount || 0;
  const percent =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return {
    ...plain,
    remaining: Math.max(0, target - current),
    percentComplete: percent,
    isComplete: target > 0 && current >= target,
  };
};

const validateSavingBody = (body, { isUpdate = false } = {}) => {
  const { name, targetAmount, currentAmount, status, deadline, notes } = body;

  if (!isUpdate) {
    if (!name?.trim()) return "Goal name is required";
    if (targetAmount === undefined || targetAmount === null || targetAmount === "") {
      return "Target amount is required";
    }
  }

  if (name !== undefined && !String(name).trim()) {
    return "Goal name cannot be empty";
  }

  if (targetAmount !== undefined && targetAmount !== null && targetAmount !== "") {
    const num = Number(targetAmount);
    if (Number.isNaN(num) || num <= 0) return "Target must be a positive number";
  }

  if (currentAmount !== undefined && currentAmount !== null && currentAmount !== "") {
    const num = Number(currentAmount);
    if (Number.isNaN(num) || num < 0) {
      return "Saved amount cannot be negative";
    }
  }

  if (status !== undefined && !SAVING_STATUSES.includes(status)) {
    return "Invalid status";
  }

  if (deadline !== undefined && deadline !== null && deadline !== "") {
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) return "Invalid deadline";
  }

  if (notes !== undefined && String(notes).length > 300) {
    return "Notes cannot exceed 300 characters";
  }

  return null;
};

/**
 * @route GET /api/savings/stats
 */
export const getSavingStats = async (req, res, next) => {
  try {
    const [summary, byStatus] = await Promise.all([
      Saving.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            totalGoals: { $sum: 1 },
            totalTarget: { $sum: "$targetAmount" },
            totalSaved: { $sum: "$currentAmount" },
          },
        },
      ]),
      Saving.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = Object.fromEntries(
      byStatus.map((row) => [row._id, row.count])
    );

    const totalTarget = summary[0]?.totalTarget || 0;
    const totalSaved = summary[0]?.totalSaved || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalGoals: summary[0]?.totalGoals || 0,
        totalTarget,
        totalSaved,
        remaining: Math.max(0, totalTarget - totalSaved),
        percentComplete:
          totalTarget > 0
            ? Math.min(100, Math.round((totalSaved / totalTarget) * 100))
            : 0,
        active: statusMap.active || 0,
        completed: statusMap.completed || 0,
        paused: statusMap.paused || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/savings
 */
export const getSavings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.status && SAVING_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.search?.trim()) {
      filter.name = {
        $regex: escapeRegex(req.query.search.trim()),
        $options: "i",
      };
    }

    const [rows, totalCount] = await Promise.all([
      Saving.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Saving.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      savings: rows.map(withProgress),
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
 * @route GET /api/savings/:id
 */
export const getSavingById = async (req, res, next) => {
  try {
    const { saving, status, message } = await findOwnedSaving(
      req.params.id,
      req.user._id
    );
    if (!saving) {
      res.status(status);
      throw new Error(message);
    }
    res.status(200).json({ success: true, saving: withProgress(saving) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/savings
 */
export const createSaving = async (req, res, next) => {
  try {
    const validationError = validateSavingBody(req.body);
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const targetAmount = Number(req.body.targetAmount);
    let currentAmount = Number(req.body.currentAmount ?? 0);
    if (Number.isNaN(currentAmount) || currentAmount < 0) currentAmount = 0;

    let status = req.body.status || "active";
    if (currentAmount >= targetAmount) status = "completed";

    const saving = await Saving.create({
      userId: req.user._id,
      name: String(req.body.name).trim(),
      targetAmount,
      currentAmount,
      deadline: req.body.deadline ? new Date(req.body.deadline) : null,
      notes: req.body.notes?.trim() || "",
      status,
    });

    res.status(201).json({ success: true, saving: withProgress(saving) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/savings/:id
 */
export const updateSaving = async (req, res, next) => {
  try {
    const validationError = validateSavingBody(req.body, { isUpdate: true });
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { saving, status, message } = await findOwnedSaving(
      req.params.id,
      req.user._id
    );
    if (!saving) {
      res.status(status);
      throw new Error(message);
    }

    if (req.body.name !== undefined) saving.name = String(req.body.name).trim();
    if (req.body.targetAmount !== undefined) {
      saving.targetAmount = Number(req.body.targetAmount);
    }
    if (req.body.currentAmount !== undefined) {
      saving.currentAmount = Number(req.body.currentAmount);
    }
    if (req.body.deadline !== undefined) {
      saving.deadline = req.body.deadline ? new Date(req.body.deadline) : null;
    }
    if (req.body.notes !== undefined) saving.notes = String(req.body.notes).trim();
    if (req.body.status !== undefined) saving.status = req.body.status;

    if (saving.currentAmount >= saving.targetAmount) {
      saving.status = "completed";
    } else if (saving.status === "completed") {
      saving.status = "active";
    }

    await saving.save();
    res.status(200).json({ success: true, saving: withProgress(saving) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/savings/:id/contribute
 */
export const contributeSaving = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      res.status(400);
      throw new Error("Contribution amount must be positive");
    }

    const { saving, status, message } = await findOwnedSaving(
      req.params.id,
      req.user._id
    );
    if (!saving) {
      res.status(status);
      throw new Error(message);
    }

    saving.currentAmount = Number(saving.currentAmount || 0) + amount;
    if (saving.currentAmount >= saving.targetAmount) {
      saving.status = "completed";
    } else if (saving.status === "paused") {
      saving.status = "active";
    }

    await saving.save();
    res.status(200).json({ success: true, saving: withProgress(saving) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/savings/:id/withdraw
 */
export const withdrawSaving = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      res.status(400);
      throw new Error("Withdraw amount must be positive");
    }

    const { saving, status, message } = await findOwnedSaving(
      req.params.id,
      req.user._id
    );
    if (!saving) {
      res.status(status);
      throw new Error(message);
    }

    if (amount > saving.currentAmount) {
      res.status(400);
      throw new Error("Cannot withdraw more than the saved amount");
    }

    saving.currentAmount = Number(saving.currentAmount || 0) - amount;
    if (saving.currentAmount < saving.targetAmount && saving.status === "completed") {
      saving.status = "active";
    }

    await saving.save();
    res.status(200).json({ success: true, saving: withProgress(saving) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/savings/:id
 */
export const deleteSaving = async (req, res, next) => {
  try {
    const { saving, status, message } = await findOwnedSaving(
      req.params.id,
      req.user._id
    );
    if (!saving) {
      res.status(status);
      throw new Error(message);
    }
    await saving.deleteOne();
    res.status(200).json({
      success: true,
      message: "Saving goal deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

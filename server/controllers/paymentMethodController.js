/**
 * controllers/paymentMethodController.js
 * CRUD for logged-in user's payment methods — search + pagination.
 */

import PaymentMethod from "../models/PaymentMethod.js";
import Expense from "../models/Expense.js";

const normalizeName = (name = "") => String(name).trim().replace(/\s+/g, " ");

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toNameKey = (name = "") => normalizeName(name).toLowerCase();

const findOwnedPaymentMethod = async (id, userId) => {
  const paymentMethod = await PaymentMethod.findById(id);

  if (!paymentMethod) {
    return {
      paymentMethod: null,
      status: 404,
      message: "Payment method not found",
    };
  }

  if (paymentMethod.userId.toString() !== userId.toString()) {
    return {
      paymentMethod: null,
      status: 403,
      message: "Not authorized to access this payment method",
    };
  }

  return { paymentMethod, status: null, message: null };
};

const findDuplicate = async (userId, name, excludeId = null) => {
  const nameKey = toNameKey(name);
  if (!nameKey) return null;

  const filter = {
    userId,
    $or: [
      { nameKey },
      {
        name: {
          $regex: `^${escapeRegex(normalizeName(name))}$`,
          $options: "i",
        },
      },
    ],
  };

  if (excludeId) filter._id = { $ne: excludeId };

  return PaymentMethod.findOne(filter);
};

const withExpenseCounts = async (userId, items) => {
  const names = items.map((item) =>
    item.toObject ? item.toObject().name : item.name
  );

  if (names.length === 0) return [];

  const counts = await Expense.aggregate([
    { $match: { userId, paymentMode: { $in: names } } },
    { $group: { _id: "$paymentMode", count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(
    counts.map((row) => [row._id, row.count])
  );

  return items.map((item) => {
    const plain = item.toObject ? item.toObject() : item;
    return {
      ...plain,
      expenseCount: countMap[plain.name] || 0,
    };
  });
};

/**
 * @route   GET /api/payment-methods
 */
export const getPaymentMethods = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.search?.trim()) {
      filter.name = {
        $regex: escapeRegex(req.query.search.trim()),
        $options: "i",
      };
    }

    const [paymentMethods, totalCount] = await Promise.all([
      PaymentMethod.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PaymentMethod.countDocuments(filter),
    ]);

    const withCounts = await withExpenseCounts(req.user._id, paymentMethods);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    res.status(200).json({
      success: true,
      paymentMethods: withCounts,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/payment-methods/options
 */
export const getPaymentMethodOptions = async (req, res, next) => {
  try {
    const paymentMethods = await PaymentMethod.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("name")
      .lean();

    res.status(200).json({
      success: true,
      paymentMethods,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/payment-methods
 */
export const createPaymentMethod = async (req, res, next) => {
  try {
    const name = normalizeName(req.body.name);

    if (!name) {
      res.status(400);
      throw new Error("Payment method name is required");
    }

    if (name.length > 40) {
      res.status(400);
      throw new Error("Payment method name cannot exceed 40 characters");
    }

    const existing = await findDuplicate(req.user._id, name);
    if (existing) {
      res.status(400);
      throw new Error("A payment method with this name already exists");
    }

    const paymentMethod = await PaymentMethod.create({
      userId: req.user._id,
      name,
      nameKey: toNameKey(name),
    });

    res.status(201).json({
      success: true,
      paymentMethod: { ...paymentMethod.toObject(), expenseCount: 0 },
    });
  } catch (error) {
    if (error?.code === 11000) {
      res.status(400);
      return next(new Error("A payment method with this name already exists"));
    }
    next(error);
  }
};

/**
 * @route   PUT /api/payment-methods/:id
 */
export const updatePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethod, status, message } = await findOwnedPaymentMethod(
      req.params.id,
      req.user._id
    );

    if (!paymentMethod) {
      res.status(status);
      throw new Error(message);
    }

    const nextName =
      req.body.name !== undefined
        ? normalizeName(req.body.name)
        : paymentMethod.name;

    if (!nextName) {
      res.status(400);
      throw new Error("Payment method name is required");
    }

    if (nextName.length > 40) {
      res.status(400);
      throw new Error("Payment method name cannot exceed 40 characters");
    }

    const duplicate = await findDuplicate(
      req.user._id,
      nextName,
      paymentMethod._id
    );
    if (duplicate) {
      res.status(400);
      throw new Error("A payment method with this name already exists");
    }

    const previousName = paymentMethod.name;
    paymentMethod.name = nextName;
    paymentMethod.nameKey = toNameKey(nextName);
    await paymentMethod.save();

    if (previousName !== nextName) {
      await Expense.updateMany(
        { userId: req.user._id, paymentMode: previousName },
        { $set: { paymentMode: nextName } }
      );
    }

    const expenseCount = await Expense.countDocuments({
      userId: req.user._id,
      paymentMode: paymentMethod.name,
    });

    res.status(200).json({
      success: true,
      paymentMethod: { ...paymentMethod.toObject(), expenseCount },
    });
  } catch (error) {
    if (error?.code === 11000) {
      res.status(400);
      return next(new Error("A payment method with this name already exists"));
    }
    next(error);
  }
};

/**
 * @route   DELETE /api/payment-methods/:id
 */
export const deletePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethod, status, message } = await findOwnedPaymentMethod(
      req.params.id,
      req.user._id
    );

    if (!paymentMethod) {
      res.status(status);
      throw new Error(message);
    }

    const expenseCount = await Expense.countDocuments({
      userId: req.user._id,
      paymentMode: paymentMethod.name,
    });

    if (expenseCount > 0) {
      res.status(400);
      throw new Error(
        `Cannot delete "${paymentMethod.name}" — ${expenseCount} expense${
          expenseCount === 1 ? "" : "s"
        } still use it. Reassign those expenses first.`
      );
    }

    await paymentMethod.deleteOne();

    res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

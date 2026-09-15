import Income from "../models/Income.js";
import Category from "../models/Category.js";
import PaymentMethod from "../models/PaymentMethod.js";
import {
  buildTransactionListFilter,
  parseTransactionSort,
} from "../utils/transactionQuery.js";
import { findOwnedDocument } from "../utils/findOwned.js";

const buildIncomeFilter = (userId, query) =>
  buildTransactionListFilter(userId, query);

const parseSort = parseTransactionSort;

const findOwnedIncome = (incomeId, userId) =>
  findOwnedDocument(Income, incomeId, userId, {
    key: "income",
    notFoundMessage: "Income not found",
    forbiddenMessage: "Not authorized to access this income",
  });


const validateIncomeBody = async (body, userId, { isUpdate = false } = {}) => {
  const { title, amount, category, paymentMode } = body;

  if (!isUpdate) {
    if (!title?.trim()) return "Title is required";
    if (amount === undefined || amount === null || amount === "") {
      return "Amount is required";
    }
    if (!category) return "Category is required";
    if (!paymentMode) return "Payment method is required";
  }

  if (title !== undefined && !String(title).trim()) {
    return "Title cannot be empty";
  }

  if (amount !== undefined && amount !== null && amount !== "") {
    const num = Number(amount);
    if (Number.isNaN(num) || num <= 0) {
      return "Amount must be a positive number";
    }
  }

  if (category !== undefined) {
    const exists = await Category.findOne({
      userId,
      name: String(category).trim(),
      type: "income",
    });
    if (!exists) return "Invalid income category";
  }

  if (paymentMode !== undefined) {
    const exists = await PaymentMethod.findOne({
      userId,
      name: String(paymentMode).trim(),
    });
    if (!exists) return "Invalid payment method";
  }

  return null;
};



export const addIncome = async (req, res, next) => {
  try {
    const validationError = await validateIncomeBody(req.body, req.user._id);
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { title, amount, category, paymentMode, date, description } = req.body;

    const income = await Income.create({
      userId: req.user._id,
      title: title.trim(),
      amount: Number(amount),
      category: String(category).trim(),
      paymentMode: String(paymentMode).trim(),
      date: date ? new Date(date) : new Date(),
      description: description?.trim() || "",
    });

    res.status(201).json({
      success: true,
      income,
    });
  } catch (error) {
    next(error);
  }
};



export const getIncomes = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const sort = parseSort(req.query.sortBy);
    const filter = buildIncomeFilter(req.user._id, req.query);

    const [incomes, totalCount, amountAgg] = await Promise.all([
      Income.find(filter).sort(sort).skip(skip).limit(limit),
      Income.countDocuments(filter),
      Income.aggregate([
        { $match: filter },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;
    const totalAmount = amountAgg[0]?.totalAmount || 0;

    res.status(200).json({
      success: true,
      incomes,
      totalCount,
      totalPages,
      currentPage: page,
      totalAmount,
    });
  } catch (error) {
    next(error);
  }
};



export const getIncomeStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const match = {
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    };

    const [summary, byCategory] = await Promise.all([
      Income.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Income.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    const stats = {
      totalAmount: summary[0]?.totalAmount || 0,
      count: summary[0]?.count || 0,
      byCategory: byCategory.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};



export const getIncomeById = async (req, res, next) => {
  try {
    const { income, status, message } = await findOwnedIncome(
      req.params.id,
      req.user._id
    );

    if (!income) {
      res.status(status);
      throw new Error(message);
    }

    res.status(200).json({
      success: true,
      income,
    });
  } catch (error) {
    next(error);
  }
};



export const updateIncome = async (req, res, next) => {
  try {
    const validationError = await validateIncomeBody(req.body, req.user._id, {
      isUpdate: true,
    });
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { income, status, message } = await findOwnedIncome(
      req.params.id,
      req.user._id
    );

    if (!income) {
      res.status(status);
      throw new Error(message);
    }

    const { title, amount, category, paymentMode, date, description } = req.body;

    if (title !== undefined) income.title = title.trim();
    if (amount !== undefined) income.amount = Number(amount);
    if (category !== undefined) income.category = String(category).trim();
    if (paymentMode !== undefined) {
      income.paymentMode = String(paymentMode).trim();
    }
    if (date !== undefined) income.date = new Date(date);
    if (description !== undefined) income.description = description.trim();

    await income.save();

    res.status(200).json({
      success: true,
      income,
    });
  } catch (error) {
    next(error);
  }
};



export const deleteIncome = async (req, res, next) => {
  try {
    const { income, status, message } = await findOwnedIncome(
      req.params.id,
      req.user._id
    );

    if (!income) {
      res.status(status);
      throw new Error(message);
    }

    await income.deleteOne();

    res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

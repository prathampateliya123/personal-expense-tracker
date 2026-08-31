/**
 * controllers/walletController.js
 * CRUD and transfer operations for multi-wallet management.
 * Current balance is computed from initial balance + incomes - expenses ± transfers.
 */

import Wallet, { WALLET_TYPES } from "../models/Wallet.js";
import WalletTransfer from "../models/WalletTransfer.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import {
  enrichWalletsWithBalance,
  computeWalletBalance,
} from "../utils/walletHelper.js";

/**
 * @route   POST /api/wallets
 * @desc    Create a new wallet
 * @access  Private
 */
export const createWallet = async (req, res, next) => {
  try {
    const { walletName, type, balance } = req.body;

    if (!walletName || !type) {
      res.status(400);
      throw new Error("Please provide walletName and type");
    }

    if (!WALLET_TYPES.includes(type)) {
      res.status(400);
      throw new Error("Invalid wallet type");
    }

    const wallet = await Wallet.create({
      userId: req.user._id,
      walletName,
      type,
      balance: balance != null ? parseFloat(balance) : 0,
    });

    const [enriched] = await enrichWalletsWithBalance([wallet]);

    res.status(201).json({ success: true, wallet: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/wallets
 * @desc    Get all wallets with computed current balance
 * @access  Private
 */
export const getWallets = async (req, res, next) => {
  try {
    const wallets = await Wallet.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    const enrichedWallets = await enrichWalletsWithBalance(wallets);

    res.status(200).json({
      success: true,
      wallets: enrichedWallets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/wallets/:id
 * @desc    Update a wallet
 * @access  Private
 */
export const updateWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!wallet) {
      res.status(404);
      throw new Error("Wallet not found");
    }

    const { walletName, type, balance } = req.body;

    if (type && !WALLET_TYPES.includes(type)) {
      res.status(400);
      throw new Error("Invalid wallet type");
    }

    if (walletName !== undefined) wallet.walletName = walletName;
    if (type !== undefined) wallet.type = type;
    if (balance !== undefined) wallet.balance = parseFloat(balance);

    await wallet.save();

    const [enriched] = await enrichWalletsWithBalance([wallet]);

    res.status(200).json({ success: true, wallet: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/wallets/:id
 * @desc    Delete a wallet (blocked if linked transactions exist)
 * @access  Private
 */
export const deleteWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!wallet) {
      res.status(404);
      throw new Error("Wallet not found");
    }

    const [expenseCount, incomeCount, transferCount] = await Promise.all([
      Expense.countDocuments({ walletId: wallet._id }),
      Income.countDocuments({ walletId: wallet._id }),
      WalletTransfer.countDocuments({
        $or: [{ fromWalletId: wallet._id }, { toWalletId: wallet._id }],
      }),
    ]);

    if (expenseCount + incomeCount + transferCount > 0) {
      res.status(400);
      throw new Error(
        "Cannot delete wallet with linked expenses, incomes, or transfers"
      );
    }

    await wallet.deleteOne();

    res.status(200).json({
      success: true,
      message: "Wallet deleted successfully",
      walletId: wallet._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/wallets/transfer
 * @desc    Transfer funds between two wallets
 * @access  Private
 */
export const transferBetweenWallets = async (req, res, next) => {
  try {
    const { fromWalletId, toWalletId, amount, note } = req.body;

    if (!fromWalletId || !toWalletId || amount == null) {
      res.status(400);
      throw new Error("Please provide fromWalletId, toWalletId, and amount");
    }

    if (fromWalletId === toWalletId) {
      res.status(400);
      throw new Error("Cannot transfer to the same wallet");
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      res.status(400);
      throw new Error("Transfer amount must be greater than zero");
    }

    const [fromWallet, toWallet] = await Promise.all([
      Wallet.findOne({ _id: fromWalletId, userId: req.user._id }),
      Wallet.findOne({ _id: toWalletId, userId: req.user._id }),
    ]);

    if (!fromWallet || !toWallet) {
      res.status(404);
      throw new Error("One or both wallets not found");
    }

    const fromBalance = await computeWalletBalance(
      fromWallet._id,
      fromWallet.balance
    );

    if (fromBalance < transferAmount) {
      res.status(400);
      throw new Error("Insufficient balance in source wallet");
    }

    const transfer = await WalletTransfer.create({
      userId: req.user._id,
      fromWalletId,
      toWalletId,
      amount: transferAmount,
      note,
    });

    const [enrichedFrom, enrichedTo] = await enrichWalletsWithBalance([
      fromWallet,
      toWallet,
    ]);

    res.status(201).json({
      success: true,
      transfer,
      fromWallet: enrichedFrom,
      toWallet: enrichedTo,
    });
  } catch (error) {
    next(error);
  }
};

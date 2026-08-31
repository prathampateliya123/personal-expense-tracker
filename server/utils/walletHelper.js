/**
 * utils/walletHelper.js
 * Helpers for wallet validation and computed balance calculation.
 */

import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import WalletTransfer from "../models/WalletTransfer.js";

/**
 * Validate that a wallet belongs to the user. Returns null if walletId is empty.
 */
export const validateUserWallet = async (walletId, userId) => {
  if (!walletId) return null;

  const wallet = await Wallet.findOne({
    _id: walletId,
    userId,
  });

  if (!wallet) {
    const error = new Error("Invalid wallet");
    error.statusCode = 400;
    throw error;
  }

  return wallet;
};

/**
 * Compute current balance for a single wallet.
 * Formula: initial balance + incomes - expenses + transfers in - transfers out
 */
export const computeWalletBalance = async (walletId, initialBalance) => {
  const id = new mongoose.Types.ObjectId(walletId);

  const [incomeResult, expenseResult, transferInResult, transferOutResult] =
    await Promise.all([
      Income.aggregate([
        { $match: { walletId: id } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { walletId: id } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      WalletTransfer.aggregate([
        { $match: { toWalletId: id } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      WalletTransfer.aggregate([
        { $match: { fromWalletId: id } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

  const totalIncome = incomeResult[0]?.total || 0;
  const totalExpense = expenseResult[0]?.total || 0;
  const transfersIn = transferInResult[0]?.total || 0;
  const transfersOut = transferOutResult[0]?.total || 0;

  return (
    initialBalance + totalIncome - totalExpense + transfersIn - transfersOut
  );
};

/**
 * Enrich wallet documents with computed current balance.
 */
export const enrichWalletsWithBalance = async (wallets) => {
  return Promise.all(
    wallets.map(async (wallet) => {
      const currentBalance = await computeWalletBalance(
        wallet._id,
        wallet.balance
      );
      return {
        ...(wallet.toObject ? wallet.toObject() : wallet),
        currentBalance,
      };
    })
  );
};

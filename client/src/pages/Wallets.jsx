/**
 * pages/Wallets.jsx
 * Multi-wallet management — view balances, add wallets, transfer funds.
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  WALLET_TYPES,
  WALLET_TYPE_STYLES,
  WalletTypeIcon,
} from "../utils/walletConstants";
import {
  fetchWallets,
  createWallet,
  deleteWallet,
  transferBetweenWallets,
  clearError,
} from "../redux/walletSlice";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

/** Add Wallet modal */
const AddWalletModal = ({ onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({
    walletName: "",
    type: "",
    balance: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      balance: parseFloat(form.balance) || 0,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Add Wallet</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Wallet Name
            </label>
            <input
              required
              value={form.walletName}
              onChange={(e) => setForm({ ...form, walletName: e.target.value })}
              className={inputClass}
              placeholder="Paytm UPI"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className={inputClass}
            >
              <option value="">Select type</option>
              {WALLET_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Opening Balance (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              className={inputClass}
              placeholder="0"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Wallet"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** Transfer modal */
const TransferModal = ({ wallets, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({
    fromWalletId: "",
    toWalletId: "",
    amount: "",
    note: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
    });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Transfer Funds</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              From Wallet
            </label>
            <select
              required
              value={form.fromWalletId}
              onChange={(e) =>
                setForm({ ...form, fromWalletId: e.target.value })
              }
              className={inputClass}
            >
              <option value="">Select source</option>
              {wallets.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.walletName} ({formatCurrency(w.currentBalance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              To Wallet
            </label>
            <select
              required
              value={form.toWalletId}
              onChange={(e) => setForm({ ...form, toWalletId: e.target.value })}
              className={inputClass}
            >
              <option value="">Select destination</option>
              {wallets
                .filter((w) => w._id !== form.fromWalletId)
                .map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.walletName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={inputClass}
              placeholder="1000"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Note (optional)
            </label>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className={inputClass}
              placeholder="Moved to savings"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Transferring..." : "Transfer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Wallets = () => {
  const dispatch = useDispatch();
  const { wallets, loading, error } = useSelector((state) => state.wallets);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    dispatch(fetchWallets());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleCreateWallet = async (data) => {
    const result = await dispatch(createWallet(data));
    if (createWallet.fulfilled.match(result)) {
      toast.success("Wallet created successfully");
      setShowAddModal(false);
      dispatch(fetchWallets());
    }
  };

  const handleTransfer = async (data) => {
    const result = await dispatch(transferBetweenWallets(data));
    if (transferBetweenWallets.fulfilled.match(result)) {
      toast.success("Transfer completed successfully");
      setShowTransferModal(false);
      dispatch(fetchWallets());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this wallet?")) return;
    const result = await dispatch(deleteWallet(id));
    if (deleteWallet.fulfilled.match(result)) {
      toast.success("Wallet deleted successfully");
    }
  };

  const totalBalance = wallets.reduce((sum, w) => sum + (w.currentBalance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage cash, UPI, bank, and card balances
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTransferModal(true)}
            disabled={wallets.length < 2}
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Transfer
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Add Wallet
          </button>
        </div>
      </div>

      {/* Total balance summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Total Balance</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {/* Wallet cards grid */}
      {loading && wallets.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : wallets.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white">
          <p className="text-sm text-gray-400">No wallets yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Add your first wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => {
            const styles = WALLET_TYPE_STYLES[wallet.type] || WALLET_TYPE_STYLES.cash;
            return (
              <div
                key={wallet._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${styles.bg} ${styles.text}`}>
                    <WalletTypeIcon type={wallet.type} className="h-6 w-6" />
                  </div>
                  <button
                    onClick={() => handleDelete(wallet._id)}
                    title="Delete wallet"
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  {wallet.walletName}
                </h3>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles.bg} ${styles.text}`}>
                  {wallet.type}
                </span>

                <p className={`mt-4 text-2xl font-bold ${wallet.currentBalance < 0 ? "text-red-600" : "text-gray-900"}`}>
                  {formatCurrency(wallet.currentBalance)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Opening: {formatCurrency(wallet.balance)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddWalletModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateWallet}
          loading={loading}
        />
      )}

      {showTransferModal && (
        <TransferModal
          wallets={wallets}
          onClose={() => setShowTransferModal(false)}
          onSubmit={handleTransfer}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Wallets;

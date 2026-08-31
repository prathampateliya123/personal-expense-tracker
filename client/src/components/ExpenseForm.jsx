/**
 * components/ExpenseForm.jsx
 * Reusable form for adding or editing an expense.
 * Pass `expense` prop to pre-fill fields for edit mode.
 */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_MODES,
} from "../utils/expenseConstants";
import { fetchWallets } from "../redux/walletSlice";
import { fetchTrips } from "../redux/tripSlice";

const defaultFormState = {
  title: "",
  amount: "",
  category: "",
  paymentMode: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  walletId: "",
  tripId: "",
};

const ExpenseForm = ({ expense, tripId: fixedTripId, onSubmit, onCancel, loading }) => {
  const dispatch = useDispatch();
  const { wallets } = useSelector((state) => state.wallets);
  const { trips } = useSelector((state) => state.trips);
  const [formData, setFormData] = useState(defaultFormState);
  const isEditing = Boolean(expense);
  const showTripSelector = !fixedTripId;

  useEffect(() => {
    dispatch(fetchWallets());
    if (showTripSelector) {
      dispatch(fetchTrips());
    }
  }, [dispatch, showTripSelector]);

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || "",
        amount: expense.amount?.toString() || "",
        category: expense.category || "",
        paymentMode: expense.paymentMode || "",
        date: expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : defaultFormState.date,
        description: expense.description || "",
        walletId: expense.walletId || "",
        tripId: expense.tripId || fixedTripId || "",
      });
    } else {
      setFormData({
        ...defaultFormState,
        tripId: fixedTripId || "",
      });
    }
  }, [expense, fixedTripId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      walletId: formData.walletId || null,
      tripId: fixedTripId || formData.tripId || null,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {isEditing
          ? "Edit Expense"
          : fixedTripId
            ? "Add Expense to Trip"
            : "Add Expense"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            className={inputClass}
            placeholder="Grocery shopping"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            name="amount"
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className={inputClass}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select category</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Payment Mode
          </label>
          <select
            name="paymentMode"
            required
            value={formData.paymentMode}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select payment mode</option>
            {PAYMENT_MODES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Wallet
          </label>
          <select
            name="walletId"
            value={formData.walletId}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">No wallet (optional)</option>
            {wallets.map((w) => (
              <option key={w._id} value={w._id}>
                {w.walletName}
              </option>
            ))}
          </select>
        </div>

        {showTripSelector && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Trip
            </label>
            <select
              name="tripId"
              value={formData.tripId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">No trip (optional)</option>
              {trips
                .filter((t) => t.status === "ongoing")
                .map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.tripName} — {t.destination}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            name="date"
            type="date"
            required
            value={formData.date}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            className={inputClass}
            placeholder="Optional notes..."
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Expense"
              : "Add Expense"}
        </button>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;

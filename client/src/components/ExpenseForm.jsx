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

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h2 className="section-heading mb-4">
        {isEditing
          ? "Edit Expense"
          : fixedTripId
            ? "Add Expense to Trip"
            : "Add Expense"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-textSecondary">
            Title
          </label>
          <input
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            placeholder="Grocery shopping"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-textSecondary">
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
            className="input-field"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-textSecondary">
            Category
          </label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="input-field"
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
          <label className="mb-1 block text-sm font-medium text-textSecondary">
            Payment Mode
          </label>
          <select
            name="paymentMode"
            required
            value={formData.paymentMode}
            onChange={handleChange}
            className="input-field"
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
          <label className="mb-1 block text-sm font-medium text-textSecondary">
            Wallet
          </label>
          <select
            name="walletId"
            value={formData.walletId}
            onChange={handleChange}
            className="input-field"
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
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Trip
            </label>
            <select
              name="tripId"
              value={formData.tripId}
              onChange={handleChange}
              className="input-field"
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
          <label className="mb-1 block text-sm font-medium text-textSecondary">
            Date
          </label>
          <input
            name="date"
            type="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="mb-1 block text-sm font-medium text-textSecondary">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            placeholder="Optional notes..."
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Expense"
              : "Add Expense"}
        </button>
        {isEditing && onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;

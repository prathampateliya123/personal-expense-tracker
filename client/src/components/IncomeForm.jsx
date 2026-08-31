/**
 * components/IncomeForm.jsx
 * Reusable form for adding or editing an income entry.
 * Pass `income` prop to pre-fill fields for edit mode.
 */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { INCOME_SOURCES } from "../utils/incomeConstants";
import { fetchWallets } from "../redux/walletSlice";

const defaultFormState = {
  source: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  walletId: "",
};

const IncomeForm = ({ income, onSubmit, onCancel, loading }) => {
  const dispatch = useDispatch();
  const { wallets } = useSelector((state) => state.wallets);
  const [formData, setFormData] = useState(defaultFormState);
  const isEditing = Boolean(income);

  useEffect(() => {
    dispatch(fetchWallets());
  }, [dispatch]);

  useEffect(() => {
    if (income) {
      setFormData({
        source: income.source || "",
        amount: income.amount?.toString() || "",
        date: income.date
          ? new Date(income.date).toISOString().split("T")[0]
          : defaultFormState.date,
        description: income.description || "",
        walletId: income.walletId || "",
      });
    } else {
      setFormData(defaultFormState);
    }
  }, [income]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      walletId: formData.walletId || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h2 className="section-heading mb-4">
        {isEditing ? "Edit Income" : "Add Income"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-textSecondary">
            Source
          </label>
          <select
            name="source"
            required
            value={formData.source}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select source</option>
            {INCOME_SOURCES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
              ? "Update Income"
              : "Add Income"}
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

export default IncomeForm;

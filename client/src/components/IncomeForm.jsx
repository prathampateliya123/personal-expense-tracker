/**
 * components/IncomeForm.jsx
 * Reusable form for adding or editing an income entry.
 * Pass `income` prop to pre-fill fields for edit mode.
 */

import { useState, useEffect } from "react";
import { INCOME_SOURCES } from "../utils/incomeConstants";

const defaultFormState = {
  source: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
};

const IncomeForm = ({ income, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState(defaultFormState);
  const isEditing = Boolean(income);

  useEffect(() => {
    if (income) {
      setFormData({
        source: income.source || "",
        amount: income.amount?.toString() || "",
        date: income.date
          ? new Date(income.date).toISOString().split("T")[0]
          : defaultFormState.date,
        description: income.description || "",
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
        {isEditing ? "Edit Income" : "Add Income"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Source
          </label>
          <select
            name="source"
            required
            value={formData.source}
            onChange={handleChange}
            className={inputClass}
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
              ? "Update Income"
              : "Add Income"}
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

export default IncomeForm;

/**
 * components/expenses/ExpenseForm.jsx
 * Controlled form for adding or editing an expense.
 */

import { useState, useEffect } from "react";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_MODES,
} from "../../config/expenseConstants";

const inputClass =
  "w-full rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

const labelClass = "mb-1.5 block text-sm font-medium text-ink-700";

const toDateInputValue = (date) => {
  if (!date) return new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
};

const emptyForm = {
  title: "",
  amount: "",
  category: "",
  paymentMode: "Cash",
  date: toDateInputValue(),
  description: "",
};

/**
 * @param {object} props
 * @param {object} [props.initialData] - Existing expense for edit mode
 * @param {function} props.onSubmit - Called with validated form data
 * @param {function} [props.onCancel] - Close modal handler
 * @param {boolean} [props.loading] - Submit loading state
 */
const ExpenseForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
  const isEdit = Boolean(initialData?._id);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        amount: String(initialData.amount ?? ""),
        category: initialData.category || "",
        paymentMode: initialData.paymentMode || "Cash",
        date: toDateInputValue(initialData.date),
        description: initialData.description || "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required";
    }

    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      nextErrors.amount = "Enter a valid positive amount";
    }

    if (!form.category) {
      nextErrors.category = "Category is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      paymentMode: form.paymentMode,
      date: form.date,
      description: form.description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          className={inputClass}
          placeholder="e.g. Grocery shopping"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-accent-expense">{errors.title}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className={labelClass}>
            Amount (₹)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            className={inputClass}
            placeholder="0"
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-accent-expense">{errors.amount}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className={labelClass}>
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
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
          {errors.category && (
            <p className="mt-1 text-xs text-accent-expense">{errors.category}</p>
          )}
        </div>

        <div>
          <label htmlFor="paymentMode" className={labelClass}>
            Payment mode
          </label>
          <select
            id="paymentMode"
            name="paymentMode"
            value={form.paymentMode}
            onChange={handleChange}
            className={inputClass}
          >
            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          className={inputClass}
          placeholder="Add notes about this expense..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-surface-muted disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading
            ? "Saving..."
            : isEdit
              ? "Update expense"
              : "Add expense"}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;

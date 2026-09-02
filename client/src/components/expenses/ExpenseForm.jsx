/**
 * components/expenses/ExpenseForm.jsx
 * Controlled form for adding or editing an expense (modal or full page).
 */

import { useState, useEffect } from "react";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_MODES,
} from "../../utils/expenseConstants";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";

const inputClass = "fintech-input";

const labelClass = "mb-1.5 block text-sm font-medium text-textPrimary";

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
 * @param {function} [props.onCancel] - Cancel / back handler
 * @param {boolean} [props.loading] - Submit loading state
 * @param {"page"|"modal"} [props.variant] - Layout variant
 */
const ExpenseForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  variant = "modal",
}) => {
  const isEdit = Boolean(initialData?._id);
  const isPage = variant === "page";
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
      setForm({ ...emptyForm, date: toDateInputValue() });
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

  const gridClass = isPage
    ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
    : "grid gap-4 sm:grid-cols-2";

  return (
    <form onSubmit={handleSubmit} className={isPage ? "space-y-6" : "space-y-4"}>
      <div className={isPage ? gridClass : ""}>
        <div className={isPage ? "sm:col-span-2 xl:col-span-3" : ""}>
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
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {!isPage && (
          <>
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
                <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
              )}
            </div>
            <DateInput
              id="date"
              name="date"
              label="Date"
              labelClassName={labelClass}
              value={form.date}
              onChange={handleChange}
              required
            />
          </>
        )}
      </div>

      {isPage && (
        <div className={gridClass}>
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
              <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
            )}
          </div>

          <DateInput
            id="date"
            name="date"
            label="Date"
            labelClassName={labelClass}
            value={form.date}
            onChange={handleChange}
            required
          />

          <Select
            id="category"
            name="category"
            label="Category"
            labelClassName={labelClass}
            value={form.category}
            onChange={handleChange}
            placeholder="Select category"
            options={EXPENSE_CATEGORIES}
            error={errors.category}
          />

          <Select
            id="paymentMode"
            name="paymentMode"
            label="Payment mode"
            labelClassName={labelClass}
            value={form.paymentMode}
            onChange={handleChange}
            options={PAYMENT_MODES}
          />
        </div>
      )}

      {!isPage && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="category"
            name="category"
            label="Category"
            labelClassName={labelClass}
            value={form.category}
            onChange={handleChange}
            placeholder="Select category"
            options={EXPENSE_CATEGORIES}
            error={errors.category}
          />

          <Select
            id="paymentMode"
            name="paymentMode"
            label="Payment mode"
            labelClassName={labelClass}
            value={form.paymentMode}
            onChange={handleChange}
            options={PAYMENT_MODES}
          />
        </div>
      )}

      <div>
        <label htmlFor="description" className={labelClass}>
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={isPage ? 4 : 3}
          value={form.description}
          onChange={handleChange}
          className={inputClass}
          placeholder="Add notes about this expense..."
        />
      </div>

      <div
        className={`flex gap-3 ${
          isPage
            ? "border-t border-border pt-6 sm:justify-end"
            : "pt-2"
        }`}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-textPrimary transition hover:bg-surfaceGray disabled:opacity-60 ${
              isPage ? "sm:min-w-[140px]" : "flex-1"
            }`}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`btn-primary ${isPage ? "sm:min-w-[160px]" : "flex-1"}`}
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

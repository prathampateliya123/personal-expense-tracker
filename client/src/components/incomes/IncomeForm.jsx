import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";
import categoryService from "../../services/categoryService";
import paymentMethodService from "../../services/paymentMethodService";
import { categoryKeys, paymentMethodKeys } from "../../services/queryKeys";

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
  paymentMode: "",
  date: toDateInputValue(),
  description: "",
};

const IncomeForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  variant = "page",
}) => {
  const isEdit = Boolean(initialData?._id);
  const isPage = variant === "page";
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.options("income"),
    queryFn: async () => {
      const data = await categoryService.options("income");
      return data.categories ?? [];
    },
  });

  const paymentMethodsQuery = useQuery({
    queryKey: paymentMethodKeys.options(),
    queryFn: async () => {
      const data = await paymentMethodService.options();
      return data.paymentMethods ?? [];
    },
  });

  const categoryOptions = (categoriesQuery.data ?? []).map((c) => c.name);
  const paymentOptions = (paymentMethodsQuery.data ?? []).map((p) => p.name);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        amount: String(initialData.amount ?? ""),
        category: initialData.category || "",
        paymentMode: initialData.paymentMode || "",
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

    if (!form.title.trim()) nextErrors.title = "Title is required";

    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      nextErrors.amount = "Enter a valid positive amount";
    }

    if (!form.category) nextErrors.category = "Category is required";
    if (!form.paymentMode) nextErrors.paymentMode = "Payment method is required";

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
      <div>
        <label htmlFor="income-title" className={labelClass}>
          Title
        </label>
        <input
          id="income-title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          className={inputClass}
          placeholder="e.g. Monthly salary"
        />
        {errors.title ? (
          <p className="mt-1 text-xs text-red-500">{errors.title}</p>
        ) : null}
      </div>

      <div className={gridClass}>
        <div>
          <label htmlFor="income-amount" className={labelClass}>
            Amount (₹)
          </label>
          <input
            id="income-amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            className={inputClass}
            placeholder="0"
          />
          {errors.amount ? (
            <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
          ) : null}
        </div>

        <DateInput
          id="income-date"
          name="date"
          label="Date"
          labelClassName={labelClass}
          value={form.date}
          onChange={handleChange}
          required
        />

        <Select
          id="income-category"
          name="category"
          label="Category"
          labelClassName={labelClass}
          value={form.category}
          onChange={handleChange}
          placeholder={
            categoryOptions.length ? "Select category" : "Add income categories first"
          }
          options={categoryOptions}
          error={errors.category}
        />

        <Select
          id="income-paymentMode"
          name="paymentMode"
          label="Received via"
          labelClassName={labelClass}
          value={form.paymentMode}
          onChange={handleChange}
          placeholder={
            paymentOptions.length
              ? "Select payment method"
              : "Add payment methods in Settings"
          }
          options={paymentOptions}
          error={errors.paymentMode}
        />
      </div>

      <div>
        <label htmlFor="income-description" className={labelClass}>
          Description (optional)
        </label>
        <textarea
          id="income-description"
          name="description"
          rows={isPage ? 4 : 3}
          value={form.description}
          onChange={handleChange}
          className={inputClass}
          placeholder="Add notes about this income..."
        />
      </div>

      <div
        className={`flex gap-3 ${
          isPage ? "border-t border-border pt-6 sm:justify-end" : "pt-2"
        }`}
      >
        {onCancel ? (
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
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className={`btn-primary ${isPage ? "sm:min-w-[160px]" : "flex-1"}`}
        >
          {loading ? "Saving..." : isEdit ? "Update income" : "Add income"}
        </button>
      </div>
    </form>
  );
};

export default IncomeForm;

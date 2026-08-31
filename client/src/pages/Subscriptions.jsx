/**
 * pages/Subscriptions.jsx
 * Subscription management — add, track, pause, and cancel recurring bills.
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { EXPENSE_CATEGORIES } from "../utils/expenseConstants";
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  deleteSubscription,
  clearError,
} from "../redux/subscriptionSlice";

const BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const Subscriptions = () => {
  const dispatch = useDispatch();
  const {
    subscriptions,
    totalMonthlyCost,
    totalYearlyCost,
    loading,
    error,
  } = useSelector((state) => state.subscriptions);

  const [formData, setFormData] = useState({
    serviceName: "",
    amount: "",
    billingCycle: "",
    nextBillingDate: "",
    category: "",
    autoAddExpense: false,
  });

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      createSubscription({
        ...formData,
        amount: parseFloat(formData.amount),
      })
    );

    if (createSubscription.fulfilled.match(result)) {
      toast.success("Subscription added successfully");
      setFormData({
        serviceName: "",
        amount: "",
        billingCycle: "",
        nextBillingDate: "",
        category: "",
        autoAddExpense: false,
      });
      dispatch(fetchSubscriptions());
    }
  };

  const handlePause = async (sub) => {
    const newStatus = sub.status === "paused" ? "active" : "paused";
    const result = await dispatch(
      updateSubscription({ id: sub._id, subscriptionData: { status: newStatus } })
    );
    if (updateSubscription.fulfilled.match(result)) {
      toast.success(
        newStatus === "paused" ? "Subscription paused" : "Subscription resumed"
      );
      dispatch(fetchSubscriptions());
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this subscription?")) return;
    const result = await dispatch(cancelSubscription(id));
    if (cancelSubscription.fulfilled.match(result)) {
      toast.success("Subscription cancelled");
      dispatch(fetchSubscriptions());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscription permanently?")) return;
    const result = await dispatch(deleteSubscription(id));
    if (deleteSubscription.fulfilled.match(result)) {
      toast.success("Subscription deleted");
      dispatch(fetchSubscriptions());
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track recurring bills and automate expense logging
        </p>
      </div>

      {/* Cost summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Monthly Cost</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">
            {formatCurrency(totalMonthlyCost)}
          </p>
          <p className="mt-1 text-xs text-gray-400">Active subscriptions only</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Yearly Cost</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">
            {formatCurrency(totalYearlyCost)}
          </p>
          <p className="mt-1 text-xs text-gray-400">Active subscriptions only</p>
        </div>
      </div>

      {/* Add subscription form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Add Subscription
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Service Name
            </label>
            <input
              name="serviceName"
              required
              value={formData.serviceName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Netflix"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount (₹)
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
              placeholder="499"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Billing Cycle
            </label>
            <select
              name="billingCycle"
              required
              value={formData.billingCycle}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select cycle</option>
              {BILLING_CYCLES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Next Billing Date
            </label>
            <input
              name="nextBillingDate"
              type="date"
              required
              value={formData.nextBillingDate}
              onChange={handleChange}
              className={inputClass}
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

          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 pb-2">
              <input
                name="autoAddExpense"
                type="checkbox"
                checked={formData.autoAddExpense}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">
                Auto-add expense on billing
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Subscription"}
        </button>
      </form>

      {/* Subscription cards */}
      {loading && subscriptions.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <p className="text-sm text-gray-400">No subscriptions yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <div
              key={sub._id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {sub.serviceName}
                  </h3>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[sub.status]}`}
                  >
                    {sub.status}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(sub._id)}
                  title="Delete"
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <p className="mt-3 text-2xl font-bold text-gray-900">
                {formatCurrency(sub.amount)}
                <span className="text-sm font-normal text-gray-400">
                  /{sub.billingCycle}
                </span>
              </p>

              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <p>
                  Next due:{" "}
                  <span className="font-medium text-gray-700">
                    {formatDate(sub.nextBillingDate)}
                  </span>
                </p>
                <p>
                  Category:{" "}
                  <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-indigo-700">
                    {sub.category}
                  </span>
                </p>
                {sub.autoAddExpense && (
                  <p className="text-indigo-600">Auto-add expense enabled</p>
                )}
              </div>

              {sub.status !== "cancelled" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handlePause(sub)}
                    className="flex-1 rounded-lg border border-yellow-200 bg-yellow-50 py-1.5 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-100"
                  >
                    {sub.status === "paused" ? "Resume" : "Pause"}
                  </button>
                  <button
                    onClick={() => handleCancel(sub._id)}
                    className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;

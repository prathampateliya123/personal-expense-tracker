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
  active: "bg-income/15 text-income",
  paused: "bg-warning/15 text-warning",
  cancelled: "bg-background text-textMuted",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">Subscriptions</h1>
        <p className="page-subheading">
          Track recurring bills and automate expense logging
        </p>
      </div>

      {/* Cost summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm font-medium text-textSecondary">Total Monthly Cost</p>
          <p className="mt-1 text-2xl font-bold text-primaryGlow">
            {formatCurrency(totalMonthlyCost)}
          </p>
          <p className="mt-1 text-xs text-textMuted">Active subscriptions only</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-textSecondary">Total Yearly Cost</p>
          <p className="mt-1 text-2xl font-bold text-primaryGlow">
            {formatCurrency(totalYearlyCost)}
          </p>
          <p className="mt-1 text-xs text-textMuted">Active subscriptions only</p>
        </div>
      </div>

      {/* Add subscription form */}
      <form onSubmit={handleSubmit} className="card p-6">
        <h2 className="section-heading mb-4">Add Subscription</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Service Name
            </label>
            <input
              name="serviceName"
              required
              value={formData.serviceName}
              onChange={handleChange}
              className="input-field"
              placeholder="Netflix"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
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
              className="input-field"
              placeholder="499"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Billing Cycle
            </label>
            <select
              name="billingCycle"
              required
              value={formData.billingCycle}
              onChange={handleChange}
              className="input-field"
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
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Next Billing Date
            </label>
            <input
              name="nextBillingDate"
              type="date"
              required
              value={formData.nextBillingDate}
              onChange={handleChange}
              className="input-field"
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

          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 pb-2">
              <input
                name="autoAddExpense"
                type="checkbox"
                checked={formData.autoAddExpense}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-textSecondary">
                Auto-add expense on billing
              </span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-4">
          {loading ? "Adding..." : "Add Subscription"}
        </button>
      </form>

      {/* Subscription cards */}
      {loading && subscriptions.length === 0 ? (
        <div className="card flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="card flex h-32 items-center justify-center">
          <p className="text-sm text-textMuted">No subscriptions yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <div key={sub._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-textPrimary">
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
                  className="rounded-lg p-1.5 text-textMuted transition hover:bg-expense/10 hover:text-expense"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <p className="mt-3 text-2xl font-bold text-textPrimary">
                {formatCurrency(sub.amount)}
                <span className="text-sm font-normal text-textMuted">
                  /{sub.billingCycle}
                </span>
              </p>

              <div className="mt-3 space-y-1 text-xs text-textSecondary">
                <p>
                  Next due:{" "}
                  <span className="font-medium text-textPrimary">
                    {formatDate(sub.nextBillingDate)}
                  </span>
                </p>
                <p>
                  Category:{" "}
                  <span className="badge-primary">{sub.category}</span>
                </p>
                {sub.autoAddExpense && (
                  <p className="text-primaryGlow">Auto-add expense enabled</p>
                )}
              </div>

              {sub.status !== "cancelled" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handlePause(sub)}
                    className="btn-secondary flex-1 py-1.5 text-xs"
                  >
                    {sub.status === "paused" ? "Resume" : "Pause"}
                  </button>
                  <button
                    onClick={() => handleCancel(sub._id)}
                    className="btn-danger flex-1 py-1.5 text-xs"
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

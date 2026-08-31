/**
 * pages/TripDetails.jsx
 * Single trip view — header, budget summary, category pie chart, expense list.
 */

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import {
  fetchTripDetails,
  closeTrip,
  deleteTrip,
  clearTripDetails,
  clearError,
} from "../redux/tripSlice";
import {
  addExpense,
  updateExpense,
  deleteExpense,
} from "../redux/expenseSlice";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "../utils/themeConstants";

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentTrip,
    tripExpenses,
    tripSummary,
    categoryBreakdown,
    detailsLoading,
    loading,
    error,
  } = useSelector((state) => state.trips);
  const { loading: expenseLoading } = useSelector((state) => state.expenses);

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    dispatch(fetchTripDetails(id));
    return () => {
      dispatch(clearTripDetails());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const refreshDetails = () => dispatch(fetchTripDetails(id));

  const handleAddOrUpdate = async (formData) => {
    if (editingExpense) {
      const result = await dispatch(
        updateExpense({ id: editingExpense._id, expenseData: formData })
      );
      if (updateExpense.fulfilled.match(result)) {
        toast.success("Expense updated");
        setEditingExpense(null);
        refreshDetails();
      }
    } else {
      const result = await dispatch(addExpense(formData));
      if (addExpense.fulfilled.match(result)) {
        toast.success("Expense added to trip");
        setShowForm(false);
        refreshDetails();
      }
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    const result = await dispatch(deleteExpense(expenseId));
    if (deleteExpense.fulfilled.match(result)) {
      toast.success("Expense deleted");
      refreshDetails();
    }
  };

  const handleCloseTrip = async () => {
    if (!window.confirm("Mark this trip as completed?")) return;
    const result = await dispatch(closeTrip(id));
    if (closeTrip.fulfilled.match(result)) {
      toast.success("Trip completed");
      refreshDetails();
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm("Delete this trip? Expenses will be kept but unlinked."))
      return;
    const result = await dispatch(deleteTrip(id));
    if (deleteTrip.fulfilled.match(result)) {
      toast.success("Trip deleted");
      navigate("/trips");
    }
  };

  if (detailsLoading && !currentTrip) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="text-center">
        <p className="text-textSecondary">Trip not found</p>
        <Link to="/trips" className="mt-2 text-sm text-primaryGlow hover:underline">
          Back to Trips
        </Link>
      </div>
    );
  }

  const pieData = categoryBreakdown.map((item) => ({
    name: item.category,
    value: item.total,
  }));
  const hasCategoryData = pieData.some((d) => d.value > 0);
  const isOverBudget = tripSummary && tripSummary.totalSpent > tripSummary.budget;
  const barWidth = Math.min(tripSummary?.percentageUsed || 0, 100);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/trips"
        className="inline-flex items-center gap-1 text-sm text-textSecondary transition hover:text-primaryGlow"
      >
        ← Back to Trips
      </Link>

      {/* Trip header */}
      <div className="card overflow-hidden bg-gradient-to-r from-secondary/10 to-primary/10">
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface shadow-sm">
                <svg
                  className="h-7 w-7 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3 21l18-9L3 3l3 9zm0 0h7.5"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="page-heading">{currentTrip.tripName}</h1>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      currentTrip.status === "ongoing"
                        ? "bg-secondary/15 text-secondary"
                        : "bg-background text-textMuted"
                    }`}
                  >
                    {currentTrip.status === "ongoing" ? "Ongoing" : "Completed"}
                  </span>
                </div>
                <p className="mt-1 text-textSecondary">{currentTrip.destination}</p>
                <p className="mt-0.5 text-sm text-textMuted">
                  {formatDate(currentTrip.startDate)} —{" "}
                  {formatDate(currentTrip.endDate)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {currentTrip.status === "ongoing" && (
                <button
                  onClick={handleCloseTrip}
                  disabled={loading}
                  className="btn-secondary disabled:opacity-60"
                >
                  Close Trip
                </button>
              )}
              <button
                onClick={handleDeleteTrip}
                disabled={loading}
                className="btn-danger disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Budget summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-textSecondary">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-expense">
            {formatCurrency(tripSummary?.totalSpent, tripSummary?.currency)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-textSecondary">Budget</p>
          <p className="mt-1 text-2xl font-bold text-textPrimary">
            {formatCurrency(tripSummary?.budget, tripSummary?.currency)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-textSecondary">Remaining</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              isOverBudget ? "text-expense" : "text-income"
            }`}
          >
            {formatCurrency(tripSummary?.remaining, tripSummary?.currency)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-textSecondary">Budget usage</span>
          <span className="font-medium text-textPrimary">
            {tripSummary?.percentageUsed}%
            {isOverBudget && (
              <span className="ml-1 text-expense">(over budget)</span>
            )}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-background">
          <div
            className={`h-full rounded-full transition-all ${
              isOverBudget
                ? "bg-expense"
                : barWidth > 80
                  ? "bg-warning"
                  : "bg-secondary"
            }`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Category pie chart + add expense */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="section-heading mb-4">Spend by Category</h2>
          {hasCategoryData ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value, tripSummary?.currency)
                  }
                  contentStyle={CHART_TOOLTIP_STYLE}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-textSecondary">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-textMuted">No expenses yet</p>
            </div>
          )}
        </div>

        <div>
          {!showForm && !editingExpense && currentTrip.status === "ongoing" && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary mb-4 w-full py-2.5"
            >
              + Add Expense to Trip
            </button>
          )}
          {(showForm || editingExpense) && (
            <ExpenseForm
              tripId={id}
              expense={editingExpense}
              loading={expenseLoading}
              onSubmit={handleAddOrUpdate}
              onCancel={() => {
                setShowForm(false);
                setEditingExpense(null);
              }}
            />
          )}
        </div>
      </div>

      {/* Expense list */}
      <div>
        <h2 className="section-heading mb-4">
          Trip Expenses ({tripExpenses.length})
        </h2>
        <ExpenseList
          expenses={tripExpenses}
          loading={detailsLoading}
          onEdit={(exp) => {
            setShowForm(false);
            setEditingExpense(exp);
          }}
          onDelete={handleDeleteExpense}
        />
      </div>
    </div>
  );
};

export default TripDetails;

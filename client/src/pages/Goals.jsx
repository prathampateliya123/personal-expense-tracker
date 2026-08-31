/**
 * pages/Goals.jsx
 * Goal-based savings page — create goals, track progress, add contributions.
 * Active/paused goals shown in a card grid; completed goals in a separate section.
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { EXPENSE_CATEGORIES } from "../utils/expenseConstants";
import {
  fetchGoals,
  createGoal,
  addContribution,
  deleteGoal,
  clearError,
} from "../redux/goalSlice";

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

/** Contribution modal */
const ContributionModal = ({ goal, onClose, onSubmit, loading }) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(parseFloat(amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="card w-full max-w-sm p-6">
        <h3 className="section-heading text-lg">Add Contribution</h3>
        <p className="mt-1 text-sm text-textSecondary">{goal.goalName}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder="1000"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Saving..." : "Add"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** Single goal card */
const GoalCard = ({ goal, onContribute, onDelete, completed = false }) => {
  const barWidth = Math.min(goal.percentage, 100);

  return (
    <div
      className={`card p-5 ${
        completed ? "border-income/30 bg-income/5" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-textPrimary">{goal.goalName}</h3>
            {completed && (
              <span className="flex items-center gap-1 rounded-full bg-income/15 px-2 py-0.5 text-xs font-medium text-income">
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Completed
              </span>
            )}
            {goal.status === "paused" && (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                Paused
              </span>
            )}
          </div>
          <span className="badge-primary mt-1 inline-block">{goal.category}</span>
        </div>
        <button
          onClick={() => onDelete(goal._id)}
          title="Delete goal"
          className="rounded-lg p-1.5 text-textMuted transition hover:bg-expense/10 hover:text-expense"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-sm">
          <span className="font-medium text-textSecondary">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </span>
          <span
            className={`font-semibold ${
              completed ? "text-income" : "text-primaryGlow"
            }`}
          >
            {goal.percentage}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-background">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completed ? "bg-income" : "bg-primary"
            }`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-textMuted">
        <span>Target: {formatDate(goal.targetDate)}</span>
        {!completed && (
          <span
            className={
              goal.daysRemaining < 0
                ? "font-medium text-expense"
                : goal.daysRemaining <= 7
                  ? "font-medium text-warning"
                  : ""
            }
          >
            {goal.daysRemaining < 0
              ? `${Math.abs(goal.daysRemaining)} days overdue`
              : `${goal.daysRemaining} days remaining`}
          </span>
        )}
      </div>

      {!completed && goal.status !== "paused" && (
        <button
          onClick={() => onContribute(goal)}
          className="mt-4 w-full rounded-lg border border-primary/30 bg-primary/10 py-2 text-sm font-semibold text-primaryGlow transition hover:bg-primary/20"
        >
          Add Contribution
        </button>
      )}
    </div>
  );
};

const Goals = () => {
  const dispatch = useDispatch();
  const { goals, loading, error } = useSelector((state) => state.goals);
  const [formData, setFormData] = useState({
    goalName: "",
    targetAmount: "",
    targetDate: "",
    category: "",
  });
  const [contributionGoal, setContributionGoal] = useState(null);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      createGoal({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
      })
    );

    if (createGoal.fulfilled.match(result)) {
      toast.success("Goal created successfully");
      setFormData({ goalName: "", targetAmount: "", targetDate: "", category: "" });
      dispatch(fetchGoals());
    }
  };

  const handleContribution = async (amount) => {
    const result = await dispatch(
      addContribution({ id: contributionGoal._id, amount })
    );

    if (addContribution.fulfilled.match(result)) {
      const goal = result.payload;
      if (goal.status === "completed") {
        toast.success("🎉 Goal completed! Congratulations!");
      } else {
        toast.success("Contribution added successfully");
      }
      setContributionGoal(null);
      dispatch(fetchGoals());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    const result = await dispatch(deleteGoal(id));
    if (deleteGoal.fulfilled.match(result)) {
      toast.success("Goal deleted successfully");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-heading">Savings Goals</h1>
        <p className="page-subheading">
          Set targets and track your progress toward financial goals
        </p>
      </div>

      {/* Create goal form */}
      <form onSubmit={handleCreateGoal} className="card p-6">
        <h2 className="section-heading mb-4">Create Goal</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Goal Name
            </label>
            <input
              name="goalName"
              type="text"
              required
              value={formData.goalName}
              onChange={handleFormChange}
              className="input-field"
              placeholder="Emergency Fund"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Target Amount (₹)
            </label>
            <input
              name="targetAmount"
              type="number"
              required
              min="1"
              step="0.01"
              value={formData.targetAmount}
              onChange={handleFormChange}
              className="input-field"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Target Date
            </label>
            <input
              name="targetDate"
              type="date"
              required
              value={formData.targetDate}
              onChange={handleFormChange}
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
              onChange={handleFormChange}
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
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-4">
          {loading ? "Creating..." : "Create Goal"}
        </button>
      </form>

      {/* Active goals grid */}
      <div>
        <h2 className="section-heading mb-4">Active Goals</h2>
        {loading && goals.length === 0 ? (
          <div className="card flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="card flex h-32 items-center justify-center">
            <p className="text-sm text-textMuted">No active goals yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onContribute={setContributionGoal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-income"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h2 className="section-heading">Completed Goals</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onContribute={setContributionGoal}
                onDelete={handleDelete}
                completed
              />
            ))}
          </div>
        </div>
      )}

      {/* Contribution modal */}
      {contributionGoal && (
        <ContributionModal
          goal={contributionGoal}
          onClose={() => setContributionGoal(null)}
          onSubmit={handleContribution}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Goals;

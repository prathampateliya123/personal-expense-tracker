/**
 * pages/Trips.jsx
 * Trip list with travel-themed cards, budget progress, and create trip modal.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchTrips,
  createTrip,
  deleteTrip,
  closeTrip,
  clearError,
} from "../redux/tripSlice";

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

const PlaneIcon = () => (
  <svg
    className="h-6 w-6 text-secondary"
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
);

const CreateTripModal = ({ onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({
    tripName: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    currency: "INR",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      budget: parseFloat(form.budget),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="card w-full max-w-lg p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15">
            <PlaneIcon />
          </div>
          <div>
            <h3 className="section-heading">Create Trip</h3>
            <p className="text-sm text-textSecondary">Plan and track travel expenses</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-textSecondary">
                Trip Name
              </label>
              <input
                name="tripName"
                required
                value={form.tripName}
                onChange={handleChange}
                className="input-field"
                placeholder="Summer in Goa"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-textSecondary">
                Destination
              </label>
              <input
                name="destination"
                required
                value={form.destination}
                onChange={handleChange}
                className="input-field"
                placeholder="Goa, India"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-textSecondary">
                Start Date
              </label>
              <input
                name="startDate"
                type="date"
                required
                value={form.startDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-textSecondary">
                End Date
              </label>
              <input
                name="endDate"
                type="date"
                required
                value={form.endDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-textSecondary">
                Budget
              </label>
              <input
                name="budget"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.budget}
                onChange={handleChange}
                className="input-field"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-textSecondary">
                Currency
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="input-field"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Creating..." : "Create Trip"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TripCard = ({ trip, onClose, onDelete }) => {
  const barWidth = Math.min(trip.percentageUsed, 100);
  const isOverBudget = trip.totalSpent > trip.budget;
  const barColor = isOverBudget
    ? "bg-expense"
    : barWidth > 80
      ? "bg-warning"
      : "bg-secondary";

  return (
    <div className="card group relative overflow-hidden transition hover:shadow-glow">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-secondary/10 opacity-60" />
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20">
              <PlaneIcon />
            </div>
            <div>
              <Link
                to={`/trips/${trip._id}`}
                className="font-semibold text-textPrimary transition hover:text-primaryGlow"
              >
                {trip.tripName}
              </Link>
              <p className="mt-0.5 text-sm text-textSecondary">{trip.destination}</p>
              <p className="mt-1 text-xs text-textMuted">
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              trip.status === "ongoing"
                ? "bg-secondary/15 text-secondary"
                : "bg-background text-textMuted"
            }`}
          >
            {trip.status === "ongoing" ? "Ongoing" : "Completed"}
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-textSecondary">
              {formatCurrency(trip.totalSpent, trip.currency)} spent
            </span>
            <span className="font-medium text-textPrimary">
              {formatCurrency(trip.budget, trip.currency)} budget
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-textMuted">
            {trip.percentageUsed}% of budget used
            {isOverBudget && (
              <span className="ml-1 font-medium text-expense">— over budget!</span>
            )}
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/trips/${trip._id}`}
            className="btn-primary flex-1 py-1.5 text-center text-xs"
          >
            View Details
          </Link>
          {trip.status === "ongoing" && (
            <button
              onClick={() => onClose(trip._id)}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              Close Trip
            </button>
          )}
          <button
            onClick={() => onDelete(trip._id)}
            className="btn-danger px-3 py-1.5 text-xs"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Trips = () => {
  const dispatch = useDispatch();
  const { trips, loading, error } = useSelector((state) => state.trips);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleCreate = async (formData) => {
    const result = await dispatch(createTrip(formData));
    if (createTrip.fulfilled.match(result)) {
      toast.success("Trip created!");
      setShowCreate(false);
      dispatch(fetchTrips());
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm("Mark this trip as completed?")) return;
    const result = await dispatch(closeTrip(id));
    if (closeTrip.fulfilled.match(result)) {
      toast.success("Trip marked as completed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip? Expenses will be kept but unlinked."))
      return;
    const result = await dispatch(deleteTrip(id));
    if (deleteTrip.fulfilled.match(result)) {
      toast.success("Trip deleted");
    }
  };

  const ongoingTrips = trips.filter((t) => t.status === "ongoing");
  const completedTrips = trips.filter((t) => t.status === "completed");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Trips</h1>
          <p className="page-subheading">
            Manage travel budgets and track trip expenses
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2 py-2.5"
        >
          <PlaneIcon />
          Create Trip
        </button>
      </div>

      {loading && trips.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : trips.length === 0 ? (
        <div className="card flex flex-col items-center justify-center border-dashed py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15">
            <PlaneIcon />
          </div>
          <p className="font-medium text-textPrimary">No trips yet</p>
          <p className="mt-1 text-sm text-textMuted">
            Create your first trip to start tracking travel expenses
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary mt-4"
          >
            Create Trip
          </button>
        </div>
      ) : (
        <>
          {ongoingTrips.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-textMuted">
                Ongoing
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {ongoingTrips.map((trip) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    onClose={handleClose}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}

          {completedTrips.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-textMuted">
                Completed
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {completedTrips.map((trip) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    onClose={handleClose}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {showCreate && (
        <CreateTripModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Trips;

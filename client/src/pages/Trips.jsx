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
    className="h-6 w-6 text-sky-600"
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

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
            <PlaneIcon />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create Trip</h3>
            <p className="text-sm text-gray-500">Plan and track travel expenses</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Trip Name
              </label>
              <input
                name="tripName"
                required
                value={form.tripName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Summer in Goa"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Destination
              </label>
              <input
                name="destination"
                required
                value={form.destination}
                onChange={handleChange}
                className={inputClass}
                placeholder="Goa, India"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                name="startDate"
                type="date"
                required
                value={form.startDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                name="endDate"
                type="date"
                required
                value={form.endDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
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
                className={inputClass}
                placeholder="50000"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className={inputClass}
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
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Trip"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
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
    ? "bg-red-500"
    : barWidth > 80
      ? "bg-amber-500"
      : "bg-sky-500";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-sky-50 opacity-60" />
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100">
              <PlaneIcon />
            </div>
            <div>
              <Link
                to={`/trips/${trip._id}`}
                className="font-semibold text-gray-900 transition hover:text-indigo-600"
              >
                {trip.tripName}
              </Link>
              <p className="mt-0.5 text-sm text-gray-500">{trip.destination}</p>
              <p className="mt-1 text-xs text-gray-400">
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              trip.status === "ongoing"
                ? "bg-sky-100 text-sky-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {trip.status === "ongoing" ? "Ongoing" : "Completed"}
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-gray-600">
              {formatCurrency(trip.totalSpent, trip.currency)} spent
            </span>
            <span className="font-medium text-gray-800">
              {formatCurrency(trip.budget, trip.currency)} budget
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {trip.percentageUsed}% of budget used
            {isOverBudget && (
              <span className="ml-1 font-medium text-red-500">— over budget!</span>
            )}
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/trips/${trip._id}`}
            className="flex-1 rounded-lg bg-indigo-50 py-1.5 text-center text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            View Details
          </Link>
          {trip.status === "ongoing" && (
            <button
              onClick={() => onClose(trip._id)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Close Trip
            </button>
          )}
          <button
            onClick={() => onDelete(trip._id)}
            className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
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
          <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage travel budgets and track trip expenses
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <PlaneIcon />
          Create Trip
        </button>
      </div>

      {loading && trips.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
            <PlaneIcon />
          </div>
          <p className="font-medium text-gray-700">No trips yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Create your first trip to start tracking travel expenses
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Create Trip
          </button>
        </div>
      ) : (
        <>
          {ongoingTrips.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
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
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
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

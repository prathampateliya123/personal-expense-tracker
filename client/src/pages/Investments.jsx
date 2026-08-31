/**
 * pages/Investments.jsx
 * Investment & savings tracker — portfolio summary, form, list, and pie chart.
 */

import { useEffect, useState } from "react";
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
import {
  INVESTMENT_TYPES,
  INVESTMENT_FREQUENCIES,
  TYPE_LABELS,
  CHART_COLORS,
} from "../utils/investmentConstants";
import {
  fetchInvestments,
  addInvestment,
  deleteInvestment,
  clearError,
} from "../redux/investmentSlice";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const GainLossText = ({ amount, percent, className = "" }) => {
  const isProfit = amount >= 0;
  return (
    <span className={`font-semibold ${isProfit ? "text-green-600" : "text-red-600"} ${className}`}>
      {isProfit ? "+" : ""}
      {formatCurrency(amount)} ({isProfit ? "+" : ""}
      {percent}%)
    </span>
  );
};

const Investments = () => {
  const dispatch = useDispatch();
  const { investments, summary, typeBreakdown, loading, error } = useSelector(
    (state) => state.investments
  );

  const [formData, setFormData] = useState({
    type: "",
    name: "",
    investedAmount: "",
    currentValue: "",
    startDate: "",
    maturityDate: "",
    frequency: "",
  });

  useEffect(() => {
    dispatch(fetchInvestments());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      addInvestment({
        ...formData,
        investedAmount: parseFloat(formData.investedAmount),
        currentValue: parseFloat(formData.currentValue),
        maturityDate: formData.maturityDate || null,
      })
    );

    if (addInvestment.fulfilled.match(result)) {
      toast.success("Investment added successfully");
      setFormData({
        type: "",
        name: "",
        investedAmount: "",
        currentValue: "",
        startDate: "",
        maturityDate: "",
        frequency: "",
      });
      dispatch(fetchInvestments());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this investment?")) return;
    const result = await dispatch(deleteInvestment(id));
    if (deleteInvestment.fulfilled.match(result)) {
      toast.success("Investment deleted");
      dispatch(fetchInvestments());
    }
  };

  const pieData = typeBreakdown.map((item) => ({
    name: TYPE_LABELS[item.type] || item.type,
    value: item.value,
  }));

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your portfolio and monitor gains or losses
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Invested</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalInvested)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Current Value</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">
            {formatCurrency(summary.totalCurrentValue)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Gain / Loss</p>
          <p className="mt-1 text-2xl font-bold">
            <GainLossText
              amount={summary.totalGainLoss}
              percent={summary.overallGainLossPercent}
            />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Add investment form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Add Investment
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select type</option>
                {INVESTMENT_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="HDFC Equity Fund"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Invested (₹)
                </label>
                <input
                  name="investedAmount"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.investedAmount}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Current (₹)
                </label>
                <input
                  name="currentValue"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Frequency
              </label>
              <select
                name="frequency"
                required
                value={formData.frequency}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select frequency</option>
                {INVESTMENT_FREQUENCIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Maturity (optional)
                </label>
                <input
                  name="maturityDate"
                  type="date"
                  value={formData.maturityDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add Investment"}
            </button>
          </div>
        </form>

        {/* Pie chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            Distribution by Type
          </h2>
          {pieData.length > 0 ? (
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
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-gray-400">No investments to chart yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Investment cards */}
      {loading && investments.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : investments.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <p className="text-sm text-gray-400">No investments yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Invested</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Current</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Gain/Loss</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Start</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Maturity</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {investments.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {inv.name}
                      <span className="mt-0.5 block text-xs capitalize text-gray-400">
                        {inv.frequency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {TYPE_LABELS[inv.type] || inv.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatCurrency(inv.investedAmount)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(inv.currentValue)}
                    </td>
                    <td className="px-4 py-3">
                      <GainLossText
                        amount={inv.gainLoss}
                        percent={inv.gainLossPercent}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(inv.startDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(inv.maturityDate)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(inv._id)}
                        title="Delete"
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;

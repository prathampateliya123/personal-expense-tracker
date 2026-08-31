/**
 * pages/WhatIfSimulator.jsx
 * Interactive what-if calculator for spending cuts and savings projections.
 * Uses client-side math for instant feedback; server calls for real data comparison.
 */

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import axiosInstance from "../utils/axiosInstance";
import { EXPENSE_CATEGORIES } from "../utils/expenseConstants";

const PERIOD_OPTIONS = [
  { value: 3, label: "3 months" },
  { value: 6, label: "6 months" },
  { value: 12, label: "12 months" },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const WhatIfSimulator = () => {
  // --- Spending cut simulator state ---
  const [cutForm, setCutForm] = useState({
    category: "",
    dailyCutAmount: 100,
    months: 6,
  });
  const [cutResult, setCutResult] = useState(null);
  const [cutLoading, setCutLoading] = useState(false);

  // Live client-side projected savings
  const liveProjectedSavings = useMemo(
    () => cutForm.dailyCutAmount * 30 * cutForm.months,
    [cutForm.dailyCutAmount, cutForm.months]
  );

  // --- Savings rate simulator state ---
  const [savingsForm, setSavingsForm] = useState({
    monthlyIncome: "",
    monthlySavingsGoal: "",
    targetAmount: "",
    interestRate: 0,
  });
  const [savingsResult, setSavingsResult] = useState(null);
  const [savingsLoading, setSavingsLoading] = useState(false);

  const handleCutSubmit = async (e) => {
    e.preventDefault();
    if (!cutForm.category) {
      toast.error("Please select a category");
      return;
    }

    setCutLoading(true);
    try {
      const { data } = await axiosInstance.post("/simulator/simulate-cut", {
        category: cutForm.category,
        dailyCutAmount: cutForm.dailyCutAmount,
        months: cutForm.months,
      });
      setCutResult(data.simulation);
    } catch (err) {
      toast.error(err.response?.data?.message || "Simulation failed");
    } finally {
      setCutLoading(false);
    }
  };

  const handleSavingsSubmit = async (e) => {
    e.preventDefault();
    setSavingsLoading(true);
    try {
      const { data } = await axiosInstance.post(
        "/simulator/simulate-savings-rate",
        {
          monthlyIncome: parseFloat(savingsForm.monthlyIncome),
          monthlySavingsGoal: parseFloat(savingsForm.monthlySavingsGoal),
          targetAmount: parseFloat(savingsForm.targetAmount),
          interestRate: parseFloat(savingsForm.interestRate) || 0,
        }
      );
      setSavingsResult(data.simulation);
    } catch (err) {
      toast.error(err.response?.data?.message || "Simulation failed");
    } finally {
      setSavingsLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">What-If Simulator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Explore how small changes today can impact your finances tomorrow
        </p>
      </div>

      {/* Section 1: Spending cut simulator */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Spending Cut Simulator
        </h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form */}
          <form
            onSubmit={handleCutSubmit}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={cutForm.category}
                  onChange={(e) =>
                    setCutForm({ ...cutForm, category: e.target.value })
                  }
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

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Daily amount to cut
                  </label>
                  <span className="text-lg font-bold text-indigo-600">
                    {formatCurrency(cutForm.dailyCutAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={cutForm.dailyCutAmount}
                  onChange={(e) =>
                    setCutForm({
                      ...cutForm,
                      dailyCutAmount: parseInt(e.target.value, 10),
                    })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>₹0</span>
                  <span>₹500</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Time period
                </label>
                <select
                  value={cutForm.months}
                  onChange={(e) =>
                    setCutForm({
                      ...cutForm,
                      months: parseInt(e.target.value, 10),
                    })
                  }
                  className={inputClass}
                >
                  {PERIOD_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={cutLoading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {cutLoading ? "Calculating..." : "Compare with my spending"}
              </button>
            </div>
          </form>

          {/* Live result card */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm">
            <p className="text-sm font-medium text-indigo-600">
              Projected Savings (live)
            </p>
            <p className="mt-2 text-4xl font-bold text-indigo-700">
              {formatCurrency(liveProjectedSavings)}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              By cutting{" "}
              <span className="font-semibold">
                {formatCurrency(cutForm.dailyCutAmount)}/day
              </span>{" "}
              for{" "}
              <span className="font-semibold">
                {PERIOD_OPTIONS.find((p) => p.value === cutForm.months)?.label}
              </span>
            </p>

            {cutResult && (
              <div className="mt-6 space-y-3 border-t border-indigo-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  Based on your actual spending
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">Avg daily spend</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(cutResult.currentAvgDailySpend)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">After cut</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(cutResult.projectedDailySpend)}
                    </p>
                  </div>
                </div>
                {cutResult.percentReduction > 0 && (
                  <p className="text-sm text-gray-600">
                    That&apos;s a{" "}
                    <span className="font-semibold text-green-600">
                      {cutResult.percentReduction}% reduction
                    </span>{" "}
                    in your {cutResult.category} spending
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Based on {cutResult.transactionCount} transactions over the
                  last {cutResult.lookbackDays} days
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Savings goal simulator */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Savings Goal Simulator
        </h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleSavingsSubmit}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Monthly Income (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={savingsForm.monthlyIncome}
                  onChange={(e) =>
                    setSavingsForm({
                      ...savingsForm,
                      monthlyIncome: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Monthly Savings (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={savingsForm.monthlySavingsGoal}
                  onChange={(e) =>
                    setSavingsForm({
                      ...savingsForm,
                      monthlySavingsGoal: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={savingsForm.targetAmount}
                  onChange={(e) =>
                    setSavingsForm({
                      ...savingsForm,
                      targetAmount: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="500000"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Annual Interest Rate (%)
                  </label>
                  <span className="text-sm font-bold text-indigo-600">
                    {savingsForm.interestRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={savingsForm.interestRate}
                  onChange={(e) =>
                    setSavingsForm({
                      ...savingsForm,
                      interestRate: parseFloat(e.target.value),
                    })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>0%</span>
                  <span>15%</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingsLoading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingsLoading ? "Calculating..." : "Calculate Timeline"}
              </button>
            </div>
          </form>

          {/* Savings result */}
          <div className="space-y-4">
            {savingsResult ? (
              <>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Time to reach goal
                  </p>
                  <p className="mt-1 text-4xl font-bold text-indigo-600">
                    {savingsResult.monthsRequired} months
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    ({(savingsResult.monthsRequired / 12).toFixed(1)} years)
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Savings rate</p>
                      <p className="font-semibold text-gray-800">
                        {savingsResult.savingsRate}% of income
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Without interest</p>
                      <p className="font-semibold text-gray-800">
                        {savingsResult.simpleMonths} months
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Final balance</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(savingsResult.finalBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Interest rate</p>
                      <p className="font-semibold text-gray-800">
                        {savingsResult.interestRate}% p.a.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                {savingsResult.projection?.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-gray-700">
                      Savings Growth Projection
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={savingsResult.projection}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          label={{
                            value: "Months",
                            position: "insideBottom",
                            offset: -5,
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          tickFormatter={(v) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                          }
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "13px",
                          }}
                        />
                        <Legend />
                        <ReferenceLine
                          y={savingsResult.targetAmount}
                          stroke="#ef4444"
                          strokeDasharray="5 5"
                          label={{
                            value: "Target",
                            position: "insideTopRight",
                            fontSize: 11,
                            fill: "#ef4444",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          name="Balance"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Bar chart comparison: with vs without interest */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-gray-700">
                    Timeline Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={[
                        {
                          name: "No Interest",
                          months: savingsResult.simpleMonths,
                        },
                        {
                          name: "With Interest",
                          months: savingsResult.monthsRequired,
                        },
                      ]}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        width={90}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} months`, "Duration"]}
                      />
                      <Bar dataKey="months" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
                <p className="text-sm text-gray-400">
                  Enter your details and calculate to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhatIfSimulator;

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
import {
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
  CHART_AXIS_TICK,
  CHART_AXIS_LINE,
  CHART_GRID,
  INCOME_LINE_COLOR,
  EXPENSE_LINE_COLOR,
} from "../utils/themeConstants";

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

  return (
    <div className="space-y-10">
      <div>
        <h1 className="page-heading">What-If Simulator</h1>
        <p className="page-subheading">
          Explore how small changes today can impact your finances tomorrow
        </p>
      </div>

      {/* Section 1: Spending cut simulator */}
      <section className="space-y-6">
        <h2 className="section-heading">Spending Cut Simulator</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form */}
          <form onSubmit={handleCutSubmit} className="card p-6">
            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-textSecondary">
                  Category
                </label>
                <select
                  value={cutForm.category}
                  onChange={(e) =>
                    setCutForm({ ...cutForm, category: e.target.value })
                  }
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

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-textSecondary">
                    Daily amount to cut
                  </label>
                  <span className="text-lg font-bold text-primaryGlow">
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
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-border accent-primary"
                />
                <div className="mt-1 flex justify-between text-xs text-textMuted">
                  <span>₹0</span>
                  <span>₹500</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-textSecondary">
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
                  className="input-field"
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
                className="btn-primary w-full py-2.5"
              >
                {cutLoading ? "Calculating..." : "Compare with my spending"}
              </button>
            </div>
          </form>

          {/* Live result card */}
          <div className="card border-primary/30 bg-primary/5 p-6">
            <p className="text-sm font-medium text-primaryGlow">
              Projected Savings (live)
            </p>
            <p className="mt-2 text-4xl font-bold text-textPrimary">
              {formatCurrency(liveProjectedSavings)}
            </p>
            <p className="mt-2 text-sm text-textSecondary">
              By cutting{" "}
              <span className="font-semibold text-textPrimary">
                {formatCurrency(cutForm.dailyCutAmount)}/day
              </span>{" "}
              for{" "}
              <span className="font-semibold text-textPrimary">
                {PERIOD_OPTIONS.find((p) => p.value === cutForm.months)?.label}
              </span>
            </p>

            {cutResult && (
              <div className="mt-6 space-y-3 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primaryGlow">
                  Based on your actual spending
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-surface p-3">
                    <p className="text-xs text-textMuted">Avg daily spend</p>
                    <p className="text-lg font-bold text-expense">
                      {formatCurrency(cutResult.currentAvgDailySpend)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-3">
                    <p className="text-xs text-textMuted">After cut</p>
                    <p className="text-lg font-bold text-income">
                      {formatCurrency(cutResult.projectedDailySpend)}
                    </p>
                  </div>
                </div>
                {cutResult.percentReduction > 0 && (
                  <p className="text-sm text-textSecondary">
                    That&apos;s a{" "}
                    <span className="font-semibold text-income">
                      {cutResult.percentReduction}% reduction
                    </span>{" "}
                    in your {cutResult.category} spending
                  </p>
                )}
                <p className="text-xs text-textMuted">
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
        <h2 className="section-heading">Savings Goal Simulator</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={handleSavingsSubmit} className="card p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-textSecondary">
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
                  className="input-field"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-textSecondary">
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
                  className="input-field"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-textSecondary">
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
                  className="input-field"
                  placeholder="500000"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-textSecondary">
                    Annual Interest Rate (%)
                  </label>
                  <span className="text-sm font-bold text-primaryGlow">
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
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-border accent-primary"
                />
                <div className="mt-1 flex justify-between text-xs text-textMuted">
                  <span>0%</span>
                  <span>15%</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingsLoading}
                className="btn-primary w-full py-2.5"
              >
                {savingsLoading ? "Calculating..." : "Calculate Timeline"}
              </button>
            </div>
          </form>

          {/* Savings result */}
          <div className="space-y-4">
            {savingsResult ? (
              <>
                <div className="card p-6">
                  <p className="text-sm font-medium text-textSecondary">
                    Time to reach goal
                  </p>
                  <p className="mt-1 text-4xl font-bold text-primaryGlow">
                    {savingsResult.monthsRequired} months
                  </p>
                  <p className="mt-1 text-sm text-textSecondary">
                    ({(savingsResult.monthsRequired / 12).toFixed(1)} years)
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-textMuted">Savings rate</p>
                      <p className="font-semibold text-textPrimary">
                        {savingsResult.savingsRate}% of income
                      </p>
                    </div>
                    <div>
                      <p className="text-textMuted">Without interest</p>
                      <p className="font-semibold text-textPrimary">
                        {savingsResult.simpleMonths} months
                      </p>
                    </div>
                    <div>
                      <p className="text-textMuted">Final balance</p>
                      <p className="font-semibold text-income">
                        {formatCurrency(savingsResult.finalBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-textMuted">Interest rate</p>
                      <p className="font-semibold text-textPrimary">
                        {savingsResult.interestRate}% p.a.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                {savingsResult.projection?.length > 0 && (
                  <div className="card p-6">
                    <h3 className="section-heading mb-4">
                      Savings Growth Projection
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={savingsResult.projection}>
                        <CartesianGrid {...CHART_GRID} />
                        <XAxis
                          dataKey="month"
                          tick={CHART_AXIS_TICK}
                          axisLine={CHART_AXIS_LINE}
                          tickLine={CHART_AXIS_LINE}
                          label={{
                            value: "Months",
                            position: "insideBottom",
                            offset: -5,
                            fontSize: 12,
                            fill: "#9CA3AF",
                          }}
                        />
                        <YAxis
                          tick={CHART_AXIS_TICK}
                          axisLine={CHART_AXIS_LINE}
                          tickLine={CHART_AXIS_LINE}
                          tickFormatter={(v) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                          }
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={CHART_TOOLTIP_STYLE}
                        />
                        <Legend />
                        <ReferenceLine
                          y={savingsResult.targetAmount}
                          stroke={EXPENSE_LINE_COLOR}
                          strokeDasharray="5 5"
                          label={{
                            value: "Target",
                            position: "insideTopRight",
                            fontSize: 11,
                            fill: EXPENSE_LINE_COLOR,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          name="Balance"
                          stroke={INCOME_LINE_COLOR}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Bar chart comparison: with vs without interest */}
                <div className="card p-6">
                  <h3 className="section-heading mb-4">Timeline Comparison</h3>
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
                      <CartesianGrid {...CHART_GRID} />
                      <XAxis
                        type="number"
                        tick={CHART_AXIS_TICK}
                        axisLine={CHART_AXIS_LINE}
                        tickLine={CHART_AXIS_LINE}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={CHART_AXIS_TICK}
                        axisLine={CHART_AXIS_LINE}
                        tickLine={CHART_AXIS_LINE}
                        width={90}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} months`, "Duration"]}
                        contentStyle={CHART_TOOLTIP_STYLE}
                      />
                      <Bar
                        dataKey="months"
                        fill={CHART_COLORS[0]}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="card flex h-64 items-center justify-center">
                <p className="text-sm text-textMuted">
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

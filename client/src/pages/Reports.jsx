/**
 * pages/Reports.jsx
 * Financial reports — monthly preview, date-range exports to Excel/PDF.
 */

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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

/** Trigger a file download from a blob response */
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const Reports = () => {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Fetch monthly summary when month/year changes
  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const { data } = await axiosInstance.get("/reports/monthly-summary", {
          params: { month, year },
        });
        setSummary(data.summary);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load report");
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [month, year]);

  const validateDateRange = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates for export");
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date must be before end date");
      return false;
    }
    return true;
  };

  const handleExportExcel = async () => {
    if (!validateDateRange()) return;
    setExportingExcel(true);
    try {
      const response = await axiosInstance.get("/reports/export/excel", {
        params: { startDate, endDate },
        responseType: "blob",
      });
      downloadBlob(response.data, `expense-report-${startDate}-to-${endDate}.xlsx`);
      toast.success("Excel report downloaded");
    } catch (err) {
      toast.error("Failed to export Excel report");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    if (!validateDateRange()) return;
    setExportingPdf(true);
    try {
      const response = await axiosInstance.get("/reports/export/pdf", {
        params: { startDate, endDate },
        responseType: "blob",
      });
      downloadBlob(response.data, `expense-report-${startDate}-to-${endDate}.pdf`);
      toast.success("PDF report downloaded");
    } catch (err) {
      toast.error("Failed to export PDF report");
    } finally {
      setExportingPdf(false);
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const inputClass =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View monthly summaries and export your financial data
        </p>
      </div>

      {/* Month/Year selector + on-screen preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className={inputClass}
            >
              {MONTHS.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className={inputClass}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {summaryLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">Total Income</p>
                <p className="mt-1 text-2xl font-bold text-green-800">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
              <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">Total Expenses</p>
                <p className="mt-1 text-2xl font-bold text-red-800">
                  {formatCurrency(summary.totalExpense)}
                </p>
              </div>
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                <p className="text-sm font-medium text-indigo-700">Balance</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    summary.balance >= 0 ? "text-indigo-800" : "text-red-800"
                  }`}
                >
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>

            {/* Category breakdown table */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Expense by Category
              </h3>
              {summary.categoryBreakdown?.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 font-medium text-gray-600">Category</th>
                        <th className="px-4 py-2.5 font-medium text-gray-600">Amount</th>
                        <th className="px-4 py-2.5 font-medium text-gray-600">Count</th>
                        <th className="px-4 py-2.5 font-medium text-gray-600">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {summary.categoryBreakdown.map((cat) => (
                        <tr key={cat.category} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-900">
                            {cat.category}
                          </td>
                          <td className="px-4 py-2.5 text-red-600">
                            {formatCurrency(cat.total)}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500">{cat.count}</td>
                          <td className="px-4 py-2.5 text-gray-500">{cat.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No expenses this month</p>
              )}
            </div>

            {/* Top 5 expenses */}
            {summary.topExpenses?.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                  Top 5 Expenses
                </h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 font-medium text-gray-600">Title</th>
                        <th className="px-4 py-2.5 font-medium text-gray-600">Category</th>
                        <th className="px-4 py-2.5 font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2.5 font-medium text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {summary.topExpenses.map((exp) => (
                        <tr key={exp._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-900">
                            {exp.title}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                              {exp.category}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-500">
                            {formatDate(exp.date)}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-red-600">
                            {formatCurrency(exp.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Export section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Export Data</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exportingExcel ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Exporting...
              </>
            ) : (
              "Export as Excel"
            )}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exportingPdf ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Exporting...
              </>
            ) : (
              "Export as PDF"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;

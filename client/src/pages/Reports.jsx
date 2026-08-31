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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-heading">Reports</h1>
        <p className="page-subheading">
          View monthly summaries and export your financial data
        </p>
      </div>

      {/* Month/Year selector + on-screen preview */}
      <div className="card p-6">
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="input-field"
            >
              {MONTHS.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="input-field"
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-income/20 bg-income/10 p-4">
                <p className="text-sm font-medium text-income">Total Income</p>
                <p className="mt-1 text-2xl font-bold text-income">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
              <div className="rounded-lg border border-expense/20 bg-expense/10 p-4">
                <p className="text-sm font-medium text-expense">Total Expenses</p>
                <p className="mt-1 text-2xl font-bold text-expense">
                  {formatCurrency(summary.totalExpense)}
                </p>
              </div>
              <div className="rounded-lg border border-secondary/20 bg-secondary/10 p-4">
                <p className="text-sm font-medium text-secondary">Balance</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    summary.balance >= 0 ? "text-secondary" : "text-expense"
                  }`}
                >
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>

            {/* Category breakdown table */}
            <div>
              <h3 className="section-heading mb-3">Expense by Category</h3>
              {summary.categoryBreakdown?.length > 0 ? (
                <div className="card overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="table-header">
                      <tr>
                        <th className="px-4 py-2.5 font-medium text-textSecondary">Category</th>
                        <th className="px-4 py-2.5 font-medium text-textSecondary">Amount</th>
                        <th className="px-4 py-2.5 font-medium text-textSecondary">Count</th>
                        <th className="px-4 py-2.5 font-medium text-textSecondary">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.categoryBreakdown.map((cat) => (
                        <tr key={cat.category} className="table-row">
                          <td className="px-4 py-2.5 font-medium text-textPrimary">
                            {cat.category}
                          </td>
                          <td className="px-4 py-2.5 text-expense">
                            {formatCurrency(cat.total)}
                          </td>
                          <td className="px-4 py-2.5 text-textMuted">{cat.count}</td>
                          <td className="px-4 py-2.5 text-textMuted">{cat.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-textMuted">No expenses this month</p>
              )}
            </div>

            {/* Top 5 expenses */}
            {summary.topExpenses?.length > 0 && (
              <div>
                <h3 className="section-heading mb-3">Top 5 Expenses</h3>
                <div className="card overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="table-header">
                      <tr>
                        <th className="px-4 py-2.5 font-medium text-textSecondary">Title</th>
                        <th className="px-4 py-2.5 font-medium text-textSecondary">Category</th>
                        <th className="px-4 py-2.5 font-medium text-textSecondary">Date</th>
                        <th className="px-4 py-2.5 font-medium text-textSecondary">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topExpenses.map((exp) => (
                        <tr key={exp._id} className="table-row">
                          <td className="px-4 py-2.5 font-medium text-textPrimary">
                            {exp.title}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="badge-primary">{exp.category}</span>
                          </td>
                          <td className="px-4 py-2.5 text-textMuted">
                            {formatDate(exp.date)}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-expense">
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
      <div className="card p-6">
        <h2 className="section-heading mb-4">Export Data</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="btn-primary flex items-center gap-2"
          >
            {exportingExcel ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-textPrimary border-t-transparent" />
                Exporting...
              </>
            ) : (
              "Export as Excel"
            )}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="btn-danger flex items-center gap-2"
          >
            {exportingPdf ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-expense border-t-transparent" />
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

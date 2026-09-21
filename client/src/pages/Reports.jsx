import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import {
  AccountReport,
  CategoryReport,
  IncomeExpenseChart,
  ReportHero,
  ReportStatStrip,
} from "../components/reports/ReportSections";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import reportService from "../services/reportService";
import { reportKeys } from "../services/queryKeys";
import {
  MONTH_OPTIONS,
  buildYearOptions,
  CSV_SECTIONS,
} from "../utils/reportConstants";

const now = new Date();

const Reports = () => {
  const [period, setPeriod] = useState("monthly");
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [csvSection, setCsvSection] = useState("all");
  const [exporting, setExporting] = useState(false);

  const yearOptions = useMemo(() => buildYearOptions(8), []);

  const params = {
    period,
    year: Number(year),
    ...(period === "monthly" ? { month: Number(month) } : {}),
  };

  const reportQuery = useQuery({
    queryKey: reportKeys.summary(params),
    queryFn: async () => {
      const data = await reportService.getSummary(params);
      return data.report;
    },
  });

  const report = reportQuery.data;

  const handleCsvExport = async () => {
    try {
      setExporting(true);
      await reportService.downloadCsv({ ...params, section: csvSection });
      showSuccessToast("CSV downloaded");
    } catch (error) {
      handleApiError(error, "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 print:hidden lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentGreen">
            Analytics
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Financial reports
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Deep dive into cash flow, categories, and accounts — then export
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-white p-1">
          {[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly" },
          ].map((opt) => {
            const active = period === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-primaryDark text-white"
                    : "text-textSecondary hover:bg-surfaceLight hover:text-textPrimary"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white print:hidden">
        <div className="flex flex-col gap-4 border-b border-border bg-surfaceLight/50 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              id="report-year"
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={yearOptions}
              size="sm"
            />
            {period === "monthly" ? (
              <Select
                id="report-month"
                label="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                options={MONTH_OPTIONS}
                size="sm"
              />
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-white/60 px-3 py-2 text-xs text-textSecondary sm:flex sm:items-center">
                Full calendar year selected
              </div>
            )}
            <Select
              id="report-csv-section"
              label="CSV export scope"
              value={csvSection}
              onChange={(e) => setCsvSection(e.target.value)}
              options={CSV_SECTIONS}
              size="sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={exporting}
              onClick={handleCsvExport}
            >
              Export CSV
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => window.print()}
            >
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="print-report space-y-6">
        <div className="hidden print:block">
          <h1 className="text-2xl font-bold text-textPrimary">
            Financial report
          </h1>
          <p className="text-sm text-textSecondary">
            {report?.period?.label || "Selected period"}
          </p>
        </div>

        {reportQuery.isLoading ? (
          <div className="space-y-4">
            <div className="h-56 animate-pulse rounded-lg bg-surfaceGray" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg bg-surfaceGray"
                />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-lg bg-surfaceGray" />
          </div>
        ) : reportQuery.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
            Failed to load report. Try another period.
          </div>
        ) : (
          <>
            <ReportHero
              periodLabel={report?.period?.label}
              summary={report?.summary}
              periodType={period}
            />

            <ReportStatStrip summary={report?.summary} />

            <IncomeExpenseChart
              series={report?.incomeVsExpense || []}
              periodType={period}
            />

            <div className="grid gap-4 xl:grid-cols-2">
              <CategoryReport
                title="Expense by category"
                subtitle="Where money went"
                items={report?.byCategory?.expense || []}
                emptyLabel="No expenses in this period"
                variant="expense"
              />
              <CategoryReport
                title="Income by category"
                subtitle="Where money came from"
                items={report?.byCategory?.income || []}
                emptyLabel="No incomes in this period"
                variant="income"
              />
            </div>

            <AccountReport items={report?.byAccount || []} />
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;

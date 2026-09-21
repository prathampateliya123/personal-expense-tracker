import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import {
  AccountReport,
  CategoryReport,
  IncomeExpenseChart,
  ReportStatCards,
} from "../components/reports/ReportSections";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import reportService from "../services/reportService";
import { reportKeys } from "../services/queryKeys";
import {
  REPORT_PERIODS,
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

  const handlePdfExport = () => {
    window.print();
  };

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 print:hidden lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Reports
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Monthly and yearly financial reports — income vs expense, category
            and account breakdowns, export CSV or PDF
          </p>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-4 print:hidden sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            id="report-period"
            label="Report type"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={REPORT_PERIODS}
          />
          <Select
            id="report-year"
            label="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            options={yearOptions}
          />
          {period === "monthly" ? (
            <Select
              id="report-month"
              label="Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              options={MONTH_OPTIONS}
            />
          ) : (
            <div className="hidden lg:block" />
          )}
          <Select
            id="report-csv-section"
            label="CSV section"
            value={csvSection}
            onChange={(e) => setCsvSection(e.target.value)}
            options={CSV_SECTIONS}
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            loading={exporting}
            onClick={handleCsvExport}
          >
            Export CSV
          </Button>
          <Button type="button" onClick={handlePdfExport}>
            Export PDF
          </Button>
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg bg-surfaceGray"
              />
            ))}
          </div>
        ) : reportQuery.isError ? (
          <div className="card p-6 text-sm text-red-500">
            Failed to load report. Try another period.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 print:hidden">
              <p className="text-sm font-medium text-textSecondary">
                Showing{" "}
                <span className="text-textPrimary">
                  {report?.period?.label}
                </span>
              </p>
            </div>

            <ReportStatCards summary={report?.summary} />

            <IncomeExpenseChart
              series={report?.incomeVsExpense || []}
              periodType={period}
            />

            <div className="grid gap-4 xl:grid-cols-2">
              <CategoryReport
                title="Expense by category"
                items={report?.byCategory?.expense || []}
                emptyLabel="No expenses in this period"
              />
              <CategoryReport
                title="Income by category"
                items={report?.byCategory?.income || []}
                emptyLabel="No incomes in this period"
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

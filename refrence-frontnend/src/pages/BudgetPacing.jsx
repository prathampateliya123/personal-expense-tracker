import TableView from "../components/table/TableView";
import Badge from "../components/ui/Badge";
import budgetPacingService from "../services/budgetPacingService";
import { reportKeys } from "../services/queryKeys";
import { formatPercent, formatReportDate, formatReportNumber, dash } from "../utils/helper";

const renderBudgetStatus = (value) => {
  if (value == null || value === "") return "—";
  const label = String(value).trim();
  return (
    <Badge status={label} size="sm">
      {label}
    </Badge>
  );
};

const columns = [
  { key: "report_date", label: "Date", minWidth: "120px", render: (v) => formatReportDate(v) },
  {
    key: "campaign_name",
    label: "Campaign",
    minWidth: "220px",
    maxWidth: "300px",
    truncate: true,
    render: (v) => dash(v)
  },
  {
    key: "daily_budget",
    label: "Daily Budget",
    align: "right",
    minWidth: "120px",
    render: (v) => formatReportNumber(v)
  },
  { key: "spend", label: "Spend", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  {
    key: "budget_utilization",
    label: "Utilization",
    align: "right",
    minWidth: "110px",
    render: (v) => formatPercent(v)
  },
  { key: "budget_status", label: "Status", minWidth: "140px", render: renderBudgetStatus },
  {
    key: "estimated_missed_impressions",
    label: "Missed Imp.",
    align: "right",
    minWidth: "110px",
    render: (v) => formatReportNumber(v, 0)
  },
  {
    key: "estimated_missed_clicks",
    label: "Missed Clicks",
    align: "right",
    minWidth: "120px",
    render: (v) => formatReportNumber(v, 0)
  }
];

const summaryMetrics = [
  { key: "daily_budget", label: "Daily Budget", format: "number" },
  { key: "spend", label: "Spend", format: "number" },
  { key: "budget_utilization", label: "Utilization", format: "percent" },
  { key: "hours_in_budget_today", label: "Hours In Budget", format: "number" },
  { key: "estimated_missed_impressions", label: "Missed Imp.", format: "integer" },
  { key: "estimated_missed_clicks", label: "Missed Clicks", format: "integer" }
];

export default function BudgetPacing() {
  return (
    <TableView
      title="Budget & Pacing"
      entityName="campaigns"
      columns={columns}
      queryKey={reportKeys.budgetPacing()}
      fetchList={budgetPacingService.list}
      summaryMetrics={summaryMetrics}
    />
  );
}
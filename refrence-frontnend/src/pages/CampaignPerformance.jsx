import TableView from "../components/table/TableView";
import campaignPerformanceService from "../services/campaignPerformanceService";
import { reportKeys } from "../services/queryKeys";
import { formatPercent, formatReportDate, formatReportNumber, dash } from "../utils/helper";

const columns = [
  { key: "report_date", label: "Date", minWidth: "120px", render: (v) => formatReportDate(v) },
  { key: "campaign_name", label: "Campaign", minWidth: "220px", maxWidth: "280px", truncate: true, render: (v) => dash(v) },
  { key: "campaign_id", label: "Campaign ID", minWidth: "140px", render: (v) => dash(v) },
  { key: "ad_type", label: "Ad Type", minWidth: "150px", render: (v) => dash(v) },
  { key: "campaign_status", label: "Status", minWidth: "100px", render: (v) => dash(v) },
  { key: "daily_budget", label: "Daily Budget", align: "right", minWidth: "120px", render: (v) => formatReportNumber(v) },
  { key: "impressions", label: "Impressions", align: "right", minWidth: "110px", render: (v) => formatReportNumber(v, 0) },
  { key: "clicks", label: "Clicks", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "ctr", label: "CTR", align: "right", minWidth: "80px", render: (v) => formatPercent(v) },
  { key: "cpc", label: "CPC", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) },
  { key: "spend", label: "Spend", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "orders", label: "Orders", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "units_sold", label: "Units", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "sales", label: "Sales", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "acos", label: "ACOS", align: "right", minWidth: "80px", render: (v) => formatPercent(v) },
  { key: "roas", label: "ROAS", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) },
  { key: "cvr", label: "CVR", align: "right", minWidth: "80px", render: (v) => formatPercent(v) }
];

const summaryMetrics = [
  { key: "daily_budget", label: "Daily Budget", format: "number" },
  { key: "impressions", label: "Impressions", format: "integer" },
  { key: "clicks", label: "Clicks", format: "integer" },
  { key: "ctr", label: "CTR", format: "percent" },
  { key: "cpc", label: "CPC", format: "number" },
  { key: "spend", label: "Spend", format: "number" },
  { key: "orders", label: "Orders", format: "integer" },
  { key: "units_sold", label: "Units", format: "integer" },
  { key: "sales", label: "Sales", format: "number" },
  { key: "acos", label: "ACOS", format: "percent" },
  { key: "roas", label: "ROAS", format: "number" },
  { key: "cvr", label: "CVR", format: "percent" }
];

export default function CampaignPerformance() {
  return (
    <TableView
      title="Campaign Performance"
      entityName="campaigns"
      columns={columns}
      queryKey={reportKeys.campaignPerformance()}
      fetchList={campaignPerformanceService.list}
      summaryMetrics={summaryMetrics}
    />
  );
}
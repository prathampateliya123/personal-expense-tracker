import TableView from "../components/table/TableView";
import placementReportService from "../services/placementReportService";
import { reportKeys } from "../services/queryKeys";
import { formatPercent, formatReportDate, formatReportNumber, dash } from "../utils/helper";

const columns = [
  { key: "report_date", label: "Date", minWidth: "120px", render: (v) => formatReportDate(v) },
  { key: "campaign_name", label: "Campaign", minWidth: "220px", maxWidth: "280px", truncate: true, render: (v) => dash(v) },
  { key: "placement", label: "Placement", minWidth: "180px", maxWidth: "220px", truncate: true, render: (v) => dash(v) },
  { key: "bid_adjustment", label: "Bid Adj.", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "impressions", label: "Impressions", align: "right", minWidth: "110px", render: (v) => formatReportNumber(v, 0) },
  { key: "clicks", label: "Clicks", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "ctr", label: "CTR", align: "right", minWidth: "80px", render: (v) => formatPercent(v) },
  { key: "cpc", label: "CPC", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) },
  { key: "spend", label: "Spend", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "orders", label: "Orders", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "sales", label: "Sales", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "acos", label: "ACOS", align: "right", minWidth: "80px", render: (v) => formatPercent(v) },
  { key: "roas", label: "ROAS", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) }
];

const summaryMetrics = [
  { key: "bid_adjustment", label: "Bid Adj.", format: "number" },
  { key: "impressions", label: "Impressions", format: "integer" },
  { key: "clicks", label: "Clicks", format: "integer" },
  { key: "ctr", label: "CTR", format: "percent" },
  { key: "cpc", label: "CPC", format: "number" },
  { key: "spend", label: "Spend", format: "number" },
  { key: "orders", label: "Orders", format: "integer" },
  { key: "sales", label: "Sales", format: "number" },
  { key: "acos", label: "ACOS", format: "percent" },
  { key: "roas", label: "ROAS", format: "number" }
];

export default function PlacementReport() {
  return (
    <TableView
      title="Placement Report"
      entityName="placements"
      columns={columns}
      queryKey={reportKeys.placementReport()}
      fetchList={placementReportService.list}
      summaryMetrics={summaryMetrics}
    />
  );
}
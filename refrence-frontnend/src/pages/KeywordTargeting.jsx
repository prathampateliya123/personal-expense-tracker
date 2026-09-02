import { useState } from "react";
import TableView from "../components/table/TableView";
import { TableSelect } from "../components/table/Table";
import keywordTargetingService from "../services/keywordTargetingService";
import { reportKeys } from "../services/queryKeys";
import { dash, formatPercent, formatReportDate, formatReportNumber, parseAsinTarget } from "../utils/helper";

const P_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "keyword targeting", label: "Keyword Targeting" },
  { value: "product targeting", label: "Product Targeting" }
];

const renderKeywordTarget = (value) => {
  if (value == null || value === "") return "—";

  const raw = String(value).trim();
  const asin = parseAsinTarget(raw);

  if (asin) {
    return (
      <a
        href={`https://www.amazon.in/dp/${asin}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--brand-orange)] font-medium underline underline-offset-2 hover:opacity-80"
      >
        {asin}
      </a>
    );
  }

  return dash(raw);
};

const columns = [
  { key: "report_date", label: "Date", minWidth: "120px", render: (v) => formatReportDate(v) },
  {
    key: "campaign_name",
    label: "Campaign",
    minWidth: "200px",
    maxWidth: "260px",
    truncate: true,
    render: (v) => dash(v)
  },
  {
    key: "ad_group_name",
    label: "Ad Group",
    minWidth: "180px",
    maxWidth: "240px",
    truncate: true,
    render: (v) => dash(v)
  },
  {
    key: "keyword_target",
    label: "Keyword / Target",
    minWidth: "180px",
    maxWidth: "240px",
    render: renderKeywordTarget
  },
  { key: "match_type", label: "Match Type", minWidth: "160px", render: (v) => dash(v) },
  {
    key: "keyword_status",
    label: "Status",
    minWidth: "100px",
    render: (v) => (v == null || v === "" ? "Archive" : v)
  },
  { key: "bid", label: "Bid", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) },
  {
    key: "impressions",
    label: "Impressions",
    align: "right",
    minWidth: "110px",
    render: (v) => formatReportNumber(v, 0)
  },
  { key: "clicks", label: "Clicks", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "ctr", label: "CTR", align: "right", minWidth: "80px", render: (v) => formatPercent(v) },
  { key: "cpc", label: "CPC", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) },
  { key: "spend", label: "Spend", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "orders", label: "Orders", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "sales", label: "Sales", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "acos", label: "ACOS", align: "right", minWidth: "80px", render: (v) => formatPercent(v) },
  { key: "roas", label: "ROAS", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) },
  { key: "cvr", label: "CVR", align: "right", minWidth: "80px", render: (v) => formatPercent(v) }
];

const summaryMetrics = [
  { key: "bid", label: "Bid", format: "number" },
  { key: "impressions", label: "Impressions", format: "integer" },
  { key: "clicks", label: "Clicks", format: "integer" },
  { key: "ctr", label: "CTR", format: "percent" },
  { key: "cpc", label: "CPC", format: "number" },
  { key: "spend", label: "Spend", format: "number" },
  { key: "orders", label: "Orders", format: "integer" },
  { key: "sales", label: "Sales", format: "number" },
  { key: "acos", label: "ACOS", format: "percent" },
  { key: "roas", label: "ROAS", format: "number" },
  { key: "cvr", label: "CVR", format: "percent" }
];

export default function KeywordTargeting() {
  const [pType, setPType] = useState("all");

  return (
    <TableView
      title="Keyword Targeting"
      entityName="keywords"
      columns={columns}
      queryKey={reportKeys.keywordTargeting()}
      fetchList={keywordTargetingService.list}
      extraParams={{ p_type: pType }}
      summaryMetrics={summaryMetrics}
      toolbarBeforeLimit={
        <TableSelect
          value={pType}
          onChange={setPType}
          options={P_TYPE_OPTIONS}
          ariaLabel="Targeting type"
        />
      }
    />
  );
}
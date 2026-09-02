import TableView from "../components/table/TableView";
import searchTermReportService from "../services/searchTermReportService";
import { reportKeys } from "../services/queryKeys";
import { dash, formatPercent, formatReportDate, formatReportNumber, parseAsinTarget } from "../utils/helper";

const renderMatchedKeyword = (value) => {
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
  { key: "campaign_name", label: "Campaign", minWidth: "200px", maxWidth: "260px", truncate: true, render: (v) => dash(v) },
  { key: "ad_group_name", label: "Ad Group", minWidth: "180px", maxWidth: "240px", truncate: true, render: (v) => dash(v) },
  { key: "matched_keyword", label: "Matched Keyword", minWidth: "160px", maxWidth: "220px", render: renderMatchedKeyword },
  { key: "customer_search_term", label: "Search Term", minWidth: "180px", maxWidth: "220px", truncate: true, render: (v) => dash(v) },
  { key: "match_type", label: "Match Type", minWidth: "180px", render: (v) => dash(v) },
  { key: "impressions", label: "Impressions", align: "right", minWidth: "110px", render: (v) => formatReportNumber(v, 0) },
  { key: "clicks", label: "Clicks", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "ctr", label: "CTR", align: "right", minWidth: "80px", render: (v) => formatPercent(v) },
  { key: "cpc", label: "CPC", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) },
  { key: "spend", label: "Spend", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "orders", label: "Orders", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "sales", label: "Sales", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "acos", label: "ACOS", align: "right", minWidth: "80px", render: (v) => formatPercent(v) },
  { key: "roas", label: "ROAS", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) },
  { key: "is_converting", label: "Converting", minWidth: "100px", render: (v) => dash(v) }
];

const summaryMetrics = [
  { key: "impressions", label: "Impressions", format: "integer" },
  { key: "clicks", label: "Clicks", format: "integer" },
  { key: "ctr", label: "CTR", format: "percent" },
  { key: "cpc", label: "CPC", format: "number" },
  { key: "spend", label: "Spend", format: "number" },
  { key: "orders", label: "Orders", format: "integer" },
  { key: "sales", label: "Sales", format: "number" },
  { key: "acos", label: "ACOS", format: "percent" },
  { key: "roas", label: "ROAS", format: "number" },
  { key: "converting_terms", label: "Converting Terms", format: "integer" },
  { key: "non_converting_terms", label: "Non-Converting Terms", format: "integer" }
];

export default function SearchTermReport() {
  return (
    <TableView
      title="Search Term Report"
      entityName="search terms"
      columns={columns}
      queryKey={reportKeys.searchTermReport()}
      fetchList={searchTermReportService.list}
      summaryMetrics={summaryMetrics}
    />
  );
}
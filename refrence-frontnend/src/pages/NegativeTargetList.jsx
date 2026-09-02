import TableView from "../components/table/TableView";
import negativeTargetService from "../services/negativeTargetService";
import { reportKeys } from "../services/queryKeys";
import { dash, formatDateTime, parseAsinTarget } from "../utils/helper";

const amazonAsinLink = (asin) => {
  if (!asin) return "—";
  return (
    <a
      href={`https://www.amazon.in/dp/${asin}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--brand-orange)] font-medium underline underline-offset-2 hover:opacity-80"
      onClick={(e) => e.stopPropagation()}
    >
      {asin}
    </a>
  );
};

const renderTargetCell = (value) => {
  if (value == null || value === "") return "—";
  const raw = String(value).trim();
  const asin = parseAsinTarget(raw) || (/^[A-Z0-9]{10}$/i.test(raw) ? raw : null);
  
  if (asin && raw.includes(asin)) {
    return (
      <span className="block w-full min-w-0 truncate" title={raw}>
        {amazonAsinLink(asin)}
      </span>
    );
  }
  return <span className="block w-full min-w-0 truncate" title={raw}>{dash(raw)}</span>;
};

const LABEL_MAP = {
  NEGATIVE_EXACT: "Negative Exact",
  NEGATIVE_PHRASE: "Negative Phrase",
  ENABLED: "Enabled",
  ARCHIVED: "Archived",
  PAUSED: "Paused",
  AD_GROUP: "Ad Group",
  CAMPAIGN: "Campaign"
};

const prettyLabel = (value) => {
  if (value == null || value === "") return "—";
  const raw = String(value).trim();
  return LABEL_MAP[raw] || dash(raw);
};

const columns = [
  {
    key: "last_seen_at",
    label: "Last Seen",
    minWidth: "160px",
    render: (v) => formatDateTime(v)
  },
  {
    key: "campaign_name",
    label: "Campaign",
    minWidth: "200px",
    maxWidth: "280px",
    className: "max-w-[180px] sm:max-w-[250px]",
    truncate: true
  },
  {
    key: "ad_group_name",
    label: "Ad Group",
    minWidth: "180px",
    maxWidth: "260px",
    className: "max-w-[180px] sm:max-w-[250px]",
    truncate: true
  },
  {
    key: "resolved_value",
    label: "Target",
    minWidth: "200px",
    maxWidth: "350px",
    className: "max-w-[180px] sm:max-w-[300px]",
    render: (v) => renderTargetCell(v)
  },
  {
    key: "state",
    label: "Status",
    minWidth: "110px",
    render: (v) => prettyLabel(v)
  },
  {
    key: "scope",
    label: "Scope",
    minWidth: "120px",
    render: (v) => prettyLabel(v)
  },
  {
    key: "amazon_target_id",
    label: "Amazon Target ID",
    minWidth: "160px",
    render: (v) => dash(v)
  }
];

const summaryMetrics = [
  { key: "total", label: "Total", format: "integer" },
  { key: "enabled", label: "Enabled", format: "integer" },
  { key: "paused", label: "Paused", format: "integer" },
  { key: "archived", label: "Archived", format: "integer" },
  { key: "ad_group_scope", label: "Ad Group Scope", format: "integer" },
  { key: "campaign_scope", label: "Campaign Scope", format: "integer" }
];

export default function NegativeTargetList() {
  return (
    <TableView
      title="Negative Target List"
      entityName="negative targets"
      columns={columns}
      queryKey={reportKeys.negativeTargetList()}
      fetchList={negativeTargetService.list}
      extraParams={{ p_type: "all" }}
      defaultSortBy="last_seen_at"
      defaultSortOrder="DESC"
      summaryMetrics={summaryMetrics}
    />
  );
}

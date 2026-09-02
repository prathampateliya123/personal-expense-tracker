import TableView from "../components/table/TableView";
import negativeKeywordService from "../services/negativeKeywordService";
import { reportKeys } from "../services/queryKeys";
import { dash, formatDateTime } from "../utils/helper";

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
    truncate: true,
    render: (v) => dash(v)
  },
  {
    key: "ad_group_name",
    label: "Ad Group",
    minWidth: "180px",
    maxWidth: "260px",
    truncate: true,
    render: (v) => dash(v)
  },
  {
    key: "keyword",
    label: "Keyword",
    minWidth: "200px",
    maxWidth: "280px",
    truncate: true,
    render: (v) => dash(v)
  },
  {
    key: "match_type",
    label: "Match Type",
    minWidth: "150px",
    render: (v) => prettyLabel(v)
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
    key: "amazon_keyword_id",
    label: "Amazon Keyword ID",
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

export default function NegativeKeywordList() {
  return (
    <TableView
      title="Negative Keyword List"
      entityName="negative keywords"
      columns={columns}
      queryKey={reportKeys.negativeKeywordList()}
      fetchList={negativeKeywordService.list}
      extraParams={{ p_type: "all" }}
      defaultSortBy="last_seen_at"
      defaultSortOrder="DESC"
      summaryMetrics={summaryMetrics}
    />
  );
}

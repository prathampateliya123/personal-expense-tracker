import TableView from "../components/table/TableView";
import campaignListService from "../services/campaignListService";
import { reportKeys } from "../services/queryKeys";
import { formatReportDate, formatReportNumber, dash } from "../utils/helper";

const columns = [
  { key: "start_date", label: "Start Date", minWidth: "120px", render: (v) => formatReportDate(v) },
  { key: "end_date", label: "End Date", minWidth: "120px", render: (v) => formatReportDate(v) },
  {
    key: "campaign_name",
    label: "Campaign",
    minWidth: "220px",
    maxWidth: "300px",
    truncate: true,
    render: (v) => dash(v)
  },
  { key: "campaign_id", label: "Campaign ID", minWidth: "150px", render: (v) => dash(v) },
  { key: "campaign_status", label: "Status", minWidth: "110px", render: (v) => dash(v) },
  { key: "ad_type", label: "Ad Type", minWidth: "160px", render: (v) => dash(v) },
  { key: "targeting_type", label: "Targeting", minWidth: "110px", render: (v) => dash(v) },
  { key: "bidding_strategy", label: "Bidding", minWidth: "160px", render: (v) => dash(v) },
  {
    key: "daily_budget",
    label: "Daily Budget",
    align: "right",
    minWidth: "120px",
    render: (v) => formatReportNumber(v)
  },
  { key: "budget_type", label: "Budget Type", minWidth: "120px", render: (v) => dash(v) },
  { key: "portfolio", label: "Portfolio", minWidth: "120px", render: (v) => dash(v) }
];

export default function CampaignList() {
  return (
    <TableView
      title="Campaign List"
      entityName="campaigns"
      columns={columns}
      queryKey={reportKeys.campaignList()}
      fetchList={campaignListService.list}
      showDateFilter={false}
    />
  );
}
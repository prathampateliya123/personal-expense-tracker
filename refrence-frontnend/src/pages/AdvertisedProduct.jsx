import TableView from "../components/table/TableView";
import advertisedProductService from "../services/advertisedProductService";
import { reportKeys } from "../services/queryKeys";
import { formatPercent, formatReportDate, formatReportNumber, dash } from "../utils/helper";

const columns = [
  { key: "report_date", label: "Date", minWidth: "120px", render: (v) => formatReportDate(v) },
  { key: "campaign_name", label: "Campaign", minWidth: "220px", maxWidth: "280px", truncate: true, render: (v) => dash(v) },
  { key: "ad_group_name", label: "Ad Group", minWidth: "180px", maxWidth: "240px", truncate: true, render: (v) => dash(v) },
  {
    key: "asin",
    label: "ASIN",
    sortable: false,
    minWidth: "120px",
    render: (v) => {
      if (v == null || v === "") return "—";
      const asin = String(v).trim();
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
  },
  { key: "short_name", label: "Short Name", minWidth: "140px", maxWidth: "200px", truncate: true, render: (v) => dash(v) },
  { key: "group_name", label: "Group Name", minWidth: "140px", maxWidth: "200px", truncate: true, render: (v) => dash(v) },
  { key: "sku", label: "SKU", minWidth: "140px", maxWidth: "180px", truncate: true, render: (v) => dash(v) },
  { key: "impressions", label: "Impressions", align: "right", minWidth: "110px", render: (v) => formatReportNumber(v, 0) },
  { key: "clicks", label: "Clicks", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "ctr", label: "CTR", align: "right", minWidth: "80px", render: (v) => formatPercent(v) },
  { key: "cpc", label: "CPC", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) },
  { key: "spend", label: "Spend", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "orders", label: "Orders", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "units_sold", label: "Units", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v, 0) },
  { key: "sales", label: "Sales", align: "right", minWidth: "90px", render: (v) => formatReportNumber(v) },
  { key: "acos", label: "ACOS", align: "right", minWidth: "80px", render: (v) => formatPercent(v) },
  { key: "roas", label: "ROAS", align: "right", minWidth: "80px", render: (v) => formatReportNumber(v) }
];

const summaryMetrics = [
  { key: "impressions", label: "Impressions", format: "integer" },
  { key: "clicks", label: "Clicks", format: "integer" },
  { key: "ctr", label: "CTR", format: "percent" },
  { key: "cpc", label: "CPC", format: "number" },
  { key: "spend", label: "Spend", format: "number" },
  { key: "orders", label: "Orders", format: "integer" },
  { key: "units_sold", label: "Units", format: "integer" },
  { key: "sales", label: "Sales", format: "number" },
  { key: "same_sku_sales", label: "Same SKU Sales", format: "number" },
  { key: "other_sku_sales", label: "Other SKU Sales", format: "number" },
  { key: "acos", label: "ACOS", format: "percent" },
  { key: "roas", label: "ROAS", format: "number" }
];

export default function AdvertisedProduct() {
  return (
    <TableView
      title="Advertised Product"
      entityName="products"
      columns={columns}
      queryKey={reportKeys.advertisedProduct()}
      fetchList={advertisedProductService.list}
      summaryMetrics={summaryMetrics}
    />
  );
}
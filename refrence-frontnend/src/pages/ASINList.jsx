import { useMemo } from "react";
import { asinKeys } from "../services/queryKeys";
import { listAsins } from "../services/asinService";
import TableView from "../components/table/TableView";
import { SortDownIcon, SortUpIcon } from "../components/ui/Icons";
import { dash } from "../utils/helper";

const amazonAsinLink = (value) => {
  if (value == null || value === "") return "—";
  const asin = String(value).trim();
  if (!asin) return "—";
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
};

const ASIN_COLUMNS = [
  {
    key: "asin",
    label: "ASIN",
    sortable: false,
    locked: true,
    align: "center",
    render: (v) => amazonAsinLink(v)
  },
  { key: "campaign_ctr", label: "CTR", align: "right" },
  { key: "campaign_cpc", label: "CPC", align: "right" },
  { key: "campaign_cvr", label: "CVR", align: "right" },
  { key: "campaign_cac", label: "CAC", align: "right" },
  { key: "campaign_acos", label: "ACOS", align: "right" },
  { key: "campaign_clicks_to_first_order", label: "Clicks to First Order", align: "right" },
  { key: "keyword_ctr", label: "CTR", align: "right" },
  { key: "keyword_cpc", label: "CPC", align: "right" },
  { key: "keyword_cvr", label: "CVR", align: "right" },
  { key: "keyword_cac", label: "CAC", align: "right" },
  { key: "keyword_acos", label: "ACOS", align: "right" },
  { key: "keyword_clicks_to_first_order", label: "Clicks to First Order", align: "right" }
];

export default function ASINList() {
  const renderHeader = useMemo(() => ({
    columns,
    activeSortBy,
    activeSortOrder,
    onSortChange,
    sortingDisabled
  }) => {
    const SortArrows = ({ active, order }) => {
      const upActive = active && String(order).toUpperCase() === "ASC";
      const downActive = active && String(order).toUpperCase() === "DESC";
      return (
        <span className="inline-flex shrink-0 flex-col items-center justify-center gap-[2px]" aria-hidden>
          <SortUpIcon className={upActive ? "text-[var(--brand-orange)]" : "text-[var(--ink-subtle)]"} />
          <SortDownIcon className={downActive ? "text-[var(--brand-orange)]" : "text-[var(--ink-subtle)]"} />
        </span>
      );
    };

    const renderSortableTh = (label, sortKey, align = "left", rowSpan = 1, extraClass = "") => {
      const canSort = Boolean(sortKey) && typeof onSortChange === "function";
      const isActive = canSort && activeSortBy === sortKey;
      const isNumeric = align === "right" || align === "center";

      const labelContent = (
        <span className={`inline-flex max-w-full items-center gap-1.5 ${isNumeric ? "justify-center" : "justify-start"}`}>
          <span className={`truncate ${isActive ? "text-[var(--ink)]" : ""}`}>{label}</span>
          {canSort && <SortArrows active={isActive} order={activeSortOrder} />}
        </span>
      );

      return (
        <th
          key={sortKey || label}
          rowSpan={rowSpan}
          className={`align-middle box-border px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-muted)] whitespace-nowrap overflow-hidden text-center ${extraClass}`}
          aria-sort={isActive ? (activeSortOrder === "ASC" ? "ascending" : "descending") : "none"}
        >
          {canSort ? (
            <button
              type="button"
              disabled={sortingDisabled}
              onClick={() => onSortChange?.(sortKey)}
              className="inline-flex max-w-full items-center justify-center w-full rounded-[4px] text-inherit transition-colors hover:text-[var(--ink)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {labelContent}
            </button>
          ) : (
            <div className="flex w-full justify-center">{labelContent}</div>
          )}
        </th>
      );
    };

    const campaignKeys = [
      "campaign_ctr",
      "campaign_cpc",
      "campaign_cvr",
      "campaign_cac",
      "campaign_acos",
      "campaign_clicks_to_first_order"
    ];
    const keywordKeys = [
      "keyword_ctr",
      "keyword_cpc",
      "keyword_cvr",
      "keyword_cac",
      "keyword_acos",
      "keyword_clicks_to_first_order"
    ];
    
    const visibleKeys = new Set(columns.map(c => c.key));
    const campaignColspan = campaignKeys.filter(k => visibleKeys.has(k)).length;
    const keywordColspan = keywordKeys.filter(k => visibleKeys.has(k)).length;

    const visibleCampaignKeys = campaignKeys.filter(k => visibleKeys.has(k));
    const visibleKeywordKeys = keywordKeys.filter(k => visibleKeys.has(k));

    return (
      <>
        <tr className="bg-[var(--brand-orange-soft)]">
          <th
            rowSpan={2}
            className="border-b border-[var(--border)] align-middle box-border px-3 sm:px-4 py-3 sm:py-3.5 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-muted)] whitespace-nowrap text-center w-[48px] sm:w-[56px]"
          >
            #
          </th>
          {visibleKeys.has("asin") && renderSortableTh("ASIN", null, "center", 2, "border-b border-[var(--border)] rounded-tl-[7px]")}
          {campaignColspan > 0 && (
            <th
              colSpan={campaignColspan}
              className="border-b border-l border-[var(--border)] box-border px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--ink)] whitespace-nowrap text-center"
            >
              Total Campaign
            </th>
          )}
          {keywordColspan > 0 && (
            <th
              colSpan={keywordColspan}
              className="border-b border-l border-r border-[var(--border)] box-border rounded-tr-[7px] px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--ink)] whitespace-nowrap text-center"
            >
              Keyword Metrics (80%)
            </th>
          )}
        </tr>
        <tr className="bg-[var(--brand-orange-soft)]">
          {visibleCampaignKeys.map((key, i) => {
            let label = "", align = "right";
            if (key === "campaign_ctr") label = "CTR";
            else if (key === "campaign_cpc") label = "CPC";
            else if (key === "campaign_cvr") label = "CVR";
            else if (key === "campaign_cac") label = "CAC";
            else if (key === "campaign_acos") label = "ACOS";
            else if (key === "campaign_clicks_to_first_order") label = "Clicks to First Order";
            const classes = `border-b border-[var(--border)] ${i === 0 ? "border-l border-[var(--border)]" : ""}`;
            return renderSortableTh(label, key, align, 1, classes);
          })}
          
          {visibleKeywordKeys.map((key, i) => {
            let label = "", align = "right";
            if (key === "keyword_ctr") label = "CTR";
            else if (key === "keyword_cpc") label = "CPC";
            else if (key === "keyword_cvr") label = "CVR";
            else if (key === "keyword_cac") label = "CAC";
            else if (key === "keyword_acos") label = "ACOS";
            else if (key === "keyword_clicks_to_first_order") label = "Clicks to First Order";
            const isFirst = i === 0;
            const isLast = i === visibleKeywordKeys.length - 1;
            const classes = `border-b border-[var(--border)] ${isFirst ? "border-l border-[var(--border)]" : ""} ${isLast ? "border-r border-[var(--border)]" : ""}`;
            return renderSortableTh(label, key, align, 1, classes);
          })}
        </tr>
      </>
    );
  }, []);

  return (
    <TableView
      title="ASIN List"
      queryKey={asinKeys.all}
      fetchList={listAsins}
      columns={ASIN_COLUMNS}
      entityName="ASINs"
      defaultSortBy="report_date"
      defaultSortOrder="DESC"
      renderHeader={renderHeader}
    />
  );
}

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import TableView from "../table/TableView";
import {
  AcosChart,
  ActionBadge,
  CategoryBarChart,
  ChartCard,
  CpcChart,
  CvrChart,
  KPICard,
  SpendDonutChart,
  SpendSalesChart,
  StatusBadge,
  SurplusChart,
  WastedSpendChart
} from "./DashboardCharts";
import dashboardService from "../../services/dashboardService";
import { dashboardKeys } from "../../services/queryKeys";
import { getCookie, TOKEN_NAME } from "../../utils/cookie";
import { normalizeReportListResponse } from "../../utils/helper";
import {
  CHART_COLORS,
  asChartSeries,
  buildDashboardTableQueryKey,
  campaignLeakStatus,
  changeToneClass,
  estProfit,
  formatChangeMoney,
  formatChangePct,
  formatCurrency,
  formatCpc,
  formatKpiChange,
  formatPercent,
  formatRoas,
  getPeriodMeta,
  hasKpiValues,
  resolveCurrencyCode,
  searchTermAction,
  withChartLabels
} from "../../utils/dashboard";

function useDashboardEnabled(storeId, syncReady) {
  return Boolean(storeId && Number(storeId) > 0 && syncReady);
}

function useChartQuery(name, fetcher, params, enabled) {
  return useQuery({
    queryKey: dashboardKeys.chart(name, params),
    queryFn: () => fetcher(params, getCookie(TOKEN_NAME)),
    enabled,
    retry: false
  });
}

function pickSeries(...candidates) {
  let best = [];
  for (const value of candidates) {
    const series = asChartSeries(value);
    if (series.length > best.length) best = series;
  }
  return best.map((row) => ({ ...row }));
}

export function OverviewTab({
  storeId,
  syncReady,
  currencyCode: currencyCodeProp,
  range,
  overlayProfit,
  marginPct,
  dateRangeLabel,
  dateParams = {},
  onDateRangeChange
}) {
  const periodMeta = getPeriodMeta(range);
  const currencyCode = resolveCurrencyCode(currencyCodeProp);
  const enabled = useDashboardEnabled(storeId, syncReady);

  const baseParams = useMemo(
    () => ({
      store_id: storeId,
      range: periodMeta.apiRange,
      limit: 50,
      overlay_profit: overlayProfit,
      margin_pct: marginPct,
      ...dateParams
    }),
    [storeId, periodMeta.apiRange, overlayProfit, marginPct, dateParams]
  );

  const chartParams = useMemo(
    () => ({
      ...baseParams,
      limit: 120
    }),
    [baseParams]
  );

  const tableExtraParams = useMemo(
    () => ({
      range: periodMeta.apiRange,
      overlay_profit: overlayProfit,
      margin_pct: marginPct,
      ...dateParams
    }),
    [periodMeta.apiRange, overlayProfit, marginPct, dateParams]
  );

  const summaryQuery = useQuery({
    queryKey: dashboardKeys.summary(baseParams),
    queryFn: () => dashboardService.summary(baseParams, getCookie(TOKEN_NAME)),
    enabled,
    retry: false
  });

  const surplusQuery = useChartQuery(
    "ad-surplus",
    dashboardService.chartAdSurplus,
    chartParams,
    enabled
  );
  const spendSalesQuery = useChartQuery(
    "spend-sales",
    dashboardService.chartSpendSales,
    chartParams,
    enabled
  );
  const acosQuery = useChartQuery("acos", dashboardService.chartAcos, chartParams, enabled);
  const wasteQuery = useChartQuery(
    "wasted-spend",
    dashboardService.chartWastedSpend,
    chartParams,
    enabled
  );
  const cpcQuery = useChartQuery("cpc", dashboardService.chartCpc, chartParams, enabled);
  const cvrQuery = useChartQuery("cvr", dashboardService.chartCvr, chartParams, enabled);

  const surplusSeries = withChartLabels(pickSeries(surplusQuery.data?.series, surplusQuery.data), range);
  const spendSalesSeries = withChartLabels(
    pickSeries(spendSalesQuery.data?.series, spendSalesQuery.data),
    range
  );
  const acosSeries = withChartLabels(pickSeries(acosQuery.data?.series, acosQuery.data), range);
  const wasteSeries = withChartLabels(pickSeries(wasteQuery.data?.series, wasteQuery.data), range);
  const cpcSeries = withChartLabels(pickSeries(cpcQuery.data?.series, cpcQuery.data), range);
  const cvrSeries = withChartLabels(pickSeries(cvrQuery.data?.series, cvrQuery.data), range);

  const kpi = useMemo(() => {
    const base = hasKpiValues(summaryQuery.data?.cur) ? { ...summaryQuery.data.cur } : {};

    if (base.wasted_spend == null || Number.isNaN(Number(base.wasted_spend))) {
      const fromWasteChart = wasteSeries[wasteSeries.length - 1]?.wasted_spend;
      if (fromWasteChart != null) base.wasted_spend = Number(fromWasteChart);
    }

    return base;
  }, [summaryQuery.data, wasteSeries]);

  const resolvedDateRange = useMemo(() => {
    return (
      summaryQuery.data?.dateRange ||
      surplusQuery.data?.meta?.dateRange ||
      null
    );
  }, [summaryQuery.data, surplusQuery.data]);

  useEffect(() => {
    if (!onDateRangeChange) return;
    if (dateParams?.start_date && dateParams?.end_date) return;
    const label =
      summaryQuery.data?.dataRangeLabel || summaryQuery.data?.currentPeriodLabel;
    if (label) {
      onDateRangeChange(label);
      return;
    }
    if (Array.isArray(resolvedDateRange) && resolvedDateRange.length >= 2) {
      const [from, to] = resolvedDateRange;
      onDateRangeChange(from === to ? from : `${from} to ${to}`);
    }
  }, [
    resolvedDateRange,
    summaryQuery.data?.dataRangeLabel,
    summaryQuery.data?.currentPeriodLabel,
    onDateRangeChange,
    dateParams
  ]);

  const surplusTitle = overlayProfit
    ? `Est. Profit Trend (${marginPct}% margin)`
    : "Ad Surplus Trend (Sales − Spend)";
  const surplusDesc = overlayProfit
    ? `Estimated profit at ${marginPct}% margin — sales × margin − spend`
    : "Pure ads math, no cost assumptions — below zero = spend exceeds attributed sales";
  const spendSalesTitle = "Spend vs Sales";
  const spendSalesDesc = "Ad spend against attributed sales";
  const acosTitle = "ACoS Trend";
  const acosDesc = "Advertising cost of sale over time";
  const wasteTitle = "Wasted Spend (zero-conversion clicks)";
  const wasteDesc = "Spend that generated $0 in sales — pure leak";
  const cpcTitle = "CPC Trend (bid pressure)";
  const cpcDesc = "Rising CPC without rising CVR is a leak signal";
  const cvrTitle = "CVR Trend (conversion efficiency)";
  const cvrDesc = "Falling CVR means clicks are converting to sales less often";

  const chartsLoading =
    surplusQuery.isLoading ||
    spendSalesQuery.isLoading ||
    acosQuery.isLoading ||
    wasteQuery.isLoading ||
    cpcQuery.isLoading ||
    cvrQuery.isLoading;

  const spendChg = formatKpiChange(kpi, "spend");
  const salesChg = formatKpiChange(kpi, "sales");
  const surplusChg = useMemo(() => {
    if (!overlayProfit) return formatKpiChange(kpi, "ad_surplus");

    const direct = formatKpiChange(kpi, "est_profit");
    if (direct.text !== "—") return direct;

    const salesPrev = kpi.sales_previous;
    const spendPrev = kpi.spend_previous;
    if (
      kpi.sales != null &&
      kpi.spend != null &&
      salesPrev != null &&
      spendPrev != null
    ) {
      const cur = estProfit(kpi.sales, kpi.spend, marginPct);
      const prev = estProfit(salesPrev, spendPrev, marginPct);
      if (prev !== 0) {
        return formatChangePct(((cur - prev) / Math.abs(prev)) * 100, { lowerIsBetter: false });
      }
    }

    return formatKpiChange(kpi, "ad_surplus");
  }, [kpi, overlayProfit, marginPct]);
  const acosChg = formatKpiChange(kpi, "acos");
  const roasChg = formatKpiChange(kpi, "roas");
  const wasteChg = formatKpiChange(kpi, "wasted_spend");

  const surplusValue = overlayProfit
    ? kpi.est_profit != null
      ? Number(kpi.est_profit)
      : estProfit(kpi.sales, kpi.spend, marginPct)
    : kpi.ad_surplus;

  const compareSubtext = summaryQuery.data?.compareLabel || periodMeta.compare;

  const kpisLoading = summaryQuery.isLoading && !hasKpiValues(kpi);

  const tableColumns = useMemo(() => {
    const cols = [
      {
        key: "campaign",
        label: "CAMPAIGN",
        sortable: true,
        minWidth: "180px",
        maxWidth: "240px",
        width: "240px",
        truncate: true
      },
      {
        key: "status",
        label: "STATUS",
        sortable: false,
        width: "10%",
        render: (_val, row) => <StatusBadge status={campaignLeakStatus(row)} />
      },
      { key: "spend", label: "SPEND", sortable: true, render: (val) => formatCurrency(val, currencyCode) },
      {
        key: "spend_chg_pct",
        label: "SPEND Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangePct(val, { lowerIsBetter: false });
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      },
      { key: "sales", label: "SALES", sortable: true, render: (val) => formatCurrency(val, currencyCode) },
      { key: "acos", label: "ACOS", sortable: true, render: (val) => formatPercent(val) },
      {
        key: "acos_chg_pct",
        label: "ACOS Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangePct(val, { lowerIsBetter: true });
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      },
      { key: "roas", label: "ROAS", sortable: true, render: (val) => formatRoas(val) },
      { key: "cpc", label: "CPC", sortable: true, render: (val) => formatCpc(val, currencyCode) },
      { key: "cvr", label: "CVR", sortable: true, render: (val) => formatPercent(val) },
      { key: "orders", label: "ORDERS", sortable: true },
      { key: "clicks", label: "CLICKS", sortable: true },
      {
        key: "ad_surplus",
        label: "AD SURPLUS",
        sortable: true,
        render: (val) => (
          <span className={Number(val) < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
            {formatCurrency(val, currencyCode)}
          </span>
        )
      },
      {
        key: "surplus_chg",
        label: "SURPLUS Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangeMoney(val, currencyCode);
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      },
      {
        key: "est_profit",
        label: overlayProfit ? `EST. PROFIT (@${marginPct}%)` : "EST. PROFIT",
        sortable: true,
        render: (_val, row) => {
          const profit =
            row.est_profit != null
              ? Number(row.est_profit)
              : overlayProfit
                ? estProfit(row.sales, row.spend, marginPct)
                : null;
          if (profit == null || Number.isNaN(profit)) return "—";
          return (
            <span className={profit < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
              {formatCurrency(profit, currencyCode)}
            </span>
          );
        }
      },
      {
        key: "est_profit_delta",
        label: "EST. PROFIT Δ",
        sortable: true,
        render: (val, row) => {
          const delta = val ?? row.est_profit_delta ?? row.est_profit_chg;
          const chg = formatChangeMoney(delta, currencyCode);
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      }
    ];

    cols.push(
      {
        key: "wasted_spend",
        label: "WASTED SPEND",
        sortable: true,
        render: (val) => (
          <span className={Number(val) > 0 ? "text-red-600 font-medium" : ""}>
            {formatCurrency(val, currencyCode)}
          </span>
        )
      },
      {
        key: "wasted_chg_pct",
        label: "WASTED Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangePct(val, { lowerIsBetter: true });
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      }
    );

    return cols;
  }, [overlayProfit, marginPct, currencyCode]);

  const fetchCampaigns = async (payload, token) =>
    dashboardService.list(
      {
        ...payload,
        range: periodMeta.apiRange,
        overlay_profit: overlayProfit,
        margin_pct: marginPct,
        ...dateParams
      },
      token
    );

  const compareLabel =
    summaryQuery.data?.compareLabel ||
    (resolvedDateRange
      ? resolvedDateRange[0] === resolvedDateRange[1]
        ? resolvedDateRange[0]
        : `${resolvedDateRange[0]} to ${resolvedDateRange[1]}`
      : dateRangeLabel);

  return (
    <div className="space-y-5 pb-8 sm:space-y-6 sm:pb-12">
      <div className="dashboard-kpi-grid">
        <KPICard
          title="AD SPEND"
          value={kpisLoading && !hasKpiValues(kpi) ? "…" : formatCurrency(kpi.spend, currencyCode)}
          change={spendChg.text !== "—" ? spendChg.text : ""}
          changeTone={spendChg.tone}
          subtext={compareSubtext}
        />
        <KPICard
          title="AD SALES"
          value={kpisLoading && !hasKpiValues(kpi) ? "…" : formatCurrency(kpi.sales, currencyCode)}
          change={salesChg.text !== "—" ? salesChg.text : ""}
          changeTone={salesChg.tone}
          subtext={compareSubtext}
        />
        <KPICard
          title={overlayProfit ? `EST. PROFIT (@${marginPct}%)` : "AD SURPLUS"}
          value={kpisLoading && !hasKpiValues(kpi) ? "…" : formatCurrency(surplusValue, currencyCode)}
          change={surplusChg.text !== "—" ? surplusChg.text : ""}
          changeTone={surplusChg.tone}
          subtext={compareSubtext}
        />
        <KPICard
          title="ACOS"
          value={kpisLoading && !hasKpiValues(kpi) ? "…" : formatPercent(kpi.acos)}
          change={acosChg.text !== "—" ? acosChg.text : ""}
          changeTone={acosChg.tone}
          subtext={compareSubtext}
        />
        <KPICard
          title="ROAS"
          value={kpisLoading && !hasKpiValues(kpi) ? "…" : formatRoas(kpi.roas)}
          change={roasChg.text !== "—" ? roasChg.text : ""}
          changeTone={roasChg.tone}
          subtext={compareSubtext}
        />
        <KPICard
          title="WASTED SPEND"
          value={
            kpisLoading && !hasKpiValues(kpi) ? "…" : formatCurrency(kpi.wasted_spend, currencyCode)
          }
          change={wasteChg.text !== "—" ? wasteChg.text : ""}
          changeTone={wasteChg.tone}
          subtext={compareSubtext}
        />
      </div>

      <div className="dashboard-chart-grid">
        <ChartCard title={surplusTitle} desc={surplusDesc}>
          <SurplusChart
            data={surplusSeries}
            loading={chartsLoading && !surplusSeries.length}
            currencyCode={currencyCode}
            animationKey={surplusQuery.dataUpdatedAt}
          />
        </ChartCard>
        <ChartCard title={spendSalesTitle} desc={spendSalesDesc}>
          <SpendSalesChart
            data={spendSalesSeries}
            loading={chartsLoading && !spendSalesSeries.length}
            currencyCode={currencyCode}
            animationKey={spendSalesQuery.dataUpdatedAt}
          />
        </ChartCard>
      </div>

      <div className="dashboard-chart-grid">
        <ChartCard title={acosTitle} desc={acosDesc}>
          <AcosChart
            data={acosSeries}
            loading={chartsLoading && !acosSeries.length}
            animationKey={acosQuery.dataUpdatedAt}
          />
        </ChartCard>
        <ChartCard title={wasteTitle} desc={wasteDesc}>
          <WastedSpendChart
            data={wasteSeries}
            loading={chartsLoading && !wasteSeries.length}
            currencyCode={currencyCode}
            animationKey={wasteQuery.dataUpdatedAt}
          />
        </ChartCard>
      </div>

      <div className="dashboard-chart-grid">
        <ChartCard title={cpcTitle} desc={cpcDesc}>
          <CpcChart
            data={cpcSeries}
            loading={chartsLoading && !cpcSeries.length}
            currencyCode={currencyCode}
            animationKey={cpcQuery.dataUpdatedAt}
          />
        </ChartCard>
        <ChartCard title={cvrTitle} desc={cvrDesc}>
          <CvrChart
            data={cvrSeries}
            loading={chartsLoading && !cvrSeries.length}
            animationKey={cvrQuery.dataUpdatedAt}
          />
        </ChartCard>
      </div>

      <div className="mt-6 sm:mt-8">
        <h2 className="page-title mb-3 sm:mb-4">Campaign Detail</h2>

        <TableView
          title="Campaign Detail"
          entityName="campaigns"
          queryKey={[...dashboardKeys.list(tableExtraParams), "table", String(storeId)]}
          fetchList={fetchCampaigns}
          columns={tableColumns}
          extraParams={tableExtraParams}
          showTitle={false}
          showDateFilter={false}
          showColumnPicker
          showExport
          defaultLimit={5}
          limitOptions={[5, 10, 15, 20, 25, 50]}
        />

        <p className="text-[12px] text-[var(--ink-muted)] mt-3 leading-relaxed">
          Status: <span className="text-green-600 font-medium">Healthy</span> = ACoS trending
          flat/down · <span className="text-amber-600 font-medium">Medium</span> = ACoS rising or
          ROAS below 2x · <span className="text-red-600 font-medium">High leak</span> = ACoS rising
          fast or ROAS below 1x. Wasted Spend = spend on clicks with zero orders. Ad Surplus =
          Sales − Spend (not true profit — doesn&apos;t include COGS/fees).
        </p>
      </div>
    </div>
  );
}

export function SearchTermsTab({
  storeId,
  syncReady,
  currencyCode: currencyCodeProp,
  range,
  overlayProfit,
  marginPct,
  dateRangeLabel,
  dateParams = {}
}) {
  const periodMeta = getPeriodMeta(range);
  const currencyCode = resolveCurrencyCode(currencyCodeProp);
  const enabled = useDashboardEnabled(storeId, syncReady);

  const tableExtraParams = useMemo(
    () => ({
      p_type: periodMeta.apiRange,
      margin_pct: marginPct,
      ...(dateParams.start_date && dateParams.end_date
        ? { date_from: dateParams.start_date, date_to: dateParams.end_date }
        : {})
    }),
    [periodMeta.apiRange, marginPct, dateParams]
  );


  const tableColumns = useMemo(
    () => [
      {
        key: "search_term",
        label: "SEARCH TERM",
        sortable: true,
        width: "24%",
        render: (val) => <span className="font-medium text-[var(--ink)]">{val}</span>
      },
      {
        key: "action",
        label: "ACTION",
        sortable: false,
        render: (_val, row) => <ActionBadge action={searchTermAction(row)} />
      },
      { key: "spend", label: "SPEND", sortable: true, render: (val) => formatCurrency(val, currencyCode) },
      {
        key: "spend_chg_pct",
        label: "SPEND Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangePct(val, { invert: true });
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      },
      { key: "clicks", label: "CLICKS", sortable: true },
      { key: "orders", label: "ORDERS", sortable: true },
      { key: "acos", label: "ACOS", sortable: true, render: (val) => formatPercent(val) },
      {
        key: "acos_chg_pct",
        label: "ACOS Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangePct(val, { invert: true });
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      },
      { key: "cvr", label: "CVR", sortable: true, render: (val) => formatPercent(val) },
      {
        key: "ad_surplus",
        label: "AD SURPLUS",
        sortable: true,
        render: (val) => (
          <span className={Number(val) < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
            {formatCurrency(val, currencyCode)}
          </span>
        )
      },
      {
        key: "est_profit",
        label: overlayProfit ? `EST. PROFIT (@${marginPct}%)` : "EST. PROFIT",
        sortable: true,
        render: (_val, row) => {
          const profit =
            row.est_profit != null
              ? Number(row.est_profit)
              : overlayProfit
                ? estProfit(row.sales, row.spend, marginPct)
                : null;
          if (profit == null || Number.isNaN(profit)) return "—";
          return (
            <span className={profit < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
              {formatCurrency(profit, currencyCode)}
            </span>
          );
        }
      },
      {
        key: "wasted_spend",
        label: "WASTED SPEND",
        sortable: true,
        render: (val) => (
          <span className={Number(val) > 0 ? "text-red-600 font-medium" : ""}>
            {formatCurrency(val, currencyCode)}
          </span>
        )
      }
    ],
    [currencyCode, overlayProfit, marginPct]
  );

  const fetchList = async (payload, token) =>
    dashboardService.searchTerms(
      {
        ...payload,
        p_type: periodMeta.apiRange,
        margin_pct: marginPct,
        ...(dateParams.start_date && dateParams.end_date
          ? { date_from: dateParams.start_date, date_to: dateParams.end_date }
          : {})
      },
      token
    );

  const compareLabel = dateRangeLabel;

  return (
    <div className="space-y-4 pb-8 sm:pb-12">

      <TableView
        title="Search Terms"
        entityName="search terms"
        queryKey={[...dashboardKeys.searchTerms(tableExtraParams), "table", String(storeId)]}
        fetchList={fetchList}
        columns={tableColumns}
        extraParams={tableExtraParams}
        showDateFilter={false}
        showColumnPicker
        showExport
      />

      <p className="text-[12px] text-[var(--ink-muted)] mt-3 leading-relaxed">
        <span className="text-red-600 font-medium">Negate</span> = spend with 0 orders this period.{" "}
        <span className="text-amber-600 font-medium">Watch</span> = ACoS rising / above account
        average. <span className="text-green-600 font-medium">Scale</span> = ACoS well below account
        average.
      </p>
    </div>
  );
}

export function PlacementsTab({
  storeId,
  syncReady,
  currencyCode: currencyCodeProp,
  range,
  overlayProfit,
  marginPct,
  dateRangeLabel,
  dateParams = {}
}) {
  const periodMeta = getPeriodMeta(range);
  const currencyCode = resolveCurrencyCode(currencyCodeProp);
  const enabled = useDashboardEnabled(storeId, syncReady);
  const tableLimit = 5;

  const listDateParams = useMemo(
    () =>
      dateParams.start_date && dateParams.end_date
        ? { date_from: dateParams.start_date, date_to: dateParams.end_date }
        : {},
    [dateParams]
  );

  const tableExtraParams = useMemo(
    () => ({
      p_type: periodMeta.apiRange,
      margin_pct: marginPct,
      ...listDateParams
    }),
    [periodMeta.apiRange, marginPct, listDateParams]
  );

  const tableQueryKeyPrefix = useMemo(
    () => [...dashboardKeys.placements(tableExtraParams), "table", String(storeId)],
    [tableExtraParams, storeId]
  );

  const chartQueryKey = useMemo(
    () => [...dashboardKeys.placements(tableExtraParams), "chart", String(storeId)],
    [tableExtraParams, storeId]
  );

  const placementsQuery = useQuery({
    queryKey: chartQueryKey,
    queryFn: async () =>
      await dashboardService.placementsChart({
        ...tableExtraParams,
        storeId,
        overlayProfit
      }, getCookie(TOKEN_NAME)),
    enabled,
    retry: false
  });

  const { acosChartData, spendChartData } = useMemo(() => {
    const charts = placementsQuery.data?.charts || {};
    
    const acosPoints = charts.acos_by_placement?.points || [];
    const mappedAcos = acosPoints.map(pt => ({
      ...pt,
      label: pt.placement || "—"
    }));

    const spendPoints = charts.spend_share_by_placement?.points || [];
    const mappedSpend = spendPoints.map(pt => ({
      ...pt,
      label: pt.placement || "—"
    }));

    return { acosChartData: mappedAcos, spendChartData: mappedSpend };
  }, [placementsQuery.data]);

  const tableColumns = useMemo(
    () => [
      {
        key: "placement",
        label: "PLACEMENT",
        sortable: true,
        render: (val) => <span className="font-medium text-[var(--ink)]">{val}</span>
      },
      { key: "spend", label: "SPEND", sortable: true, render: (val) => formatCurrency(val, currencyCode) },
      {
        key: "spend_chg_pct",
        label: "SPEND Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangePct(val, { invert: true });
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      },
      {
        key: "spend_share_pct",
        label: "SPEND SHARE",
        sortable: true,
        render: (val) => formatPercent(val)
      },
      { key: "sales", label: "SALES", sortable: true, render: (val) => formatCurrency(val, currencyCode) },
      {
        key: "sales_chg_pct",
        label: "SALES Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangePct(val);
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      },
      { key: "acos", label: "ACOS", sortable: true, render: (val) => formatPercent(val) },
      {
        key: "acos_chg_pct",
        label: "ACOS Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangePct(val, { invert: true });
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      },
      { key: "roas", label: "ROAS", sortable: true, render: (val) => formatRoas(val) },
      { key: "cvr", label: "CVR", sortable: true, render: (val) => formatPercent(val) },
      {
        key: "ad_surplus",
        label: "AD SURPLUS",
        sortable: true,
        render: (val) => (
          <span className={Number(val) < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
            {formatCurrency(val, currencyCode)}
          </span>
        )
      },
      {
        key: "est_profit",
        label: overlayProfit ? `EST. PROFIT (@${marginPct}%)` : "EST. PROFIT",
        sortable: true,
        render: (_val, row) => {
          const profit =
            row.est_profit != null
              ? Number(row.est_profit)
              : overlayProfit
                ? estProfit(row.sales, row.spend, marginPct)
                : null;
          if (profit == null || Number.isNaN(profit)) return "—";
          return (
            <span className={profit < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
              {formatCurrency(profit, currencyCode)}
            </span>
          );
        }
      },
      {
        key: "wasted_spend",
        label: "WASTED SPEND",
        sortable: true,
        render: (val) => (
          <span className={Number(val) > 0 ? "text-red-600 font-medium" : ""}>
            {formatCurrency(val, currencyCode)}
          </span>
        )
      }
    ],
    [currencyCode, overlayProfit, marginPct]
  );

  const fetchList = async (payload, token) =>
    dashboardService.placements(
      {
        ...payload,
        p_type: periodMeta.apiRange,
        margin_pct: marginPct,
        ...listDateParams
      },
      token
    );

  const compareLabel = dateRangeLabel;

  return (
    <div className="space-y-5 pb-8 sm:space-y-6 sm:pb-12">
      <div className="mb-2 sm:mb-4">
        <h2 className="page-title">Placement Performance</h2>
      </div>

      <div className="dashboard-chart-grid">
        <ChartCard title="ACoS by Placement" desc="Where efficiency is leaking">
          <CategoryBarChart
            data={acosChartData}
            dataKey="acos"
            name="ACoS"
            color={CHART_COLORS.placement}
            loading={placementsQuery.isLoading}
            animationKey={placementsQuery.dataUpdatedAt}
          />
        </ChartCard>
        <ChartCard title="Spend Share" desc="Budget distribution across placements">
          <SpendDonutChart
            data={spendChartData}
            loading={placementsQuery.isLoading}
            animationKey={placementsQuery.dataUpdatedAt}
          />
        </ChartCard>
      </div>

      <TableView
        title="Placements"
        entityName="placements"
        queryKey={[...dashboardKeys.placements(tableExtraParams), "table", String(storeId)]}
        fetchList={fetchList}
        columns={tableColumns}
        extraParams={tableExtraParams}
        showDateFilter={false}
        showColumnPicker
        showExport
        defaultLimit={tableLimit}
      />
    </div>
  );
}

export function MatchTypesTab({
  storeId,
  syncReady,
  currencyCode: currencyCodeProp,
  range,
  overlayProfit,
  marginPct,
  dateRangeLabel,
  dateParams = {}
}) {
  const periodMeta = getPeriodMeta(range);
  const currencyCode = resolveCurrencyCode(currencyCodeProp);
  const enabled = useDashboardEnabled(storeId, syncReady);
  const tableLimit = 5;

  const listDateParams = useMemo(
    () =>
      dateParams.start_date && dateParams.end_date
        ? { date_from: dateParams.start_date, date_to: dateParams.end_date }
        : {},
    [dateParams]
  );

  const tableExtraParams = useMemo(
    () => ({
      p_type: periodMeta.apiRange,
      margin_pct: marginPct,
      ...listDateParams
    }),
    [periodMeta.apiRange, marginPct, listDateParams]
  );

  const tableQueryKeyPrefix = useMemo(
    () => [...dashboardKeys.matchTypes(tableExtraParams), "table", String(storeId)],
    [tableExtraParams, storeId]
  );

  const chartQueryKey = useMemo(
    () => [...dashboardKeys.matchTypes(tableExtraParams), "chart", String(storeId)],
    [tableExtraParams, storeId]
  );

  const matchQuery = useQuery({
    queryKey: chartQueryKey,
    queryFn: async () =>
      await dashboardService.matchTypesChart({
        ...tableExtraParams,
        storeId,
        overlayProfit
      }, getCookie(TOKEN_NAME)),
    enabled,
    retry: false
  });

  const { acosChartData, wastedSpendChartData } = useMemo(() => {
    const charts = matchQuery.data?.charts || {};
    
    const acosPoints = [...(charts.acos_by_match_type?.points || [])].sort(
      (a, b) => (Number(a.acos) || 0) - (Number(b.acos) || 0)
    );
    const mappedAcos = acosPoints.map(pt => ({
      ...pt,
      label: pt.match_type || pt.name || "—"
    }));

    const wastePoints = charts.wasted_spend_by_match_type?.points || charts.waste_by_match_type?.points || [];
    const mappedWaste = wastePoints.map(pt => ({
      ...pt,
      label: pt.match_type || pt.name || "—"
    }));

    return { acosChartData: mappedAcos, wastedSpendChartData: mappedWaste };
  }, [matchQuery.data]);

  const tableColumns = useMemo(
    () => [
      {
        key: "match_type",
        label: "MATCH TYPE",
        sortable: true,
        render: (val) => <span className="font-medium text-[var(--ink)]">{val}</span>
      },
      { key: "spend", label: "SPEND", sortable: true, render: (val) => formatCurrency(val, currencyCode) },
      {
        key: "spend_chg_pct",
        label: "SPEND Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangePct(val, { invert: true });
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      },
      { key: "sales", label: "SALES", sortable: true, render: (val) => formatCurrency(val, currencyCode) },
      { key: "acos", label: "ACOS", sortable: true, render: (val) => formatPercent(val) },
      {
        key: "acos_chg_pct",
        label: "ACOS Δ",
        sortable: true,
        render: (val) => {
          const chg = formatChangePct(val, { invert: true });
          return <span className={changeToneClass(chg.tone)}>{chg.text}</span>;
        }
      },
      { key: "roas", label: "ROAS", sortable: true, render: (val) => formatRoas(val) },
      { key: "cvr", label: "CVR", sortable: true, render: (val) => formatPercent(val) },
      {
        key: "ad_surplus",
        label: "AD SURPLUS",
        sortable: true,
        render: (val) => (
          <span className={Number(val) < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
            {formatCurrency(val, currencyCode)}
          </span>
        )
      },
      {
        key: "est_profit",
        label: overlayProfit ? `EST. PROFIT (@${marginPct}%)` : "EST. PROFIT",
        sortable: true,
        render: (_val, row) => {
          const profit =
            row.est_profit != null
              ? Number(row.est_profit)
              : overlayProfit
                ? estProfit(row.sales, row.spend, marginPct)
                : null;
          if (profit == null || Number.isNaN(profit)) return "—";
          return (
            <span className={profit < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
              {formatCurrency(profit, currencyCode)}
            </span>
          );
        }
      },
      {
        key: "wasted_spend",
        label: "WASTED SPEND",
        sortable: true,
        render: (val) => (
          <span className={Number(val) > 0 ? "text-red-600 font-medium" : ""}>
            {formatCurrency(val, currencyCode)}
          </span>
        )
      }
    ],
    [currencyCode, overlayProfit, marginPct]
  );

  const fetchList = async (payload, token) =>
    dashboardService.matchTypes(
      {
        ...payload,
        p_type: periodMeta.apiRange,
        margin_pct: marginPct,
        ...listDateParams
      },
      token
    );

  const compareLabel = dateRangeLabel;

  return (
    <div className="space-y-5 pb-8 sm:space-y-6 sm:pb-12">
      <div className="mb-2 sm:mb-4">
        <h2 className="page-title">Match Type Efficiency</h2>
      </div>

      <div className="dashboard-chart-grid">
        <ChartCard title="ACoS by Match Type" desc="Lower is better">
          <CategoryBarChart
            data={acosChartData}
            dataKey="acos"
            name="ACoS"
            color={CHART_COLORS.acos}
            loading={matchQuery.isLoading}
            animationKey={matchQuery.dataUpdatedAt}
          />
        </ChartCard>
        <ChartCard title="Wasted Spend by Match Type" desc="Zero-conversion spend concentration">
          <CategoryBarChart
            data={wastedSpendChartData}
            dataKey="wasted_spend"
            name="Wasted Spend"
            color={CHART_COLORS.waste}
            loading={matchQuery.isLoading}
            animationKey={matchQuery.dataUpdatedAt}
          />
        </ChartCard>
      </div>

      <TableView
        title="Match Types"
        entityName="match types"
        queryKey={[...dashboardKeys.matchTypes(tableExtraParams), "table", String(storeId)]}
        fetchList={fetchList}
        columns={tableColumns}
        extraParams={tableExtraParams}
        showDateFilter={false}
        showColumnPicker
        showExport
        defaultLimit={tableLimit}
      />
    </div>
  );
}

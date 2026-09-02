import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCookie, TOKEN_NAME } from "../utils/cookie";
import { useStore } from "../context/StoreContext";
import DashboardTabs from "../components/dashboard/DashboardTabs";
import DateRangePicker from "../components/ui/DateRangePicker";
import {
  MatchTypesTab,
  OverviewTab,
  PlacementsTab,
  SearchTermsTab
} from "../components/dashboard/OverviewTab";
import {
  DASHBOARD_PERIODS,
  buildDashboardNavSearchParams,
  getDashboardNavigationType,
  isDashboardPeriodId,
  isDashboardSectionId,
  readDashboardNavFromSearchParams,
  resolveCurrencyCode
} from "../utils/dashboard";
import { formatIsoDate, formatRangeLabel, resolvePresetRange } from "../utils/report";
import {
  getDashboardPrefs,
  getSelectedStoreId,
  setDashboardPrefs
} from "../utils/storage";

function dateFilterFromStoredRange(range) {
  if (!range?.startDate || !range?.endDate) return null;
  return {
    startDate: range.startDate,
    endDate: range.endDate,
    operator: range.operator || "between",
    preset: range.preset || "custom"
  };
}

function buildDefaultDateFilter(onboardedAt = null) {
  const range = resolvePresetRange("last_30", { onboardedAt });
  if (!range?.start || !range?.end) {
    return {
      startDate: null,
      endDate: null,
      operator: "between",
      preset: null
    };
  }
  const startDate = formatIsoDate(range.start);
  const endDate = formatIsoDate(range.end);
  return {
    startDate,
    endDate,
    operator: "between",
    preset: "custom"
  };
}

function defaultDateRangeLabel(onboardedAt = null) {
  const filter = buildDefaultDateFilter(onboardedAt);
  if (!filter.startDate || !filter.endDate) return "Select dates";
  return formatRangeLabel(filter.startDate, filter.endDate);
}

function readStoredDashboardState(storeId, onboardedAt = null) {
  const prefs = getDashboardPrefs(storeId);
  const storedFilter = dateFilterFromStoredRange(prefs.dateRange);
  return {
    overlayProfit: prefs.overlayProfit,
    marginPct: prefs.marginPct,
    dateFilter: storedFilter || buildDefaultDateFilter(onboardedAt)
  };
}

function resolvePersistStoreId(selectedStoreId, selectedStore) {
  return Number(selectedStoreId || selectedStore?.id || getSelectedStoreId()) || 0;
}

const BETWEEN_ONLY_OPERATORS = [{ value: "between", label: "Between" }];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = getCookie(TOKEN_NAME);
  const { selectedStore, selectedStoreId } = useStore();
  const initialStoreId = resolvePersistStoreId(getSelectedStoreId(), null);
  const initialDashboardState = readStoredDashboardState(initialStoreId);
  const loadedStoreIdRef = useRef(null);
  const didInitNavRef = useRef(false);

  const { activeSection, activePeriod } = readDashboardNavFromSearchParams(searchParams);

  const [overlayProfit, setOverlayProfit] = useState(initialDashboardState.overlayProfit);
  const [marginPct, setMarginPct] = useState(initialDashboardState.marginPct);
  const [dateFilter, setDateFilter] = useState(initialDashboardState.dateFilter);
  const [dateRangeLabel, setDateRangeLabel] = useState(() => {
    const filter = initialDashboardState.dateFilter;
    if (filter.startDate && filter.endDate) {
      return formatRangeLabel(filter.startDate, filter.endDate);
    }
    return defaultDateRangeLabel();
  });

  const storeId = resolvePersistStoreId(selectedStoreId, selectedStore);
  const syncReady = selectedStore?.sync_per == null || selectedStore.sync_per === 100;
  const currencyCode = resolveCurrencyCode(
    selectedStore?.currency_code ||
    selectedStore?.marketplace_json?.[0]?.currencyCode
  );
  const hasCustomDateRange = Boolean(dateFilter.startDate && dateFilter.endDate);

  const dateParams = useMemo(() => {
    if (!hasCustomDateRange) return {};
    return {
      start_date: dateFilter.startDate,
      end_date: dateFilter.endDate
    };
  }, [hasCustomDateRange, dateFilter.startDate, dateFilter.endDate]);

  const handleDateRangeChange = useCallback(
    (label) => {
      if (dateFilter.startDate && dateFilter.endDate) return;
      if (label) setDateRangeLabel(label);
    },
    [dateFilter.startDate, dateFilter.endDate]
  );

  const persistDashboardUi = useCallback(
    (nextState) => {
      const id = resolvePersistStoreId(selectedStoreId, selectedStore);
      if (!id) return;
      setDashboardPrefs(id, {
        dateRange: nextState.dateFilter,
        overlayProfit: nextState.overlayProfit,
        marginPct: nextState.marginPct
      });
    },
    [selectedStore, selectedStoreId]
  );

  const handleDateFilterApply = useCallback(
    (next) => {
      const applied = {
        startDate: next?.startDate || null,
        endDate: next?.endDate || null,
        operator: "between",
        preset: next?.preset || null
      };
      setDateFilter(applied);
      persistDashboardUi({
        dateFilter: applied,
        overlayProfit,
        marginPct
      });
    },
    [marginPct, overlayProfit, persistDashboardUi]
  );

  const handleDateFilterClear = useCallback(() => {
    const next = buildDefaultDateFilter(selectedStore?.created_at || null);
    setDateFilter(next);
    persistDashboardUi({
      dateFilter: next,
      overlayProfit,
      marginPct
    });
  }, [marginPct, overlayProfit, persistDashboardUi, selectedStore?.created_at]);

  const handleOverlayProfitChange = useCallback(
    (checked) => {
      setOverlayProfit(checked);
      persistDashboardUi({
        dateFilter,
        overlayProfit: checked,
        marginPct
      });
    },
    [dateFilter, marginPct, persistDashboardUi]
  );

  const handleMarginPctChange = useCallback(
    (nextMargin) => {
      setMarginPct(nextMargin);
      persistDashboardUi({
        dateFilter,
        overlayProfit,
        marginPct: nextMargin
      });
    },
    [dateFilter, overlayProfit, persistDashboardUi]
  );

  useEffect(() => {
    if (!token) {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!storeId || loadedStoreIdRef.current === storeId) return;

    loadedStoreIdRef.current = storeId;
    const stored = readStoredDashboardState(storeId, selectedStore?.created_at || null);
    setOverlayProfit(stored.overlayProfit);
    setMarginPct(stored.marginPct);
    setDateFilter(stored.dateFilter);
  }, [storeId, selectedStore?.created_at]);

  useEffect(() => {
    if (hasCustomDateRange) {
      setDateRangeLabel(formatRangeLabel(dateFilter.startDate, dateFilter.endDate));
    }
  }, [hasCustomDateRange, dateFilter.startDate, dateFilter.endDate]);

  useEffect(() => {
    if (didInitNavRef.current) return;
    didInitNavRef.current = true;

    const navType = getDashboardNavigationType();
    if (navType === "navigate" && (searchParams.has("section") || searchParams.has("period"))) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handlePeriodChange = useCallback(
    (period) => {
      if (!isDashboardPeriodId(period)) return;
      setSearchParams(
        buildDashboardNavSearchParams(searchParams, {
          section: activeSection,
          period
        }),
        { replace: true }
      );
    },
    [activeSection, searchParams, setSearchParams]
  );

  const handleSectionChange = useCallback(
    (section) => {
      if (!isDashboardSectionId(section)) return;
      setSearchParams(
        buildDashboardNavSearchParams(searchParams, {
          section,
          period: activePeriod
        }),
        { replace: true }
      );
    },
    [activePeriod, searchParams, setSearchParams]
  );

  if (!token) {
    return null;
  }

  const sharedProps = {
    storeId,
    syncReady,
    currencyCode,
    range: activePeriod,
    overlayProfit,
    marginPct,
    dateRangeLabel,
    dateParams,
    onDateRangeChange: handleDateRangeChange
  };

  return (
    <div className="dashboard-page space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 min-w-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 shrink-0">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="flex w-full min-w-0 flex-col items-stretch gap-1.5 sm:w-auto sm:min-w-[260px] sm:max-w-[360px]">
          <DateRangePicker
            className="w-full"
            startDate={dateFilter.startDate}
            endDate={dateFilter.endDate}
            operator="between"
            preset={dateFilter.preset}
            operators={BETWEEN_ONLY_OPERATORS}
            onboardedAt={selectedStore?.created_at || null}
            onApply={handleDateFilterApply}
            onClear={handleDateFilterClear}
            showApplyToast
            hideOperatorSelect
            preferDateRangeLabel
          />
          {!hasCustomDateRange && dateRangeLabel ? (
            <p className="px-0.5 text-[12px] text-[var(--ink-muted)]">
              Current: <span className="font-medium text-[var(--ink)]">{dateRangeLabel}</span>
            </p>
          ) : null}
        </div>
      </div>

      <DashboardTabs
        periods={DASHBOARD_PERIODS}
        activePeriod={activePeriod}
        onPeriodChange={handlePeriodChange}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        overlayProfit={overlayProfit}
        onOverlayProfitChange={handleOverlayProfitChange}
        marginPct={marginPct}
        onMarginPctChange={handleMarginPctChange}
      />

      {activeSection === "overview" ? <OverviewTab {...sharedProps} /> : null}
      {activeSection === "search-terms" ? <SearchTermsTab {...sharedProps} /> : null}
      {activeSection === "placements" ? <PlacementsTab {...sharedProps} /> : null}
      {activeSection === "match-types" ? <MatchTypesTab {...sharedProps} /> : null}
    </div>
  );
}

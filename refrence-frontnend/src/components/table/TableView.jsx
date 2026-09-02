import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownTrayIcon } from '../ui/Icons';
import TableColumns from "./TableColumns";
import TableFilter from "./TableFilter";
import TableSummary from "./TableSummary";
import Table, {
  TableLimit,
  TableSearch,
  DEFAULT_TABLE_LIMIT,
  TABLE_LIMIT_OPTIONS
} from "./Table";
import { TableSkeleton, TableStatusPanel } from "./TableState";
import TableToolbarActionButton from "./TableToolbarActionButton";
import DateRangePicker from "../ui/DateRangePicker";
import { MessageBox } from '../ui/MessageBox';
import { useStore } from "../../context/StoreContext";
import { useTable } from "../../hooks/useTable";
import { debounce, normalizeReportListResponse } from "../../utils/helper";
import { getCookie, TOKEN_NAME } from "../../utils/cookie";
import { resolveTableId } from "../../utils/storage";
import { buildExportRows, downloadExcelWorkbook, serializeAppliedFilters, getDateFilterField, excludeDateFilterFields, serializeDateRangeFilter } from "../../utils/report";

function getDefaultSortBy(columns = []) {
  const dateKeys = new Set([
    "report_date",
    "record_date",
    "start_date",
    "date"
  ]);

  const preferred = columns.find((column) => {
    if (column?.sortable === false) return false;
    const key = String(column?.sortKey || column?.key || "");
    if (key === "asin") return false;
    return dateKeys.has(key);
  });

  return preferred?.sortKey || preferred?.key || "";
}

export default function TableView({
  title,
  entityName = "records",
  columns,
  queryKey,
  fetchList,
  extraParams = null,
  toolbarBeforeLimit = null,
  defaultSortBy = null,
  defaultSortOrder = "DESC",
  defaultLimit = DEFAULT_TABLE_LIMIT,
  limitOptions = TABLE_LIMIT_OPTIONS,
  showDateFilter = true,
  showTitle = true,
  summaryMetrics = null,
  renderHeader = null,
  showColumnPicker = true,
  showExport = true,
  toolbarEndExtra = null
}) {
  const navigate = useNavigate();
  const token = getCookie(TOKEN_NAME);
  const { selectedStore, selectedStoreId } = useStore();

  const initialSortBy = defaultSortBy || getDefaultSortBy(columns);
  const resolvedDefaultLimit = Math.max(1, Number(defaultLimit) || DEFAULT_TABLE_LIMIT);
  const resolvedLimitOptions = useMemo(() => {
    const base = Array.isArray(limitOptions) && limitOptions.length
      ? limitOptions.map(Number).filter((n) => Number.isFinite(n) && n > 0)
      : TABLE_LIMIT_OPTIONS;
    if (!base.includes(resolvedDefaultLimit)) {
      return [...base, resolvedDefaultLimit].sort((a, b) => a - b);
    }
    return base;
  }, [limitOptions, resolvedDefaultLimit]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceSearch = useMemo(() => debounce(setDebouncedSearch, 400), []);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(resolvedDefaultLimit);
  const [isExporting, setIsExporting] = useState(false);
  const [sortBy, setSortBy] = useState(() => initialSortBy);
  const [sortOrder, setSortOrder] = useState(() =>
    initialSortBy
      ? String(defaultSortOrder || "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC"
      : "DESC"
  );

  useEffect(() => {
    debounceSearch(search);
    return () => debounceSearch.cancel();
  }, [search, debounceSearch]);

  useEffect(() => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
    setLimit(resolvedDefaultLimit);
  }, [selectedStoreId, resolvedDefaultLimit]);
  const resolvedExtraParams =
    extraParams && typeof extraParams === "object" && !Array.isArray(extraParams)
      ? extraParams
      : {};
  const extraParamsKey = JSON.stringify(resolvedExtraParams);
  const tableId = useMemo(() => resolveTableId(queryKey), [queryKey]);
  const {
    columns: orderedColumns,
    visibleColumns,
    isColumnVisible,
    isColumnLocked,
    setColumnVisible,
    visibleCount,
    appliedFilters,
    setAppliedFilters,
    dateRange,
    setDateRange,
    clearDateRange
  } = useTable(tableId, columns);

  const deferredAppliedFilters = useDeferredValue(appliedFilters);
  const baseApiFilters = useMemo(
    () => serializeAppliedFilters(deferredAppliedFilters),
    [deferredAppliedFilters]
  );

  const [resolvedDateFieldName, setResolvedDateFieldName] = useState(
    () => dateRange?.field || ""
  );

  const apiFilters = useMemo(() => {
    const dateFilter = showDateFilter
      ? serializeDateRangeFilter(dateRange, {
        fieldName: resolvedDateFieldName || dateRange?.field || ""
      })
      : null;

    const dateFieldKey = String(
      dateFilter?.field || resolvedDateFieldName || dateRange?.field || ""
    ).trim();

    const withoutDupDate = dateFieldKey
      ? baseApiFilters.filter(
        (item) => String(item?.field || "").trim() !== dateFieldKey
      )
      : baseApiFilters;

    return dateFilter ? [...withoutDupDate, dateFilter] : withoutDupDate;
  }, [showDateFilter, dateRange, resolvedDateFieldName, baseApiFilters]);

  const filtersKey = JSON.stringify(apiFilters);

  useEffect(() => {
    if (!token) {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, token]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedStoreId, limit, extraParamsKey, sortBy, sortOrder, filtersKey]);

  const storeId = selectedStoreId || selectedStore?.id || "";

  const sortParams = sortBy
    ? { sortby: sortBy, sortorder: sortOrder }
    : {};

  const buildListPayload = ({
    page: pageValue,
    limit: limitValue,
    search: searchValue
  }) => {
    const payload = {
      store_id: Number(storeId) || storeId,
      page: pageValue,
      limit: limitValue,
      filters: apiFilters,
      ...sortParams,
      ...resolvedExtraParams
    };

    const trimmedSearch = String(searchValue || "").trim();
    if (trimmedSearch) {
      payload.search = trimmedSearch;
    }

    return payload;
  };

  const listQuery = useQuery({
    queryKey: [
      ...queryKey,
      {
        storeId: String(storeId || ""),
        page,
        limit,
        search: debouncedSearch.trim(),
        filters: apiFilters,
        ...sortParams,
        ...resolvedExtraParams
      }
    ],
    queryFn: async () => {
      const data = await fetchList(
        buildListPayload({
          page,
          limit,
          search: debouncedSearch.trim()
        }),
        getCookie(TOKEN_NAME)
      );
      return normalizeReportListResponse(data);
    },
    enabled: Boolean(token && storeId && selectedStore?.sync_per === 100),
    retry: false,
    placeholderData: (previous) => previous
  });

  const filterFields = listQuery.data?.filterFields ?? [];
  const deferredFilterFields = useDeferredValue(filterFields);
  const dateFilterField = showDateFilter
    ? getDateFilterField(deferredFilterFields)
    : null;

  useEffect(() => {
    if (!showDateFilter) return;
    const name = dateFilterField?.fieldName || dateFilterField?.field || "";
    if (!name) return;
    setResolvedDateFieldName((prev) => (prev === name ? prev : name));
  }, [showDateFilter, dateFilterField?.fieldName, dateFilterField?.field]);

  const filterFieldsForBar = useMemo(
    () =>
      showDateFilter
        ? excludeDateFilterFields(deferredFilterFields)
        : deferredFilterFields,
    [showDateFilter, deferredFilterFields]
  );

  const appliedFiltersForBar = useMemo(() => {
    if (!showDateFilter) return appliedFilters;
    const key = String(resolvedDateFieldName || dateRange?.field || "").trim();
    if (!key) return appliedFilters;
    return appliedFilters.filter(
      (item) =>
        String(item?.fieldName || "").trim() !== key &&
        String(item?.field || "").trim() !== key
    );
  }, [showDateFilter, appliedFilters, resolvedDateFieldName, dateRange?.field]);

  const handleSortChange = (nextSortBy) => {
    const field = String(nextSortBy || "").trim();
    if (!field || field === "asin") return;

    if (sortBy === field) {
      if (sortOrder === "DESC") {
        setSortOrder("ASC");
      } else {
        setSortBy("");
        setSortOrder("DESC");
      }
      return;
    }

    setSortBy(field);
    setSortOrder("DESC");
  };

  if (!token) {
    return null;
  }

  const rows = listQuery.data?.rows ?? [];
  const summary = listQuery.data?.summary ?? null;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const totalRecords = listQuery.data?.totalRecords ?? 0;
  const currentPage = listQuery.data?.page ?? page;
  const showInitialLoader = listQuery.isLoading && !listQuery.data;
  const canExport = Boolean(storeId && totalRecords > 0 && !isExporting && !showInitialLoader);
  const canShowDatePicker = Boolean(showDateFilter && (dateFilterField || dateRange?.field));

  const handleExportExcel = async () => {
    if (!canExport) return;

    const exportLimit = Math.max(Number(totalRecords) || 0, 1);

    setIsExporting(true);
    try {
      const data = await fetchList(
        buildListPayload({
          page: 1,
          limit: exportLimit,
          search: debouncedSearch.trim()
        }),
        getCookie(TOKEN_NAME)
      );
      const normalized = normalizeReportListResponse(data);
      const exportRows = normalized.rows ?? [];

      if (!exportRows.length) {
        MessageBox("warn", "No data available to export");
        return;
      }

      const sheetData = buildExportRows(visibleColumns, exportRows);
      downloadExcelWorkbook(sheetData, {
        sheetName: title || "Report",
        fileName: title || "report"
      });
      MessageBox("success", "Exported successfully");
    } catch {
      void 0;
    } finally {
      setIsExporting(false);
    }
  };

  const toolbarLeading = (
    <TableSearch value={search} onChange={setSearch} />
  );

  const toolbarTrailing = (
    <div className="table-toolbar__tools">
      {toolbarBeforeLimit ? (
        <div className="table-toolbar__type shrink-0">{toolbarBeforeLimit}</div>
      ) : null}
      <TableLimit value={limit} onChange={setLimit} options={resolvedLimitOptions} />
      {showColumnPicker ? (
        <TableColumns
          columns={orderedColumns}
          isColumnVisible={isColumnVisible}
          isColumnLocked={isColumnLocked}
          setColumnVisible={setColumnVisible}
          visibleCount={visibleCount}
        />
      ) : null}
    </div>
  );

  const toolbarDate = canShowDatePicker ? (
    <DateRangePicker
      className="w-full"
      startDate={dateRange.startDate}
      endDate={dateRange.endDate}
      operator={dateRange.operator}
      preset={dateRange.preset}
      operators={dateFilterField?.operators || null}
      onApply={(next) =>
        setDateRange({
          ...next,
          field:
            dateFilterField?.fieldName ||
            dateFilterField?.field ||
            resolvedDateFieldName ||
            dateRange.field ||
            ""
        })
      }
      onClear={clearDateRange}
    />
  ) : null;

  const toolbarEnd = showExport || toolbarEndExtra ? (
    <div className="table-toolbar__actions">
      {toolbarEndExtra}
      {showExport ? (
        <TableToolbarActionButton
          label="Export"
          loadingLabel="Exporting..."
          isLoading={isExporting}
          icon={ArrowDownTrayIcon}
          onClick={handleExportExcel}
          disabled={!canExport}
        />
      ) : null}
    </div>
  ) : null;

  const showSummary =
    Boolean(storeId) &&
    Array.isArray(summaryMetrics) &&
    summaryMetrics.length > 0;

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-5 pt-0 sm:pt-1">
        {showTitle ? (
          <div className="min-w-0 px-0.5 py-0.5 sm:py-1">
            <h1 className="page-title">{title}</h1>
          </div>
        ) : null}

        {showSummary ? (
          <TableSummary
            summary={showInitialLoader ? null : summary}
            metrics={summaryMetrics}
            isFetching={listQuery.isFetching || showInitialLoader}
          />
        ) : null}

        <div className="table-panel min-w-0 max-w-full overflow-visible">
          <TableFilter
            filterFields={filterFieldsForBar}
            columns={orderedColumns}
            visibleColumns={visibleColumns}
            appliedFilters={appliedFiltersForBar}
            onAppliedFiltersChange={(next) => {
              startTransition(() => setAppliedFilters(next));
            }}
            leadingSlot={toolbarLeading}
            trailingSlot={toolbarTrailing}
            dateSlot={toolbarDate}
            endSlot={toolbarEnd}
          />

          <div className={`min-w-0 max-w-full overflow-hidden ${listQuery.isFetching && !showInitialLoader ? "opacity-70" : ""}`}>
            <Table
              columns={visibleColumns}
              rows={storeId && !showInitialLoader && !listQuery.isError ? rows : []}
              isLoading={showInitialLoader}
              startIndex={(currentPage - 1) * limit + 1}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              sortingDisabled={listQuery.isFetching}
              emptyMessage={
                listQuery.isError && !listQuery.data
                  ? "Couldn't load report data"
                  : !storeId
                    ? "Select a store"
                    : debouncedSearch.trim() || appliedFiltersForBar.length || dateRange?.startDate
                      ? "No matching rows"
                      : "No data found"
              }
              emptyDescription={
                listQuery.isError && !listQuery.data
                  ? "Something went wrong while fetching this report."
                  : !storeId
                    ? "Choose a store from the header to load this report."
                    : debouncedSearch.trim() || appliedFiltersForBar.length || dateRange?.startDate
                      ? "Try adjusting search or filters."
                      : "There is nothing to show for the current date range."
              }
              emptyActionLabel={
                listQuery.isError && !listQuery.data ? "Retry" : undefined
              }
              onEmptyAction={
                listQuery.isError && !listQuery.data ? () => listQuery.refetch() : undefined
              }
              page={currentPage}
              totalPages={storeId ? totalPages : 1}
              totalRecords={storeId ? totalRecords : 0}
              pageSize={limit}
              entityName={entityName}
              paginationDisabled={listQuery.isFetching || !storeId}
              onPageChange={setPage}
              renderHeader={renderHeader}
            />
          </div>
        </div>
      </div>
  );
}
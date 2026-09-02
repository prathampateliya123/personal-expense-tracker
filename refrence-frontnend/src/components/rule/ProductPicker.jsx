import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DateRangePicker from "../ui/DateRangePicker";
import TableColumns from "../table/TableColumns";
import TableFilter from "../table/TableFilter";
import Table, {
  TableLimit,
  TableSearch,
  TableSelect
} from "../table/Table";
import RuleSection from "./RuleSection";
import { TableLoadingSpinner, TableStatusPanel } from "../table/TableState";
import FieldErrorTooltip from "../ui/FieldErrorTooltip";
import { listRuleProducts, listRuleUpdateProducts } from "../../services/ruleService";
import { useStore } from "../../context/StoreContext";
import { useTable } from "../../hooks/useTable";
import {
  debounce,
  formatPercent,
  formatReportNumber,
  dash,
  normalizeReportListResponse
} from "../../utils/helper";
import { ruleKeys } from "../../services/queryKeys";
import { getCookie, TOKEN_NAME } from "../../utils/cookie";
import { compactProductSnapshot, getProductRowId } from "../../utils/rulePayload";
import { resolveTableId } from "../../utils/storage";
import {
  excludeDateFilterFields,
  getDateFilterField,
  serializeAppliedFilters,
  serializeDateRangeFilter
} from "../../utils/report";

const PAGE_LIMIT = 10;
const DATE_FIELD_FALLBACK = "report_date";
const DEFAULT_TTYPE = "all";
const PRODUCT_TTYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "multi", label: "Multi" },
  { value: "single", label: "Single" }
];

const productListColumns = [
  {
    key: "campaign_name",
    label: "Campaign",
    minWidth: "220px",
    maxWidth: "280px",
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

function hasId(ids = [], targetId) {
  const key = String(targetId);
  return ids.some((item) => String(item) === key);
}

function isRowSelectedFlag(row) {
  return row?.is_selected === true || row?.is_selected === "true" || row?.is_selected === 1;
}

function sameIdList(a = [], b = []) {
  if (a.length !== b.length) return false;
  const setB = new Set(b.map((id) => String(id)));
  return a.every((id) => setB.has(String(id)));
}

function mergePageSelectionFromFlags(prevSelected = [], rows = []) {
  const pageIds = [];
  const selectedOnPage = [];

  for (const row of rows) {
    const id = getProductRowId(row);
    if (!id) continue;
    pageIds.push(id);
    if (isRowSelectedFlag(row)) selectedOnPage.push(id);
  }

  const pageIdSet = new Set(pageIds.map((id) => String(id)));
  const offPage = prevSelected.filter((id) => !pageIdSet.has(String(id)));
  return [...offPage, ...selectedOnPage];
}

function getSelectionSummary({ readOnly, selectingAll, selectedCount, totalRecords }) {
  if (readOnly) {
    return `${selectedCount} product${selectedCount === 1 ? "" : "s"} selected`;
  }
  if (selectingAll) return "Selecting all products...";
  const allSelected = totalRecords > 0 && selectedCount >= totalRecords;
  return `${selectedCount} selected${allSelected ? " (all)" : ""}`;
}

export default function ProductPicker({
  selectedIds = [],
  selectedProducts = [],
  error,
  onChange,
  readOnly = false,
  ruleId = null,
  splitHeader = false
}) {
  const token = getCookie(TOKEN_NAME);
  const { selectedStore, selectedStoreId } = useStore();
  const storeId = selectedStoreId || selectedStore?.id || "";
  const isRuleScoped = Boolean(ruleId);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceSearch = useMemo(() => debounce(setDebouncedSearch, 400), []);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [sortBy, setSortBy] = useState(DATE_FIELD_FALLBACK);
  const [sortOrder, setSortOrder] = useState("DESC");
  const [selectingAll, setSelectingAll] = useState(false);
  const [selectionTouched, setSelectionTouched] = useState(false);
  const [ttype, setTtype] = useState(DEFAULT_TTYPE);

  const selectedIdsRef = useRef(selectedIds);
  const onChangeRef = useRef(onChange);
  const selectedProductsMapRef = useRef(new Map());
  selectedIdsRef.current = selectedIds;
  onChangeRef.current = onChange;

  const rememberProductRows = useCallback((rowList = []) => {
    rowList.forEach((row, index) => {
      const id = getProductRowId(row, index);
      const snap = compactProductSnapshot(row, index);
      if (!id || !snap) return;
      selectedProductsMapRef.current.set(String(id), snap);
    });
  }, []);

  const emitSelection = useCallback(
    (nextIds = [], extraRows = []) => {
      rememberProductRows(extraRows);
      const nextMap = new Map();
      for (const id of nextIds) {
        const key = String(id);
        if (!key) continue;
        nextMap.set(key, selectedProductsMapRef.current.get(key) || { productId: key });
      }
      selectedProductsMapRef.current = nextMap;
      onChangeRef.current?.(
        Array.from(nextMap.keys()),
        Array.from(nextMap.values())
      );
    },
    [rememberProductRows]
  );

  useEffect(() => {
    if (!Array.isArray(selectedProducts) || !selectedProducts.length) return;
    rememberProductRows(selectedProducts);
  }, [selectedProducts, rememberProductRows]);

  useEffect(() => {
    debounceSearch(search);
    return () => debounceSearch.cancel();
  }, [search, debounceSearch]);

  useEffect(() => {
    setSelectionTouched(false);
  }, [ruleId]);

  useEffect(() => {
    setSearch("");
    setDebouncedSearch("");
    setTtype(DEFAULT_TTYPE);
    setPage(1);
  }, [storeId]);

  const tableId = useMemo(
    () =>
      resolveTableId(
        isRuleScoped ? ruleKeys.updateProductList(ruleId) : ruleKeys.productList()
      ),
    [isRuleScoped, ruleId]
  );
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
  } = useTable(tableId, productListColumns);

  const baseApiFilters = useMemo(
    () => serializeAppliedFilters(appliedFilters),
    [appliedFilters]
  );

  const [resolvedDateFieldName, setResolvedDateFieldName] = useState(
    () => dateRange?.field || DATE_FIELD_FALLBACK
  );

  const apiFilters = useMemo(() => {
    const dateFilter = serializeDateRangeFilter(dateRange, {
      fieldName: resolvedDateFieldName || dateRange?.field || DATE_FIELD_FALLBACK
    });

    const dateFieldKey = String(
      dateFilter?.field || resolvedDateFieldName || dateRange?.field || ""
    ).trim();

    const withoutDupDate = dateFieldKey
      ? baseApiFilters.filter((item) => String(item?.field || "").trim() !== dateFieldKey)
      : baseApiFilters;

    return dateFilter ? [...withoutDupDate, dateFilter] : withoutDupDate;
  }, [dateRange, resolvedDateFieldName, baseApiFilters]);

  const filtersKey = JSON.stringify(apiFilters);
  const sortParams = sortBy ? { sortby: sortBy, sortorder: sortOrder } : {};
  const resetToFirstPage = useCallback(() => setPage(1), []);

  const buildListPayload = (pageNum, pageLimit, searchText = debouncedSearch) => {
    const payload = {
      store_id: Number(storeId) || storeId || 0,
      page: pageNum,
      limit: pageLimit,
      filters: apiFilters,
      ttype: String(ttype || DEFAULT_TTYPE).trim() || DEFAULT_TTYPE,
      ...sortParams
    };
    const trimmedSearch = String(searchText || "").trim();
    if (trimmedSearch) payload.search = trimmedSearch;
    if (isRuleScoped) payload.rule_id = Number(ruleId) || ruleId;
    return payload;
  };

  const fetchProductPage = async (payload, tokenNow) => {
    const data = isRuleScoped
      ? await listRuleUpdateProducts(payload, tokenNow)
      : await listRuleProducts(payload, tokenNow);
    return normalizeReportListResponse(data);
  };

  useEffect(() => {
    resetToFirstPage();
  }, [debouncedSearch, selectedStoreId, limit, sortBy, sortOrder, filtersKey, ruleId, ttype, resetToFirstPage]);

  const listQuery = useQuery({
    queryKey: isRuleScoped
      ? ruleKeys.updateProductList(ruleId, {
        storeId: String(storeId || ""),
        page,
        limit,
        search: debouncedSearch.trim(),
        filters: apiFilters,
        ttype,
        ...sortParams
      })
      : ruleKeys.productList({
        storeId: String(storeId || ""),
        page,
        limit,
        search: debouncedSearch.trim(),
        filters: apiFilters,
        ttype,
        ...sortParams
      }),
    queryFn: async () => fetchProductPage(buildListPayload(page, limit, debouncedSearch), getCookie(TOKEN_NAME)),
    enabled: Boolean(token && storeId && (!isRuleScoped || ruleId)),
    retry: false,
    placeholderData: (previous) => previous
  });

  const filterFields = listQuery.data?.filterFields ?? [];
  const dateFilterField = getDateFilterField(filterFields);

  useEffect(() => {
    const name = dateFilterField?.fieldName || dateFilterField?.field || "";
    if (!name) return;
    setResolvedDateFieldName((prev) => (prev === name ? prev : name));
  }, [dateFilterField?.fieldName, dateFilterField?.field]);

  const filterFieldsForBar = useMemo(
    () =>
      excludeDateFilterFields(filterFields).filter((field) => {
        const key = String(field?.fieldName || field?.field_name || field?.field || "")
          .trim()
          .toLowerCase();
        return key !== "sku";
      }),
    [filterFields]
  );

  const appliedFiltersForBar = useMemo(() => {
    const key = String(resolvedDateFieldName || dateRange?.field || "").trim();
    if (!key) return appliedFilters;
    return appliedFilters.filter(
      (item) =>
        String(item?.fieldName || "").trim() !== key &&
        String(item?.field || "").trim() !== key
    );
  }, [appliedFilters, resolvedDateFieldName, dateRange?.field]);

  const rows = listQuery.data?.rows ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;
  const totalRecords = listQuery.data?.totalRecords ?? 0;
  const currentPage = listQuery.data?.page ?? page;
  const showInitialLoader = listQuery.isLoading && !listQuery.data;

  useEffect(() => {
    if (!Array.isArray(rows) || !rows.length) return;
    rememberProductRows(rows);
  }, [rows, rememberProductRows]);

  useEffect(() => {
    if (!isRuleScoped || selectionTouched) return;
    if (!listQuery.isSuccess) return;
    const pageRows = listQuery.data?.rows;
    if (!Array.isArray(pageRows)) return;

    const next = mergePageSelectionFromFlags(selectedIdsRef.current, pageRows);
    if (!sameIdList(selectedIdsRef.current, next)) {
      emitSelection(next, pageRows);
    }
  }, [emitSelection, isRuleScoped, selectionTouched, listQuery.isSuccess, listQuery.dataUpdatedAt]);

  const handleSortChange = (nextSortBy) => {
    const field = String(nextSortBy || "").trim();
    if (!field || field === "asin") return;

    if (sortBy === field) {
      if (sortOrder === "DESC") {
        setSortOrder("ASC");
      } else {
        setSortBy(DATE_FIELD_FALLBACK);
        setSortOrder("DESC");
      }
      return;
    }

    setSortBy(field);
    setSortOrder("DESC");
  };

  const toggleRow = (id) => {
    if (readOnly) return;
    const exists = hasId(selectedIds, id);
    setSelectionTouched(true);
    const row = rows.find((item, index) => String(getProductRowId(item, index)) === String(id));
    if (exists) {
      emitSelection(selectedIds.filter((item) => String(item) !== String(id)));
      return;
    }
    emitSelection([...selectedIds, id], row ? [row] : []);
  };

  const fetchAllMatchingProducts = async () => {
    const tokenNow = getCookie(TOKEN_NAME);
    const batchLimit = Math.max(Number(totalRecords) || 0, limit, 1);
    const first = await fetchProductPage(buildListPayload(1, batchLimit), tokenNow);

    let allRows = [...(first.rows || [])];
    const expected = Number(first.totalRecords) || Number(totalRecords) || allRows.length;
    let totalPagesLocal = Number(first.totalPages) || 1;
    let pageNum = 1;

    while (allRows.length < expected && pageNum < totalPagesLocal) {
      pageNum += 1;
      const next = await fetchProductPage(buildListPayload(pageNum, batchLimit), tokenNow);
      totalPagesLocal = Number(next.totalPages) || totalPagesLocal;
      allRows = allRows.concat(next.rows || []);
    }

    const seen = new Set();
    const ids = [];
    const uniqueRows = [];
    for (const row of allRows) {
      const id = getProductRowId(row);
      if (!id) continue;
      const key = String(id);
      if (seen.has(key)) continue;
      seen.add(key);
      ids.push(id);
      uniqueRows.push(row);
    }
    return { ids, rows: uniqueRows };
  };

  const togglePage = async (pageIds, selectAll) => {
    if (readOnly || selectingAll) return;
    setSelectionTouched(true);

    if (!selectAll) {
      const allMatchingSelected = totalRecords > 0 && selectedIds.length >= totalRecords;
      if (allMatchingSelected) {
        emitSelection([]);
        return;
      }
      const pageSet = new Set(pageIds.map((id) => String(id)));
      emitSelection(selectedIds.filter((id) => !pageSet.has(String(id))));
      return;
    }

    setSelectingAll(true);
    try {
      const { ids, rows: allRows } = await fetchAllMatchingProducts();
      emitSelection(ids, allRows);
    } catch {
      void 0;
    } finally {
      setSelectingAll(false);
    }
  };

  const displaySelectedKeys = useMemo(() => {
    if (!isRuleScoped || selectionTouched) return selectedIds;
    return mergePageSelectionFromFlags(selectedIds, rows);
  }, [isRuleScoped, selectionTouched, selectedIds, rows]);

  const selectionSummary = getSelectionSummary({
    readOnly,
    selectingAll,
    selectedCount: displaySelectedKeys.length,
    totalRecords
  });

  return (
    <div id="products" className="min-w-0">
      <RuleSection
        title="Product list"
        description={
          readOnly
            ? "Products selected for this rule."
            : "Select one or more products this rule should apply to."
        }
        splitHeader={splitHeader}
      >
        <div className="mb-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <p className="text-[12px] font-medium text-[var(--ink-muted)]" aria-live="polite">
            {selectionSummary}
          </p>
          <FieldErrorTooltip
            id="products-error"
            show={Boolean(error)}
            message={error}
            className="mt-0"
          />
        </div>

        {!storeId ? (
          <TableStatusPanel
            title="No store selected"
            description="Select a store from the header to load products."
          />
        ) : (
          <div className="table-panel overflow-visible">
            <TableFilter
              filterFields={filterFieldsForBar}
              columns={orderedColumns}
              visibleColumns={visibleColumns}
              appliedFilters={appliedFiltersForBar}
              onAppliedFiltersChange={setAppliedFilters}
              leadingSlot={
                <TableSearch
                  value={search}
                  onChange={setSearch}
                />
              }
              trailingSlot={
                <div className="table-toolbar__tools">
                  <TableSelect
                    value={ttype}
                    onChange={setTtype}
                    options={PRODUCT_TTYPE_OPTIONS}
                    ariaLabel="Product targeting type"
                    className="table-toolbar__type !min-w-[88px] max-w-[132px]"
                  />
                  <TableLimit value={limit} onChange={setLimit} />
                </div>
              }
              endSlot={
                <TableColumns
                  columns={orderedColumns}
                  isColumnVisible={isColumnVisible}
                  isColumnLocked={isColumnLocked}
                  setColumnVisible={setColumnVisible}
                  visibleCount={visibleCount}
                />
              }
              dateSlot={
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
                        DATE_FIELD_FALLBACK
                    })
                  }
                  onClear={clearDateRange}
                />
              }
            />

            {showInitialLoader ? (
              <TableLoadingSpinner label="Fetching products..." />
            ) : (
              <div className={listQuery.isFetching ? "opacity-70" : ""}>
                <Table
                  columns={visibleColumns}
                  rows={rows}
                  getRowId={getProductRowId}
                  constrainHeight={false}
                  startIndex={(currentPage - 1) * limit + 1}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  sortingDisabled={listQuery.isFetching || selectingAll}
                  selectable
                  selectedKeys={displaySelectedKeys}
                  onToggleRow={readOnly ? undefined : toggleRow}
                  onTogglePage={readOnly ? undefined : togglePage}
                  selectionDisabled={selectingAll}
                  selectionLocked={readOnly}
                  emptyMessage={readOnly ? "No products selected" : "No data found"}
                  emptyDescription={null}
                  page={currentPage}
                  totalPages={totalPages}
                  totalRecords={totalRecords}
                  pageSize={limit}
                  entityName="products"
                  paginationDisabled={listQuery.isFetching}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        )}
      </RuleSection>
    </div>
  );
}
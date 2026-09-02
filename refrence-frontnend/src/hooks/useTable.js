import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../context/StoreContext";
import {
  getAppliedFilters,
  getDateRangeForTable,
  getHiddenColumns,
  scopeTableId,
  setAppliedFiltersForTable,
  setDateRangeForTable,
  setHiddenColumns
} from "../utils/storage";

const EMPTY_RANGE = {
  operator: null,
  startDate: null,
  endDate: null,
  preset: null
};

const PINNED_DATE_KEYS = new Set([
  "report_date",
  "start_date",
  "end_date",
  "created_at"
]);

const PINNED_DATE_LABELS = new Set([
  "date",
  "start date",
  "end date",
  "created at"
]);

function columnKeyOf(column) {
  return String(column?.key || "").trim();
}

export function isDateColumn(column) {
  if (!column) return false;
  if (column.pin === "start") return true;
  const key = columnKeyOf(column).toLowerCase();
  const label = String(column.label || "").trim().toLowerCase();
  return PINNED_DATE_KEYS.has(key) || PINNED_DATE_LABELS.has(label);
}

export function isLockedColumn(column) {
  if (!column) return false;
  if (column.hideable === false || column.locked) return true;
  const key = columnKeyOf(column).toLowerCase();
  const label = String(column.label || "").trim().toLowerCase();
  return key === "report_date" || label === "date";
}

export function pinDateColumnsFirst(columns = []) {
  const dates = [];
  const rest = [];
  for (const column of columns) {
    if (isDateColumn(column)) dates.push(column);
    else rest.push(column);
  }
  return dates.length ? [...dates, ...rest] : columns;
}

function useTableColumnVisibility(tableId, columns = []) {
  const orderedColumns = useMemo(() => pinDateColumnsFirst(columns), [columns]);
  const lockedKeys = useMemo(
    () =>
      new Set(
        orderedColumns
          .filter(isLockedColumn)
          .map((column) => columnKeyOf(column))
          .filter(Boolean)
      ),
    [orderedColumns]
  );
  const columnKeys = useMemo(
    () => orderedColumns.map(columnKeyOf).filter(Boolean),
    [orderedColumns]
  );
  const columnKeysSignature = columnKeys.join("|");
  const lockedKeysSignature = [...lockedKeys].join("|");

  const sanitizeHidden = useCallback(
    (keys = []) =>
      keys
        .map(String)
        .filter((key) => columnKeys.includes(key) && !lockedKeys.has(key)),
    [columnKeys, lockedKeys]
  );

  const [hiddenKeys, setHiddenKeysState] = useState(() =>
    sanitizeHidden(getHiddenColumns(tableId))
  );

  useEffect(() => {
    const allowed = new Set(columnKeysSignature ? columnKeysSignature.split("|") : []);
    let stored = sanitizeHidden(getHiddenColumns(tableId).filter((key) => allowed.has(key)));

    if (allowed.size > 0 && stored.length >= allowed.size) {
      stored = [];
      setHiddenColumns(tableId, []);
    } else if (stored.length !== getHiddenColumns(tableId).length) {
      setHiddenColumns(tableId, stored);
    }

    setHiddenKeysState(stored);
  }, [tableId, columnKeysSignature, lockedKeysSignature, sanitizeHidden]);

  const persistHidden = useCallback(
    (nextHidden) => {
      const safe = sanitizeHidden(nextHidden);
      setHiddenKeysState(safe);
      setHiddenColumns(tableId, safe);
    },
    [sanitizeHidden, tableId]
  );

  const isColumnVisible = useCallback(
    (key) => lockedKeys.has(String(key)) || !hiddenKeys.includes(String(key)),
    [hiddenKeys, lockedKeys]
  );

  const isColumnLocked = useCallback(
    (key) => lockedKeys.has(String(key)),
    [lockedKeys]
  );

  const visibleColumns = useMemo(() => {
    const filtered = orderedColumns.filter((column) => isColumnVisible(column.key));
    return filtered.length > 0 ? filtered : orderedColumns;
  }, [orderedColumns, isColumnVisible]);

  const visibleCount = useMemo(
    () => columnKeys.filter((key) => isColumnVisible(key)).length,
    [columnKeys, isColumnVisible]
  );

  const setColumnVisible = useCallback(
    (key, visible) => {
      const columnKey = String(key);
      if (!columnKeys.includes(columnKey) || lockedKeys.has(columnKey)) return;

      if (visible) {
        persistHidden(hiddenKeys.filter((item) => item !== columnKey));
        return;
      }

      if (visibleCount <= 1) return;
      if (hiddenKeys.includes(columnKey)) return;
      persistHidden([...hiddenKeys, columnKey]);
    },
    [columnKeys, hiddenKeys, lockedKeys, persistHidden, visibleCount]
  );

  return {
    columns: orderedColumns,
    visibleColumns,
    isColumnVisible,
    isColumnLocked,
    setColumnVisible,
    visibleCount
  };
}

function useTableAppliedFilters(tableId) {
  const [appliedFilters, setAppliedFiltersState] = useState(() =>
    getAppliedFilters(tableId)
  );

  useEffect(() => {
    setAppliedFiltersState(getAppliedFilters(tableId));
  }, [tableId]);

  const setAppliedFilters = useCallback(
    (next) => {
      setAppliedFiltersState((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        const list = Array.isArray(resolved) ? resolved : [];
        setAppliedFiltersForTable(tableId, list);
        return list;
      });
    },
    [tableId]
  );

  return { appliedFilters, setAppliedFilters };
}

function useTableDateRange(tableId) {
  const [dateRange, setDateRangeState] = useState(
    () => getDateRangeForTable(tableId) || EMPTY_RANGE
  );

  useEffect(() => {
    setDateRangeState(getDateRangeForTable(tableId) || EMPTY_RANGE);
  }, [tableId]);

  const setDateRange = useCallback(
    (next) => {
      setDateRangeState(() => {
        const resolved =
          typeof next === "function"
            ? next(getDateRangeForTable(tableId) || EMPTY_RANGE)
            : next;
        const range = resolved && typeof resolved === "object" ? resolved : EMPTY_RANGE;
        setDateRangeForTable(tableId, range);
        return getDateRangeForTable(tableId) || EMPTY_RANGE;
      });
    },
    [tableId]
  );

  const clearDateRange = useCallback(() => {
    setDateRangeForTable(tableId, null);
    setDateRangeState(EMPTY_RANGE);
  }, [tableId]);

  return { dateRange, setDateRange, clearDateRange };
}

export function useTable(tableId, columns = []) {
  const { selectedStoreId } = useStore();
  const scopedTableId = useMemo(
    () => scopeTableId(tableId, selectedStoreId),
    [tableId, selectedStoreId]
  );
  const columnVisibility = useTableColumnVisibility(scopedTableId, columns);
  const { appliedFilters, setAppliedFilters } = useTableAppliedFilters(scopedTableId);
  const { dateRange, setDateRange, clearDateRange } = useTableDateRange(scopedTableId);

  return {
    ...columnVisibility,
    appliedFilters,
    setAppliedFilters,
    dateRange,
    setDateRange,
    clearDateRange
  };
}

export default useTable;
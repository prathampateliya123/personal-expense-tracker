import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '../components/ui/Icons';
import Button from '../components/ui/Button';
import DateRangePicker from "../components/ui/DateRangePicker";
import Table, {
  TableLimit,
  TableSearch,
  DEFAULT_TABLE_LIMIT
} from "../components/table/Table";
import { MessageBox } from '../components/ui/MessageBox';
import ConfirmModal from "../components/modal/ConfirmModal";
import { TableSkeleton, TableStatusPanel } from "../components/table/TableState";
import { useStore } from "../context/StoreContext";
import { ruleKeys } from "../services/queryKeys";
import { deleteRule, listRules } from "../services/ruleService";
import { debounce, formatDateTime } from "../utils/helper";
import { getCookie, TOKEN_NAME } from "../utils/cookie";
import { serializeDateRangeFilter } from "../utils/report";
import { normalizeRuleLevel } from "../utils/ruleReportsConfig";

function parseRulesListResponse(res) {
  const payload = res?.data;
  const items = Array.isArray(payload?.data) ? payload.data : [];
  const totalRecords = Number(payload?.totalRecords ?? items.length) || 0;
  const totalPages = Math.max(1, Number(payload?.totalPages ?? 1) || 1);

  return {
    items,
    totalRecords,
    totalPages,
    page: Number(payload?.page ?? 1) || 1,
    filter_name: Array.isArray(payload?.filter_name) ? payload.filter_name : []
  };
}

const EMPTY_DATE = {
  operator: null,
  startDate: null,
  endDate: null,
  preset: null
};

const getRuleRowId = (rule, index = 0) => rule?.id ?? index;

function isMasterRuleFlag(row) {
  return Boolean(row?.is_master_rule);
}

export default function RuleList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = getCookie(TOKEN_NAME);
  const { selectedStore, selectedStoreId } = useStore();
  const storeId = selectedStoreId || selectedStore?.id || 0;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceSearch = useMemo(() => debounce(setDebouncedSearch, 400), []);
  const [dateRange, setDateRange] = useState(EMPTY_DATE);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_TABLE_LIMIT);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [deleteModalRule, setDeleteModalRule] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, token]);

  useEffect(() => {
    debounceSearch(search);
    return () => debounceSearch.cancel();
  }, [search, debounceSearch]);

  useEffect(() => {
    setSearch("");
    setDebouncedSearch("");
    setDateRange(EMPTY_DATE);
    setPage(1);
  }, [storeId]);

  const listParams = useMemo(
    () => ({
      storeId: Number(storeId) || 0,
      page: Number(page),
      limit: Number(limit),
      search: String(debouncedSearch || "").trim(),
      sortBy,
      sortOrder,
      dateRange
    }),
    [storeId, page, limit, debouncedSearch, sortBy, sortOrder, dateRange]
  );

  const listQuery = useQuery({
    queryKey: ruleKeys.list(listParams),
    queryFn: async () => {
      const dateFilterObj = serializeDateRangeFilter(dateRange, {
        fieldName: "created_at"
      });
      const filters = dateFilterObj ? [dateFilterObj] : [];
      const res = await listRules(
        {
          store_id: Number(storeId),
          page: Number(page),
          limit: Number(limit),
          search: String(debouncedSearch || "").trim(),
          sortby: sortBy,
          sortorder: sortOrder,
          filters
        },
        token
      );
      return parseRulesListResponse(res);
    },
    enabled: Boolean(token && storeId && selectedStore?.sync_per === 100),
    retry: false,
    placeholderData: (previous) => previous
  });

  const deleteMutation = useMutation({
    mutationFn: async (rule) => {
      return deleteRule(
        { store_id: Number(storeId), rule_id: Number(rule.id) },
        token
      );
    },
    onSuccess: async (res) => {
      MessageBox("success", res?.message || "Rule deleted successfully.");
      setDeleteModalRule(null);
      await queryClient.invalidateQueries({ queryKey: ruleKeys.all });
    }
  });

  const handleSort = (fieldKey) => {
    if (sortBy === fieldKey) {
      setSortOrder((prev) => (prev === "DESC" ? "ASC" : "DESC"));
    } else {
      setSortBy(fieldKey);
      setSortOrder("DESC");
    }
    setPage(1);
  };

  const handleDelete = () => {
    if (!deleteModalRule) return;
    deleteMutation.mutate(deleteModalRule);
  };

  if (!token) return null;

  const rules = listQuery.data?.items ?? [];
  const totalRecords = listQuery.data?.totalRecords ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const loading = listQuery.isLoading && !listQuery.data;
  const fetching = listQuery.isFetching;
  const loadError = listQuery.isError && !listQuery.data;
  const deleting = deleteMutation.isPending;

  const columns = useMemo(
    () => [
      {
        key: "created_at",
        label: "Created At",
        sortKey: "created_at",
        accessor: (row) => (row.created_at ? formatDateTime(row.created_at) : "-")
      },
      {
        key: "rule_name",
        label: "Rule Name",
        sortKey: "rule_name",
        accessor: (row) => row.rule_name || "Untitled Rule",
        render: (value) => (
          <span className="font-semibold text-[var(--ink)]">{value}</span>
        )
      },
      {
        key: "report_name",
        label: "Report Name",
        sortKey: "report_name",
        truncate: true,
        maxWidth: "280px",
        accessor: (row) => row.report_name || row.reportName || "-"
      },
      {
        key: "rule_level",
        label: "Rule Level",
        sortKey: "rule_level",
        accessor: (row) => {
          const level =
            normalizeRuleLevel(row.rule_level ?? row.ruleLevel) ||
            String(row.rule_level || row.ruleLevel || "").trim();
          if (!level) return "-";
          if (level === "account") return "Account";
          if (level === "product") return "Product";
          return level;
        }
      },
      {
        key: "is_manual",
        label: "Type",
        sortKey: "is_manual",
        accessor: (row) => row.is_manual,
        render: (isManual) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isManual
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
          >
            {isManual ? "Manual" : "Automated"}
          </span>
        )
      },
      {
        key: "is_master_rule",
        label: "Master Rule",
        sortKey: "is_master_rule",
        accessor: (row) => isMasterRuleFlag(row),
        render: (isMaster) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isMaster
                ? "bg-[var(--brand-orange-soft)] text-[var(--brand-orange-strong)] border border-[var(--brand-orange)]/25"
                : "bg-[var(--canvas)] text-[var(--ink-muted)] border border-[var(--border)]"
              }`}
          >
            {isMaster ? "True" : "False"}
          </span>
        )
      },
      // {
      //   key: "group_name",
      //   label: "Group Name",
      //   sortKey: "group_name",
      //   accessor: (row) => row.group_name || "—"
      // },
      {
        key: "actions",
        label: "Action",
        sortable: false,
        align: "right",
        render: (_value, row) => {
          const rId = getRuleRowId(row);
          return (
            <div className="inline-flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => navigate(`/rule-builder/details/${rId}`)}
                title="View Details"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] text-[var(--ink-muted)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)] transition-colors cursor-pointer sm:h-auto sm:w-auto sm:p-1.5"
              >
                <EyeIcon className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate(`/rule-builder/edit/${rId}`)}
                title="Edit Rule"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] text-[var(--ink-muted)] hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer sm:h-auto sm:w-auto sm:p-1.5"
              >
                <PencilSquareIcon className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalRule(row)}
                title="Delete Rule"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] text-[var(--ink-muted)] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer sm:h-auto sm:w-auto sm:p-1.5"
              >
                <TrashIcon className="h-4.5 w-4.5" />
              </button>
            </div>
          );
        }
      }
    ],
    [navigate]
  );

  return (
    <>
    <div className="page-shell space-y-4 sm:space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0 px-0.5 py-0.5 sm:py-1">
          <div className="min-w-0">
            <h1 className="page-title">Rule Automation</h1>
          </div>
        </div>
        <div className="table-panel min-w-0 max-w-full overflow-visible">
          <div className="relative z-20 rounded-t-[7px] border-b border-[var(--border)] bg-[var(--canvas)] px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="table-toolbar">
              <div className="table-toolbar__row">
                <div className="table-toolbar__search">
                  <div className="table-toolbar__search-field">
                    <TableSearch
                      value={search}
                      onChange={(val) => {
                        setSearch(val);
                        setPage(1);
                      }}
                    />
                  </div>
                </div>

                <div className="table-toolbar__controls">
                  <div className="table-toolbar__control-row">
                    <div className="table-toolbar__tools-wrap">
                      <div className="table-toolbar__tools">
                        <TableLimit
                          value={limit}
                          onChange={(newLimit) => {
                            setLimit(newLimit);
                            setPage(1);
                          }}
                        />
                      </div>
                    </div>

                    <div className="table-toolbar__controls-end">
                      <Button
                        type="button"
                        size="md"
                        onClick={() => navigate("/rule-builder/create")}
                        className="h-[42px] shrink-0 text-[14px] sm:text-[15px]"
                      >
                        <PlusIcon className="h-4 w-4 stroke-[2.5]" aria-hidden />
                        Add Rule
                      </Button>
                    </div>

                    <div className="table-toolbar__date">
                      <DateRangePicker
                        className="w-full"
                        startDate={dateRange?.startDate}
                        endDate={dateRange?.endDate}
                        operator={dateRange?.operator}
                        preset={dateRange?.preset}
                        onApply={(next) => {
                          setDateRange(next || EMPTY_DATE);
                          setPage(1);
                        }}
                        onClear={() => {
                          setDateRange(EMPTY_DATE);
                          setPage(1);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={8} />
          ) : loadError ? (
            <TableStatusPanel
              tone="error"
              title="Couldn't load rules"
              description="Check your connection and try again."
              actionLabel="Retry"
              onAction={() => listQuery.refetch()}
            />
          ) : (
            <div className={fetching ? "opacity-70" : undefined}>
              <Table
                columns={columns}
                rows={storeId ? rules : []}
                getRowId={getRuleRowId}
                startIndex={(page - 1) * limit + 1}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSort}
                sortingDisabled={fetching}
                emptyMessage={!storeId ? "Select a store" : "No data found"}
                emptyDescription={
                  !storeId ? "Choose a store from the header to load rules." : null
                }
                emptyActionLabel={null}
                onEmptyAction={null}
                page={page}
                totalPages={storeId ? totalPages : 1}
                totalRecords={storeId ? totalRecords : 0}
                pageSize={limit}
                entityName="rules"
                paginationDisabled={fetching || !storeId}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={Boolean(deleteModalRule)}
        title="Delete Rule"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[var(--ink)]">
              &quot;{deleteModalRule?.rule_name}&quot;
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        danger
        confirming={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setDeleteModalRule(null);
        }}
      />
    </>
  );
}
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CountryFlag from "../components/store/CountryFlag";
import SyncProgress from "../components/store/SyncProgress";
import Button from "../components/ui/Button";
import { PlusIcon } from "../components/ui/Icons";
import Table, { TableSearch } from "../components/table/Table";
import { TableSkeleton, TableStatusPanel } from "../components/table/TableState";
import { useStore } from "../context/StoreContext";
import userService from "../services/userService";
import { storeKeys } from "../services/queryKeys";
import { debounce, formatDateTime } from "../utils/helper";
import { getCookie, TOKEN_NAME } from "../utils/cookie";
import { normalizeStoreListResponse } from "../utils/storage";

const getStoreRowId = (store, index = 0) => store?.id ?? index;

export default function Stores() {
  const navigate = useNavigate();
  const token = getCookie(TOKEN_NAME);
  const { selectedStore, selectStore } = useStore();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceSearch = useMemo(() => debounce(setDebouncedSearch, 400), []);

  useEffect(() => {
    if (!token) {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, token]);

  useEffect(() => {
    debounceSearch(search);
    return () => debounceSearch.cancel();
  }, [search, debounceSearch]);

  const searchParam = String(debouncedSearch || "").trim();

  const listQuery = useQuery({
    queryKey: storeKeys.listFiltered({ search: searchParam, token }),
    queryFn: async () => {
      const data = await userService.listAmazonStores(getCookie(TOKEN_NAME), {
        search: searchParam
      });
      return normalizeStoreListResponse(data);
    },
    enabled: Boolean(token),
    retry: false,
    placeholderData: (previous) => previous
  });

  const columns = useMemo(
    () => [
      {
        key: "store_name",
        label: "Store",
        sortable: false,
        minWidth: "180px",
        accessor: (row) => row.store_name || "Untitled store",
        render: (_value, row) => {
          const selected = String(row.id) === String(selectedStore?.id);
          const brandLabel =
            row.brand_name &&
            row.brand_name.toLowerCase() !== String(row.store_name || "").toLowerCase()
              ? row.brand_name
              : row.timezone || null;

          return (
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-[14px] font-medium text-[var(--ink)]">
                  {row.store_name || "Untitled store"}
                </p>
                {selected ? (
                  <span className="shrink-0 rounded-[7px] bg-[var(--brand-orange)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Current
                  </span>
                ) : null}
              </div>
              {brandLabel ? (
                <p className="mt-0.5 truncate text-[12px] font-normal text-[var(--ink-subtle)]">
                  {brandLabel}
                </p>
              ) : null}
            </div>
          );
        }
      },
      {
        key: "country_code",
        label: "Country",
        sortable: false,
        minWidth: "120px",
        render: (_value, row) => (
          <div className="flex items-center gap-2">
            {row.country_code ? <CountryFlag countryCode={row.country_code} /> : null}
            <div className="leading-tight">
              <p className="text-[14px] font-medium text-[var(--ink)]">
                {row.country_code || "—"}
              </p>
              {row.currency_code ? (
                <p className="text-[12px] font-normal text-[var(--ink-subtle)]">
                  {row.currency_code}
                </p>
              ) : null}
            </div>
          </div>
        )
      },
      {
        key: "account_type",
        label: "Type",
        sortable: false,
        minWidth: "100px",
        accessor: (row) => row.account_type || "—",
        render: (value) => (
          <span className="text-[13px] font-medium uppercase tracking-wide text-[var(--ink)]">
            {value}
          </span>
        )
      },
      {
        key: "sync_per",
        label: "Sync",
        sortable: false,
        minWidth: "80px",
        render: (_value, row) => (
          <SyncProgress value={row.sync_per} size={36} strokeWidth={3.5} showLabel={false} />
        )
      },
      {
        key: "created_at",
        label: "Created",
        sortable: false,
        minWidth: "140px",
        accessor: (row) => (row.created_at ? formatDateTime(row.created_at) : "—")
      },
      {
        key: "actions",
        label: "Action",
        sortable: false,
        align: "right",
        minWidth: "110px",
        render: (_value, row) => {
          const selected = String(row.id) === String(selectedStore?.id);
          return (
            <button
              type="button"
              onClick={() => selectStore(row.id)}
              disabled={selected}
              className={`min-h-11 min-w-[88px] rounded-[7px] px-3 py-2.5 text-[13px] font-semibold transition-opacity cursor-pointer disabled:cursor-default ${
                selected
                  ? "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-subtle)]"
                  : "bg-[var(--brand-orange)] text-white hover:opacity-90"
              }`}
            >
              {selected ? "Selected" : "Select"}
            </button>
          );
        }
      }
    ],
    [selectedStore?.id, selectStore]
  );

  if (!token) {
    return null;
  }

  const stores = listQuery.data ?? [];
  const loading = listQuery.isLoading && !listQuery.data;
  const fetching = listQuery.isFetching;
  const loadError = listQuery.isError && !listQuery.data;

  return (
    <div className="page-shell space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0 px-0.5 py-0.5 sm:py-1">
        <div className="min-w-0">
          <h1 className="page-title">All Stores</h1>
        </div>
        <Button
          type="button"
          size="md"
          onClick={() => navigate("/add-store")}
          className="w-full sm:w-auto shrink-0 text-[15px]"
        >
          <PlusIcon className="h-4 w-4 stroke-[2.5]" aria-hidden />
          Add New Store
        </Button>
      </div>

      <div className="table-panel min-w-0 max-w-full overflow-visible">
        <div className="flex flex-col gap-3 rounded-t-[7px] border-b border-[var(--border)] p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between bg-[var(--surface)]">
          <div className="w-full lg:max-w-[280px]">
            <TableSearch value={search} onChange={setSearch} />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} />
        ) : loadError ? (
          <TableStatusPanel
            tone="error"
            title="Couldn't load stores"
            description="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => listQuery.refetch()}
          />
        ) : (
          <div className={fetching ? "opacity-70" : undefined}>
            <Table
              columns={columns}
              rows={stores}
              getRowId={getStoreRowId}
              startIndex={1}
              emptyMessage="No data found"
              emptyDescription={
                searchParam ? "Try a different search term." : "Add a store to get started."
              }
              emptyActionLabel={searchParam ? null : "Add New Store"}
              onEmptyAction={searchParam ? null : () => navigate("/add-store")}
              entityName="stores"
            />
          </div>
        )}
      </div>
    </div>
  );
}

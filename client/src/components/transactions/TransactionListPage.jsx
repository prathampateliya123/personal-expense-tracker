import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import StatCard from "../common/StatCard";
import TransactionTable from "./TransactionTable";
import { formatCurrency } from "../../utils/formatters";
import { handleApiError, showSuccessToast } from "../../hooks/useHandleError";

const TransactionListPage = ({
  title,
  subtitle,
  addLabel,
  addTo,
  entitySingular,
  entityPlural,
  itemsKey,
  service,
  queryKeys,
  initialFilters,
  tableProps,
}) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ ...initialFilters });

  const handleFiltersChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const listQuery = useQuery({
    queryKey: queryKeys.list(filters),
    queryFn: () => service.list(filters),
    placeholderData: (previous) => previous,
  });

  const statsQuery = useQuery({
    queryKey: queryKeys.stats(),
    queryFn: async () => {
      const data = await service.getStats();
      return data.stats;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => service.remove(id),
    onSuccess: async () => {
      showSuccessToast(`${entitySingular} deleted successfully`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: handleApiError,
  });

  const listData = listQuery.data;
  const items = listData?.[itemsKey] ?? [];
  const totalCount = listData?.totalCount ?? 0;
  const totalPages = listData?.totalPages ?? 1;
  const currentPage = listData?.currentPage ?? filters.page;
  const totalAmount = listData?.totalAmount ?? 0;
  const stats = statsQuery.data;
  const loading = listQuery.isLoading || listQuery.isFetching;

  const monthLabel = useMemo(
    () =>
      stats
        ? new Date(stats.year, stats.month - 1).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })
        : "This month",
    [stats]
  );

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-textSecondary">{subtitle}</p>
        </div>
        <Link
          to={addTo}
          className="btn-primary shrink-0 self-start sm:self-auto"
        >
          {addLabel}
        </Link>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Filtered total"
          value={formatCurrency(totalAmount)}
          hint={`${totalCount} ${
            totalCount === 1 ? entitySingular.toLowerCase() : entityPlural
          } in current view`}
          hero
        />
        <StatCard
          label="Showing"
          value={items.length}
          hint={`Page ${currentPage} of ${totalPages}`}
        />
        <StatCard
          label={`${monthLabel} total`}
          value={formatCurrency(stats?.totalAmount)}
          hint={`All ${entityPlural} this month`}
        />
        <StatCard
          label={`${monthLabel} count`}
          value={stats?.count ?? 0}
          hint="Transactions this month"
        />
      </div>

      <TransactionTable
        filters={filters}
        onFiltersChange={handleFiltersChange}
        items={items}
        loading={loading && !deleteMutation.isPending}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={(page) => {
          if (page < 1 || page > totalPages) return;
          setFilters((prev) => ({ ...prev, page }));
        }}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        deleting={deleteMutation.isPending}
        {...tableProps}
      />
    </div>
  );
};

export default TransactionListPage;
